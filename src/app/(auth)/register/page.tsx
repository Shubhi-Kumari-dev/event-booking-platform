"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { registerSchema } from "@/lib/validations/auth.schema";
import { ROLES } from "@/lib/constants";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Client-only schema: same rules as backend + confirmPassword check
const clientSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<typeof ROLES.ATTENDEE | typeof ROLES.ORGANIZER>(
    ROLES.ATTENDEE
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = clientSchema.safeParse({ name, email, password, confirmPassword, role });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Account created but auto sign-in failed — send them to login instead
        router.push("/login");
        return;
      }

      router.push(role === ROLES.ORGANIZER ? "/organizer" : "/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "VALIDATION_ERROR" && err.details) {
          const flat = err.details as { fieldErrors?: Record<string, string[]> };
          const errors: FieldErrors = {};
          for (const [key, messages] of Object.entries(flat.fieldErrors ?? {})) {
            if (messages?.[0]) errors[key as keyof FieldErrors] = messages[0];
          }
          setFieldErrors(errors);
        } else if (err.code === "CONFLICT") {
          setFieldErrors((prev) => ({ ...prev, email: err.message }));
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ticket-stub rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Eventify to book or host events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!fieldErrors.confirmPassword}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">I want to</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole(ROLES.ATTENDEE)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                role === ROLES.ATTENDEE
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Attend events
            </button>
            <button
              type="button"
              onClick={() => setRole(ROLES.ORGANIZER)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                role === ROLES.ORGANIZER
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Host events
            </button>
          </div>
        </div>

        {formError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}