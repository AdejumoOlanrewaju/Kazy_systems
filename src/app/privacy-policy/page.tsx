import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kayzee Global Computer Networks collects, uses, and protects your personal information.",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Kayzee Global Computer Networks ("we," "us," "our") respects your privacy. This
              policy explains what information we collect when you use our website, how we use
              it, and the choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Name, email address, and phone number — when you place an order, submit a repair request, or contact us</li>
              <li>Delivery address — when you check out or request a repair pickup/drop-off</li>
              <li>Order details — items purchased, order value, and order status</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> collect or store your card or bank details. Payments are
              processed securely by Paystack, and your payment information goes directly to them —
              it never touches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To process and fulfil your orders and repair requests</li>
              <li>To contact you about your order, delivery, or repair status</li>
              <li>To respond to inquiries submitted through our contact or repair forms</li>
              <li>To improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Who We Share Data With</h2>
            <p className="mb-3">We share limited information with trusted third-party services that help us run our business:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Paystack</strong> — processes your payment; handles your card/bank details directly, per their own privacy policy</li>
              <li><strong>Google Firebase</strong> — securely stores order, product, and account data</li>
              <li><strong>Cloudinary</strong> — hosts product images (does not receive customer personal data)</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to anyone.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies & Local Storage</h2>
            <p>
              Our website uses your browser's local storage to remember items in your shopping
              cart between visits. This data stays on your device and is not sent to our servers
              until you complete checkout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Data Security</h2>
            <p>
              We take reasonable measures to protect your information, including restricting
              access to customer data to authorized staff only. However, no method of
              transmission over the internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information
              by contacting us using the details below. We will respond within a reasonable
              timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Children's Privacy</h2>
            <p>
              Our services are not directed at individuals under 18. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page
              with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contact Us</h2>
            <p>
              If you have questions about this policy or how your data is handled, reach us via
              the details on our{" "}
              <a href="/contact" className="text-slate-900 underline font-medium">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;