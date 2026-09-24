import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Same admin address used for order notifications — keep them in sync if this ever changes.
const ADMIN_EMAIL = "olanrewajuadejumo56@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, laptopBrand, issue, description } = await req.json();

    // 1. Notify the admin — this is the important one, mirrors the WhatsApp flow's purpose.
    await resend.emails.send({
      from: "Kayzee Repairs <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `New Repair Request — ${name}`,
      text: `New repair request submitted via email.

Name: ${name}
Email: ${email}
Phone: ${phone}
Laptop Brand/Model: ${laptopBrand || "Not specified"}
Issue Type: ${issue}

Description:
${description}`,
    });

    // 2. Confirm receipt to the customer — sets expectations, gives them something to point to.
    await resend.emails.send({
      from: "Kayzee Global Computer Networks <onboarding@resend.dev>",
      to: email,
      subject: "We've received your repair request",
      text: `Hi ${name},

Thanks for reaching out — we've received your repair request for your ${laptopBrand || "laptop"} (${issue}).

Our team will review the details and get back to you shortly at ${phone} or this email address.

If it's urgent, you can also reach us directly on WhatsApp.

— Kayzee Global Computer Networks`,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Repair email notification failed:", error);
    return NextResponse.json({ sent: false }, { status: 500 });
  }
}