import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Change this to the email you signed up to Resend with.
const ADMIN_EMAIL = "olanrewajuadejumo56@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerName, phone, email, address, items, total } = await req.json();

    const itemsList = items
      .map((i: any) => `- ${i.name} × ${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`)
      .join("\n");

    await resend.emails.send({
      from: "Kayzee Orders <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `New Order — ₦${total.toLocaleString()} from ${customerName}`,
      text: `New paid order received.

Order ID: ${orderId}
Customer: ${customerName}
Phone: ${phone}
Email: ${email}
Delivery address: ${address}

Items:
${itemsList}

Total: ₦${total.toLocaleString()}

View in admin: https://kazy-systems.vercel.app/admin/order`,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Order notification failed:", error);
    // Don't fail the whole checkout over a notification issue —
    // the order is already saved in Firestore regardless.
    return NextResponse.json({ sent: false }, { status: 500 });
  }
}