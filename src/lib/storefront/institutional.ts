export type InstitutionalSection = {
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string[];
  bullets?: string[];
};

/** Client-requested institutional sections for the DSB Books website. */
export const INSTITUTIONAL_SECTIONS: InstitutionalSection[] = [
  {
    href: "/about",
    label: "Our Story",
    eyebrow: "Our founder & family",
    title: "Our Founder and Family Story",
    summary:
      "Bhutan’s oldest bookstore on Chang Lam — family stewardship, DSB Publications, and decades of shelves at Jojo’s.",
    body: [
      "DSB Books is the public face of DSB Enterprises, rooted in Thimphu since the early 1990s. Travel writers still call it the country’s oldest bookstore — Buddhism and Bhutan titles, textbooks, fiction, magazines, and a staff who know the stock.",
      "Proprietor B.P. Bhattarai and the family behind the shop have kept reading accessible on Chang Lam while growing DSB Publication, school supply, and partnerships that now reach Australia and the Digital Knowledge Lab — without leaving Jojo’s Shopping Complex.",
    ],
  },
  {
    href: "/publications",
    label: "Publications",
    eyebrow: "DSB Publication",
    title: "DSB Publications",
    summary:
      "Books published under the DSB imprint — searchable in the live catalogue.",
    body: [
      "DSB Publications produces and distributes titles that reflect Bhutanese learning, culture, and place. The online catalogue lets visitors search, browse, and check live shelf availability while administrators manage books, authors, pricing, and inventory.",
      "Use the catalogue for current stock and title detail; this section explains the publishing imprint and how schools, libraries, and partners work with DSB.",
    ],
  },
  {
    href: "/australia",
    label: "Australia",
    eyebrow: "Bhutan–Australia Bridge",
    title: "Bhutan–Australia Bridge",
    summary:
      "Trade, culture, education, and partnership between Bhutan and Australia.",
    body: [
      "The Bhutan–Australia Bridge connects DSB’s publishing and bookstore work with Australian schools, universities, libraries, printers, and partners. It supports legal trade in books, cultural exchange, and long-term collaboration.",
    ],
    bullets: [
      "Importing and distributing DSB publications in Australia",
      "Australian printing or print-on-demand",
      "Book events and author exchanges",
      "University, library and school relationships",
      "Australian sales, licensing and marketing",
      "Finding technology and educational partners",
      "Raising investment for permitted Bhutan projects",
      "Hosting Bhutan–Australia cultural and sustainability programs",
    ],
  },
  {
    href: "/schools",
    label: "Schools",
    eyebrow: "Education partners",
    title: "Schools, Universities and Libraries",
    summary:
      "Supply, access, and learning partnerships for classrooms and collections.",
    body: [
      "DSB works with schools, universities, and libraries that need reliable access to Bhutanese and educational titles. Enquiries can cover bulk orders, availability checks, and ongoing supply relationships.",
      "Combined with the Australia Bridge and Digital Knowledge Lab, this channel supports both print holdings and emerging digital learning needs.",
    ],
  },
  {
    href: "/digital-lab",
    label: "Digital Lab",
    eyebrow: "Digital Knowledge Lab",
    title: "Digital Knowledge Lab",
    summary:
      "Digitisation, e-learning, and technology services rooted in Bhutanese content.",
    body: [
      "The Digital Knowledge Lab extends DSB beyond the physical shelf — digitising heritage materials, producing digital editions, and supporting educational technology for Bhutanese institutions and international partners.",
    ],
    bullets: [
      "Digitising Bhutanese books and historical documents",
      "E-books and audiobooks",
      "Translation and multilingual publishing technology",
      "Educational course production",
      "Learning-management platforms",
      "Digital archives for cultural institutions",
      "Sustainability and environmental education content",
      "Technology services for Bhutanese schools, publishers and organisations",
      "Export of Bhutanese digital content and services",
    ],
  },
  {
    href: "/impact",
    label: "Impact",
    eyebrow: "Earth & community",
    title: "Earth and Community Impact",
    summary:
      "Publishing and programmes that respect land, culture, and community.",
    body: [
      "DSB’s impact work ties storytelling and education to environmental awareness and community wellbeing. Content and programmes may support sustainability education, cultural continuity, and responsible partnership with local and international stakeholders.",
    ],
  },
  {
    href: "/partner",
    label: "Partner",
    eyebrow: "Collaborate",
    title: "Partner With DSB",
    summary:
      "Publishers, educators, technologists, and investors welcome.",
    body: [
      "Partnerships span co-publishing, distribution, school and library supply, digital projects, cultural programmes, and carefully scoped investment in permitted Bhutan projects.",
      "Share your organisation, goals, and timeline through the enquiry form — the team will respond by email.",
    ],
  },
  {
    href: "/orders",
    label: "Orders",
    eyebrow: "International",
    title: "International Orders",
    summary:
      "Request titles for delivery, institutional supply, or Australia Bridge fulfilment.",
    body: [
      "International buyers, diaspora readers, and institutions can enquire about availability, shipping options, and wholesale or library supply. Australia Bridge partners can also discuss local printing and distribution.",
      "There is no self-serve checkout yet — enquiries are handled by staff so stock, shipping, and licensing stay accurate.",
    ],
  },
];

export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/stationery", label: "Stationery" },
  { href: "/about", label: "About" },
  { href: "/digital-lab", label: "Digital Lab" },
  { href: "/partner", label: "Partner" },
  { href: "/visit", label: "Visit" },
  { href: "/enquiry", label: "Enquire" },
] as const;

export const FOOTER_SHOP = [
  { href: "/books", label: "Books" },
  { href: "/stationery", label: "Stationery" },
  { href: "/authors", label: "Authors" },
  { href: "/visit", label: "Visit" },
  { href: "/enquiry", label: "Enquire" },
  { href: "/orders", label: "International Orders" },
] as const;

export const FOOTER_ABOUT = INSTITUTIONAL_SECTIONS.filter(
  (s) => s.href !== "/australia"
).map((s) => ({
  href: s.href,
  label: s.label,
}));

export function getSection(href: string) {
  return INSTITUTIONAL_SECTIONS.find((s) => s.href === href);
}
