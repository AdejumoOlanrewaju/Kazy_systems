import { NextRequest, NextResponse } from "next/server";
import { clientKey, hashKey, rateLimit, tooMany } from "@/lib/server/rateLimit";
import { customerEmailEnabled, sendAdminEmail, sendCustomerEmail } from "@/lib/server/mailer";

// Must match the options on the repair form.
const ISSUES = [
  "Screen Replacement",
  "Performance Upgrade",
  "Virus Removal",
  "Hardware Repair",
  "Battery Replacement",
  "Keyboard Repair",
  "Other",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Single-line, trimmed, capped. Strips the characters used for header injection.
const oneLine = (value: unknown, max: number) =>
  String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request.");

    const name = oneLine(body.name, 80);
    const email = oneLine(body.email, 120).toLowerCase();
    const phone = oneLine(body.phone, 30);
    const laptopBrand = oneLine(body.laptopBrand, 80);
    const issue = oneLine(body.issue, 40);
    const description = String(body.description ?? "").trim().slice(0, 1500);

    if (!name) return fail("Please enter your name.");
    if (!EMAIL_RE.test(email)) return fail("Please enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a valid phone number.");
    if (!ISSUES.includes(issue)) return fail("Please choose an issue type.");
    if (description.length < 10) return fail("Please describe the problem in a few words.");

    // Limits keep this from being used to spam you or anyone else.
    const byIp = await rateLimit("repair-ip", clientKey(req), 5, 3600);
    if (!byIp.ok) return tooMany(byIp.retryAfter);
    const byEmail = await rateLimit("repair-email", hashKey(email), 3, 3600);
    if (!byEmail.ok) return tooMany(byEmail.retryAfter);

    // The admin email is what matters: if this fails, tell the customer.
    await sendAdminEmail(
      `Repair request — ${name}`,
      `New repair request submitted via email.

Name: ${name}
Email: ${email}
Phone: ${phone}
Laptop Brand/Model: ${laptopBrand || "Not specified"}
Issue Type: ${issue}

Description:
${description}`
    );

    // A confirmation to the customer is a bonus: fixed text, and only once a
    // verified domain exists. A failure here never fails the request.
    let customerEmailed = false;
    if (customerEmailEnabled()) {
      try {
        customerEmailed = await sendCustomerEmail(
          email,
          "We've received your repair request",
          `Hi ${name},

Thanks for reaching out. We've received your repair request (${issue}) and our team will get back to you shortly on ${phone}.

If it's urgent, you can also reach us on WhatsApp.

Kayzee Global Computer Networks`
        );
      } catch (error) {
        console.error("Repair confirmation email failed:", error);
      }
    }

    return NextResponse.json({ sent: true, customerEmailed });
  } catch (error) {
    console.error("Repair email notification failed:", error);
    return fail("We couldn't send your request. Please try WhatsApp instead.", 500);
  }
}