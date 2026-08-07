import type { CmsPage, CmsSection, ShippingZone } from "@/types/erp";

const now = "2026-08-07T00:00:00.000Z";

function page(
  partial: Omit<CmsPage, "id" | "created_at" | "updated_at" | "updated_by" | "hero_public_id"> & {
    id?: string;
  }
): CmsPage {
  return {
    id: partial.id ?? partial.slug,
    hero_public_id: null,
    updated_by: null,
    created_at: now,
    updated_at: now,
    ...partial,
  };
}

/** Fallback CMS content when Supabase tables are not yet migrated. */
export const FALLBACK_CMS_PAGES: CmsPage[] = [
  page({
    slug: "about",
    title: "About DSB",
    nav_label: "About",
    subtitle: "Bookstore, imprint, and Bhutan–Australia bridge.",
    body_md:
      "DSB Books is Bhutan's oldest bookstore on Chang Lam in Thimphu, home to the DSB Publication imprint. Explore our story, institutional work, and ways to partner.",
    seo_title: "About DSB Books",
    seo_description:
      "Learn about DSB Books, DSB Publication, and our Bhutan–Australia programmes.",
    template: "hub",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: true,
    sort_order: 0,
  }),
  page({
    slug: "about/founder",
    title: "Our Founder and Family Story",
    nav_label: "Founder & family",
    subtitle: "A family bookstore rooted in Thimphu.",
    body_md: `DSB Books grew as a family bookstore on Chang Lam — a place where readers, students, and visitors meet Bhutanese publishing.

*(Staff: replace this section in ERP Content with the real founder biography — names, dates, and photos as you wish them published.)*

Today the shop remains a living catalogue: DSB Publication titles beside carefully chosen books for schools, libraries, and travellers.`,
    seo_title: "Our Founder and Family Story · DSB Books",
    seo_description:
      "The family story behind DSB Books, Bhutan's oldest bookstore in Thimphu.",
    template: "article",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: false,
    sort_order: 10,
  }),
  page({
    slug: "about/publications",
    title: "DSB Publications",
    nav_label: "Publications",
    subtitle: "The DSB Publication imprint.",
    body_md: `DSB Publication is the publishing arm connected to our Thimphu bookstore. We develop, print, and distribute titles that serve readers in Bhutan and partners abroad.

Browse live stock in our [catalogue](/books), or [enquire](/enquiry?topic=general) about wholesale and institutional supply.`,
    seo_title: "DSB Publications",
    seo_description: "DSB Publication imprint — books from Bhutan's oldest bookstore.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "general",
    is_published: true,
    is_required: false,
    sort_order: 20,
  }),
  page({
    slug: "about/bhutan-australia",
    title: "Bhutan–Australia Bridge",
    nav_label: "Bhutan–Australia",
    subtitle:
      "Publishing, education, and cultural exchange between Bhutan and Australia.",
    body_md: `We work across Bhutan and Australia to move books, ideas, and programmes in both directions.

## What we offer

- Importing and distributing DSB publications in Australia
- Australian printing or print-on-demand
- Book events and author exchanges
- University, library and school relationships
- Australian sales, licensing and marketing
- Finding technology and educational partners
- Raising investment for permitted Bhutan projects
- Hosting Bhutan–Australia cultural and sustainability programs

[Partner with DSB](/about/partner) or [enquire](/enquiry?topic=australia).`,
    seo_title: "Bhutan–Australia Bridge · DSB",
    seo_description:
      "DSB's Bhutan–Australia bridge for publishing, education, and cultural programmes.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "australia",
    is_published: true,
    is_required: false,
    sort_order: 30,
  }),
  page({
    slug: "about/schools-universities-libraries",
    title: "Schools, Universities and Libraries",
    nav_label: "Schools & libraries",
    subtitle: "Institutional relationships for readers and educators.",
    body_md: `DSB works with schools, universities, and libraries on catalogue supply, reading programmes, and long-term collection building.

## Focus

- University, library and school relationships
- Title selection for classrooms and research
- Bulk and institutional enquiries through our store team

[Send an institutional enquiry](/enquiry?topic=schools).`,
    seo_title: "Schools, Universities and Libraries · DSB",
    seo_description:
      "Institutional supply and relationships for schools, universities, and libraries.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "schools",
    is_published: true,
    is_required: false,
    sort_order: 40,
  }),
  page({
    slug: "about/digital-knowledge-lab",
    title: "Digital Knowledge Lab",
    nav_label: "Digital Knowledge Lab",
    subtitle: "Digitisation, learning platforms, and Bhutanese digital content.",
    body_md: `The Digital Knowledge Lab is where DSB develops digital publishing and education technology services.

## Capabilities

- Digitising Bhutanese books and historical documents
- E-books and audiobooks
- Translation and multilingual publishing technology
- Educational course production
- Learning-management platforms
- Digital archives for cultural institutions
- Sustainability and environmental education content
- Technology services for Bhutanese schools, publishers and organisations
- Export of Bhutanese digital content and services

[Enquire about the Digital Knowledge Lab](/enquiry?topic=digital-lab).`,
    seo_title: "Digital Knowledge Lab · DSB",
    seo_description:
      "Digitisation, e-books, LMS, archives, and digital services from DSB.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "digital-lab",
    is_published: true,
    is_required: false,
    sort_order: 50,
  }),
  page({
    slug: "about/earth-community",
    title: "Earth and Community Impact",
    nav_label: "Earth & community",
    subtitle: "Sustainability education and community-minded publishing.",
    body_md: `DSB supports sustainability and environmental education through publishing and digital content — aligned with our Digital Knowledge Lab and Bhutan–Australia cultural programmes.

We do not invent impact metrics here. Ask us about current projects and how your school, library, or organisation can take part.

[Talk to us](/enquiry?topic=general).`,
    seo_title: "Earth and Community Impact · DSB",
    seo_description: "Sustainability and community education content from DSB Books.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "general",
    is_published: true,
    is_required: false,
    sort_order: 60,
  }),
  page({
    slug: "about/partner",
    title: "Partner With DSB",
    nav_label: "Partner",
    subtitle: "Technology, education, investment, and cultural programmes.",
    body_md: `We welcome partners who share a careful, long-term approach to Bhutanese publishing and education.

## Ways to partner

- Finding technology and educational partners
- Raising investment for permitted Bhutan projects
- Hosting Bhutan–Australia cultural and sustainability programs
- Distribution, licensing, and institutional supply

[Start a partner conversation](/enquiry?topic=partner).`,
    seo_title: "Partner With DSB",
    seo_description:
      "Partner with DSB on education, technology, investment, and cultural programmes.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "partner",
    is_published: true,
    is_required: false,
    sort_order: 70,
  }),
  page({
    slug: "about/international-orders",
    title: "International Orders",
    nav_label: "International orders",
    subtitle: "Ordering DSB titles from outside Bhutan.",
    body_md: `Readers, diaspora communities, and institutions can order through our online checkout when enabled, or by enquiry.

## How it works

1. Browse the [catalogue](/books) for live stock.
2. Add titles to your cart and choose **international shipping**, or [enquire](/enquiry?topic=international) if you need a quote first.
3. International card payments are processed securely; we confirm fulfilment timing after payment.

Australian partners may also use our [Bhutan–Australia Bridge](/about/bhutan-australia) channels for distribution and print-on-demand.

We do not promise fixed delivery dates on this page — staff confirm each shipment.`,
    seo_title: "International Orders · DSB Books",
    seo_description: "How to order DSB Books internationally — checkout or enquiry.",
    template: "article",
    show_enquire_cta: true,
    enquire_topic: "international",
    is_published: true,
    is_required: false,
    sort_order: 80,
  }),
  page({
    slug: "visit",
    title: "Visit the store",
    nav_label: "Visit",
    subtitle: "Bhutan's oldest bookstore in Thimphu.",
    body_md: `Come to Jojo's Shopping Complex on Chang Lam. Opening hours and contact details appear below and are kept current by our staff.

For school groups or author events, [send an enquiry](/enquiry?topic=general).`,
    seo_title: "Visit DSB Books · Thimphu",
    seo_description: "Visit DSB Books on Chang Lam, Thimphu — hours and contact.",
    template: "simple",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: true,
    sort_order: 90,
  }),
  page({
    slug: "enquiry",
    title: "Enquiry",
    nav_label: "Enquire",
    subtitle: "Ask about a title, school orders, partnership, or store pickup.",
    body_md: `Tell us what you need — a single title, institutional supply, Digital Knowledge Lab work, or an international order. We reply by email.`,
    seo_title: "Enquiry · DSB Books",
    seo_description:
      "Contact DSB Books about titles, schools, partners, or international orders.",
    template: "simple",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: true,
    sort_order: 100,
  }),
  page({
    slug: "privacy",
    title: "Privacy Policy",
    nav_label: "Privacy",
    subtitle: "How DSB Books handles information submitted through our website.",
    body_md: `## Information we collect

When you submit an enquiry or place an online order, we collect your name, email address, optional phone number, message, optional enquiry topic, and order/shipping details needed to fulfil your request.

Staff who use our internal systems authenticate separately; their profiles and roles are stored for access control.

## How we use it

We use this information to respond to enquiries, process orders, and operate the bookstore. We do not sell personal data to third parties.

## Payments

Card payments for online orders are processed by Stripe. We do not store full card numbers on our servers.

## Retention

Enquiries and orders are retained for customer service and operational records. Contact us to request deletion where applicable under local law.

## Contact

Questions about privacy: use our [enquiry form](/enquiry) or see the [visit page](/visit).`,
    seo_title: "Privacy Policy · DSB Books",
    seo_description: "Privacy policy for DSB Books website enquiries and orders.",
    template: "legal",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: true,
    sort_order: 110,
  }),
  page({
    slug: "terms",
    title: "Terms of Use",
    nav_label: "Terms",
    subtitle: "Terms for using the DSB Books website and online catalogue.",
    body_md: `## Catalogue and availability

Stock levels and prices are shown in good faith from our inventory. Availability may change. Prices are in Bhutanese Ngultrum (BTN) unless stated otherwise. Online card charges may be converted to USD at the rate shown at checkout.

## Enquiries

Submitting an enquiry does not create a binding order until we confirm in writing.

## Online orders

When online checkout is enabled, placing an order creates a purchase subject to stock confirmation and our fulfilment notes for pickup, Bhutan delivery, or international shipping. International shipments are confirmed after payment.

## Intellectual property

Book covers, descriptions, and site content remain the property of DSB Books, publishers, and respective rights holders.

## Limitation

The site is provided as-is. DSB Books is not liable for indirect damages arising from use of this website or reliance on catalogue data.`,
    seo_title: "Terms of Use · DSB Books",
    seo_description: "Terms of use for the DSB Books website and online orders.",
    template: "legal",
    show_enquire_cta: false,
    enquire_topic: null,
    is_published: true,
    is_required: true,
    sort_order: 120,
  }),
];

export const FALLBACK_CMS_SECTIONS: CmsSection[] = [
  {
    id: "1",
    key: "home.hero.eyebrow",
    label: "Hero eyebrow",
    value_text: "Thimphu · Chang Lam",
    value_md: null,
    is_published: true,
    sort_order: 10,
    updated_at: now,
  },
  {
    id: "2",
    key: "home.hero.headline",
    label: "Hero headline",
    value_text: "DSB Books",
    value_md: null,
    is_published: true,
    sort_order: 20,
    updated_at: now,
  },
  {
    id: "3",
    key: "home.hero.support",
    label: "Hero support",
    value_text:
      "Bhutan's oldest bookstore — a living digital catalogue of DSB publications. Search, browse, and know what's on the shelf.",
    value_md: null,
    is_published: true,
    sort_order: 30,
    updated_at: now,
  },
  {
    id: "4",
    key: "home.hero.cta_primary_label",
    label: "Primary CTA",
    value_text: "Browse catalogue",
    value_md: null,
    is_published: true,
    sort_order: 40,
    updated_at: now,
  },
  {
    id: "5",
    key: "home.hero.cta_secondary_label",
    label: "Secondary CTA",
    value_text: "Visit the store",
    value_md: null,
    is_published: true,
    sort_order: 50,
    updated_at: now,
  },
  {
    id: "6",
    key: "home.shelf.heading",
    label: "Shelf heading",
    value_text: "On the shelf",
    value_md: null,
    is_published: true,
    sort_order: 60,
    updated_at: now,
  },
  {
    id: "7",
    key: "home.shelf.support",
    label: "Shelf support",
    value_text: "Live availability from the Thimphu store inventory.",
    value_md: null,
    is_published: true,
    sort_order: 70,
    updated_at: now,
  },
  {
    id: "8",
    key: "home.about.heading",
    label: "About strip heading",
    value_text: "About DSB",
    value_md: null,
    is_published: true,
    sort_order: 80,
    updated_at: now,
  },
  {
    id: "9",
    key: "home.about.support",
    label: "About strip support",
    value_text:
      "A family bookstore and DSB Publication imprint — bridging Bhutan and Australia through books, education, and digital knowledge.",
    value_md: null,
    is_published: true,
    sort_order: 90,
    updated_at: now,
  },
  {
    id: "10",
    key: "home.about.cta_label",
    label: "About CTA",
    value_text: "Our story",
    value_md: null,
    is_published: true,
    sort_order: 100,
    updated_at: now,
  },
  {
    id: "11",
    key: "home.visit.heading",
    label: "Visit strip heading",
    value_text: "Visit the store",
    value_md: null,
    is_published: true,
    sort_order: 110,
    updated_at: now,
  },
  {
    id: "12",
    key: "home.visit.support",
    label: "Visit strip support",
    value_text:
      "Find us on Chang Lam in Thimphu — browse the shelves and speak with our team.",
    value_md: null,
    is_published: true,
    sort_order: 120,
    updated_at: now,
  },
  {
    id: "13",
    key: "home.visit.cta_label",
    label: "Visit CTA",
    value_text: "Store details",
    value_md: null,
    is_published: true,
    sort_order: 130,
    updated_at: now,
  },
];

export const FALLBACK_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "pickup",
    code: "pickup",
    label: "Store pickup (Thimphu)",
    fee_btn: 0,
    is_active: true,
    notes_md: "Collect from Jojo's Shopping Complex, Chang Lam.",
    sort_order: 10,
    created_at: now,
    updated_at: now,
  },
  {
    id: "bhutan",
    code: "bhutan",
    label: "Delivery within Bhutan",
    fee_btn: 150,
    is_active: true,
    notes_md: "We confirm delivery options and timing by email after your order.",
    sort_order: 20,
    created_at: now,
    updated_at: now,
  },
  {
    id: "international",
    code: "international",
    label: "International shipping",
    fee_btn: 2500,
    is_active: true,
    notes_md:
      "Card payment required. We confirm shipping timeline and any customs notes after payment.",
    sort_order: 30,
    created_at: now,
    updated_at: now,
  },
];

export const ENQUIRY_TOPICS = [
  { value: "general", label: "General" },
  { value: "title", label: "Specific title" },
  { value: "schools", label: "Schools" },
  { value: "libraries", label: "Libraries" },
  { value: "partner", label: "Partnership" },
  { value: "international", label: "International order" },
  { value: "australia", label: "Bhutan–Australia" },
  { value: "digital-lab", label: "Digital Knowledge Lab" },
  { value: "press", label: "Press" },
] as const;
