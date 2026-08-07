import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How does seat availability stay accurate under high demand?",
    a: "Every booking runs inside a database transaction that checks and reserves seats atomically, so two people can't book the last seat at the same time.",
  },
  {
    q: "How does check-in work at the venue?",
    a: "Each ticket gets a unique QR code. Organizers scan it at the door — the system instantly shows valid, already used, wrong event, or cancelled.",
  },
  {
    q: "Can I get a refund after booking?",
    a: "Cancellation policies are set by the event organizer. You can cancel a confirmed booking from your dashboard where the organizer allows it.",
  },
  {
    q: "What does it cost to list an event?",
    a: "Creating an organizer account and publishing events is free. You set your own ticket prices.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
      </div>
      <Accordion multiple={false} className="w-full">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}