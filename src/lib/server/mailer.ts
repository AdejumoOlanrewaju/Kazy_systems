import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "olanrewajuadejumo56@gmail.com";

// Customers can only be emailed from a domain you've verified in Resend. Set
// EMAIL_FROM (e.g. "Kayzee Global <orders@yourdomain.com>") once that's done.
// Until then customer emails are skipped, because Resend's shared sender
// refuses to deliver to anyone but you.
const CUSTOMER_FROM = process.env.EMAIL_FROM || "";

export const customerEmailEnabled = () => !!CUSTOMER_FROM;

// Subjects must never contain line breaks (header injection).
const cleanSubject = (s: string) => s.replace(/[\r\n]+/g, " ").trim().slice(0, 150);

// Resend can report a refused send as a returned `error` instead of throwing,
// so check for it, otherwise failures are silent.
async function send(payload: { from: string; to: string; subject: string; text: string }) {
  const result: any = await resend.emails.send(payload);
  if (result?.error) throw new Error(`Email failed: ${result.error.message ?? JSON.stringify(result.error)}`);
}

export async function sendAdminEmail(subject: string, text: string) {
  await send({
    from: CUSTOMER_FROM || "Kayzee Alerts <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: cleanSubject(subject),
    text,
  });
}

// Returns false (and sends nothing) while customer email isn't set up.
export async function sendCustomerEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!CUSTOMER_FROM) return false;
  await send({ from: CUSTOMER_FROM, to, subject: cleanSubject(subject), text });
  return true;
}