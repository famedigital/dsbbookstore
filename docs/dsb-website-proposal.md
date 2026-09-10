# DSB Books — Website Proposal

**Prepared for:** DSB Books / DSB Publications  
**Scope:** Professional public website + staff catalogue administration  
**Platform:** Next.js storefront on Vercel, Supabase data, optional Cloudinary media  

---

## 1. Purpose

The DSB Books website will serve as:

1. An **online digital catalogue** for DSB publications — search, browse, and check live availability.
2. The **institutional home** for DSB’s story, publishing, Bhutan–Australia Bridge, education partners, Digital Knowledge Lab, impact, partnerships, and international orders.
3. A **staff ERP** to manage books, authors, pricing, inventory, and customer enquiries.

---

## 2. Recommended infrastructure (proposal package)

| Area | Recommendation |
|------|----------------|
| **Domain registration** | Register brand across major TLDs (`.com`, `.bt`, `.com.au`, etc.) and point primary domain to the live site; park/redirect country variants. |
| **Hosting / compute** | Production app on **Vercel**; database on **Supabase (Postgres)**. Optional dedicated/VPS on AWS, Google Cloud, or Azure only if later workloads (heavy digitisation, LMS, large archives) outgrow serverless. |
| **Email** | Google Workspace or Microsoft 365 for `info@`, `orders@`, `partners@`; route enquiry form alerts to staff inboxes. |
| **Professional design** | Themeable storefront (multiple visual templates), compact mobile layout, catalogue + institutional pages aligned to DSB brand. |
| **Media** | Cloudinary (or equivalent) for book covers and photography. |
| **Security & backups** | HTTPS, role-based ERP login, managed DB backups via Supabase. |

---

## 3. Public website — information architecture

### 3.1 Catalogue (core commerce content)

- Home featuring titles and store visit CTA  
- **Catalogue** — Amazon-style filter/search bar; book detail with availability, price, ISBN, enquire  
- **Authors** — author index and title lists  
- **Visit** — Chang Lam store details and photos  
- **Enquire** — public enquiry form (wired to staff inbox / ERP)

### 3.2 Institutional sections (client brief)

| Section | Route | Content |
|---------|-------|---------|
| Our Founder and Family Story | `/about` | Story hub + links to all DSB sections |
| DSB Publications | `/publications` | Imprint overview → catalogue |
| Bhutan–Australia Bridge | `/australia` | Full Australia service list |
| Schools, Universities and Libraries | `/schools` | Education / collection partners |
| Digital Knowledge Lab | `/digital-lab` | Full digital/tech service list |
| Earth and Community Impact | `/impact` | Sustainability & community |
| Partner With DSB | `/partner` | Collaboration CTA |
| International Orders | `/orders` | Cross-border / institutional orders |

### 3.3 Bhutan–Australia Bridge (on-site checklist)

- Importing and distributing DSB publications in Australia  
- Australian printing or print-on-demand  
- Book events and author exchanges  
- University, library and school relationships  
- Australian sales, licensing and marketing  
- Finding technology and educational partners  
- Raising investment for permitted Bhutan projects  
- Hosting Bhutan–Australia cultural and sustainability programs  

### 3.4 Digital Knowledge Lab (on-site checklist)

- Digitising Bhutanese books and historical documents  
- E-books and audiobooks  
- Translation and multilingual publishing technology  
- Educational course production  
- Learning-management platforms  
- Digital archives for cultural institutions  
- Sustainability and environmental education content  
- Technology services for Bhutanese schools, publishers and organisations  
- Export of Bhutanese digital content and services  

---

## 4. Administration (ERP)

Staff can manage:

- Books (metadata, covers, publish state)  
- Authors and links to titles  
- Pricing and inventory / availability  
- Customer enquiries from the public forms  
- Store settings and storefront theme  

---

## 5. Delivery phases (suggested)

1. **Live catalogue + enquiries + visit** — already in progress  
2. **Institutional pages** — founder, publications, Australia, schools, digital lab, impact, partner, orders  
3. **Brand polish** — photography, final copy from DSB family, real covers  
4. **Growth** — e-commerce checkout, Australia fulfilment workflows, Digital Lab project microsites as needed  

---

## 6. What we need from DSB

- Approved founder/family narrative and photos  
- Confirmation of Australia Bridge and Digital Lab wording  
- Preferred domains and email provider  
- Priority list of titles for real cover images  

---

*This document mirrors the structure implemented on the storefront so the proposal and the website stay aligned.*
