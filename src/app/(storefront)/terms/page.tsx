import Link from "next/link";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#eef2f8)]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
      </header>
      <article className="prose prose-neutral mx-auto max-w-3xl px-6 pb-16">
        <h1>Terms of Use</h1>
        <p className="lead">
          By using the DSB Books website you agree to these terms. The site
          provides catalogue information and enquiry forms; online checkout may
          be added in a future phase.
        </p>
        <h2>Catalogue &amp; availability</h2>
        <p>
          Stock levels and prices are shown in good faith from our inventory
          system. Availability may change before we respond to your enquiry.
          Published prices are in Bhutanese Ngultrum (BTN) unless stated
          otherwise.
        </p>
        <h2>Enquiries</h2>
        <p>
          Submitting an enquiry does not create a binding order. Our staff will
          confirm availability, pricing, and pickup or delivery options by
          email or phone.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Book covers, descriptions, and site content remain the property of
          DSB Books, publishers, and respective rights holders. Do not reproduce
          without permission.
        </p>
        <h2>Limitation</h2>
        <p>
          The site is provided as-is. DSB Books is not liable for indirect
          damages arising from use of this website or reliance on catalogue
          data.
        </p>
      </article>
    </div>
  );
}
