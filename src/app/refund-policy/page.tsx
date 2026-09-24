import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Returns Policy",
  description: "Our return, refund, and repair warranty policy at Kayzee Global Computer Networks.",
};

const RefundPolicyPage = () => {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Refund & Returns Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              We want you to be confident buying from us. This policy explains how returns,
              refunds, and repair warranties work.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Laptop Purchases — 7-Day Return Window</h2>
            <p className="mb-3">
              You may return a laptop purchased from us within <strong>7 days</strong> of delivery
              for a full refund, provided that:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>The item is in its original condition, with no new physical or liquid damage</li>
              <li>All original accessories (charger, box, documentation) are included</li>
              <li>The fault or reason for return is reported to us within the 7-day window</li>
            </ul>
            <p className="mt-3">
              To start a return, contact us via WhatsApp or our{" "}
              <a href="/contact" className="text-slate-900 underline font-medium">Contact page</a>{" "}
              with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Refund Timeline</h2>
            <p>
              Once we've received and inspected the returned item, approved refunds are processed
              back to your original payment method via Paystack within 5–10 business days,
              depending on your bank's processing time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Items Not Eligible for Return</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Items with damage caused after delivery (accidental drops, liquid damage, etc.)</li>
              <li>Items missing their original accessories or packaging</li>
              <li>Laptops that have had unauthorized repairs or modifications performed on them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Repair Services — 90-Day Warranty</h2>
            <p className="mb-3">
              All repair work carried out by us is covered by a <strong>90-day warranty</strong>{" "}
              against the same fault recurring. If the exact issue we repaired reoccurs within 90
              days, we will re-repair it at no additional cost.
            </p>
            <p>
              This warranty does not cover new, unrelated faults, or damage caused by misuse,
              accidents, or unauthorized third-party repairs after our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Repair Payments</h2>
            <p>
              Repair diagnostics are free. Once you approve a quoted repair and work has begun,
              that repair fee is non-refundable — but remains covered by the 90-day warranty above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">How to Request a Refund or Warranty Repair</h2>
            <p>
              Reach out via WhatsApp or our{" "}
              <a href="/contact" className="text-slate-900 underline font-medium">Contact page</a>{" "}
              with your order ID or repair details, and we'll guide you through next steps.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;