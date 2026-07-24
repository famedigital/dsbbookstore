import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#eef2f8)]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
      </header>
      <article className="prose prose-neutral mx-auto max-w-3xl px-6 pb-16">
        <h1>Privacy Policy</h1>
        <p className="lead">
          DSB Books (Thimphu) respects your privacy. This page describes how we
          handle information submitted through our website.
        </p>
        <h2>Information we collect</h2>
        <p>
          When you submit an enquiry, we collect your name, email address,
          optional phone number, and message. Staff ERP users authenticate via
          Supabase Auth; their profile and role are stored for access control.
        </p>
        <h2>How we use it</h2>
        <p>
          Enquiry details are used to respond to your request about books,
          orders, or store visits. We do not sell personal data to third parties.
        </p>
        <h2>Retention</h2>
        <p>
          Enquiries are retained in our database for customer service and
          operational records. Contact us to request deletion where applicable
          under local law.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about privacy: visit our{" "}
          <Link href="/visit">store page</Link> or use the{" "}
          <Link href="/enquiry">enquiry form</Link>.
        </p>
      </article>
    </div>
  );
}
