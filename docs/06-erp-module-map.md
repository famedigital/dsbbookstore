# ERP module map

Routes under `/erp`. Middleware requires authenticated user with `profiles.role` in `owner` | `manager` | `staff` and `is_active = true`.

| Route | Access | Main actions | Tables |
| --- | --- | --- | --- |
| `/erp/login` | Public | Email/password sign-in | `auth.users`, `profiles` |
| `/erp` | Staff | Dashboard: today’s orders, enquiries, low stock | `orders`, `enquiries`, `books` |
| `/erp/pos` | Staff | POS cart, `createPosSale` | `orders`, `order_items`, `payments`, `stock_movements` |
| `/erp/orders` | Staff | List orders, status updates | `orders`, `order_items` |
| `/erp/orders/[id]` | Staff | Order detail | `orders`, `order_items`, `payments` |
| `/erp/catalogue` | Staff | List books, link to edit | `books` |
| `/erp/media` | Staff | Upload/AI generate covers, attach to books; migrate (manager+) | `media_assets`, Storage `media` |
| `/erp/catalogue/new` | Staff | `BookForm` → `upsertBook` | `books` |
| `/erp/orders/[id]/receipt` | Staff | Printable POS receipt | `orders`, `order_items`, `payments`, `store_settings` |
| `/erp/catalogue/[id]` | Staff | Edit book, authors, categories, unpublish | `books`, `book_authors`, `book_categories`, `authors`, `categories` |
| `/erp/authors` | Staff | CRUD authors | `authors` |
| `/erp/categories` | Staff | CRUD categories | `categories` |
| `/erp/inventory` | Staff | Stock ledger, `adjustStock` | `stock_movements`, `books` |
| `/erp/purchasing` | Manager+ | POs, suppliers, receive goods | `purchase_orders`, `purchase_order_items`, `goods_receipts`, `suppliers`, `stock_movements` |
| `/erp/customers` | Staff | `upsertCustomer` | `customers` |
| `/erp/enquiries` | Staff | Inbox, `updateEnquiryStatus` | `enquiries` |
| `/erp/finance` | Manager+ | `createExpense` | `expenses` |
| `/erp/publishing` | Manager+ | `createPublishingTitle` | `publishing_titles` |
| `/erp/reports` | Staff | Sales summary (cost hidden from staff) | `orders`, `payments`, `expenses` |
| `/erp/staff` | Owner | `updateStaffRole` | `profiles` |
| `/erp/settings` | Owner | `updateStoreSettings` | `store_settings` |

## API routes

| Route | Access | Purpose |
| --- | --- | --- |
| `POST /api/cloudinary/sign` | Staff | Signed upload params for `dsb/covers` |

## Role matrix (quick)

| Capability | staff | manager | owner |
| --- | --- | --- | --- |
| POS, orders, catalogue, inventory | ✓ | ✓ | ✓ |
| See cost price | — | ✓ | ✓ |
| Purchasing, finance, publishing | — | ✓ | ✓ |
| Staff roles, store settings | — | — | ✓ |

Nav items are filtered in `src/components/erp/nav.ts` via `navForRole()`.  
Mobile/desktop chrome: [13 — ERP mobile shell](./13-erp-mobile-shell.md) (`ErpShell`, bottom tabs, drawer).  
Also: `/erp/audit` (manager+), `/erp/customers/[id]`, `/erp/purchasing/[id]`, `/erp/reports/export`.

## Public storefront (related)

| Route | Data |
| --- | --- |
| `/`, `/books`, `/books/[slug]` | `books` |
| `/authors`, `/authors/[slug]` | `authors`, `book_authors` |
| `/enquiry` | `enquiries` via `submitPublicEnquiry` |
| `/visit`, `/privacy`, `/terms` | `store_settings` or static |
