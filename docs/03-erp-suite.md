# DSB ERP Suite — Staff & Owner System

**Goal:** One complete working ERP for DSB Books staff and owners — not a CMS bolted on later.  
**Public website** remains the luxury catalogue/storefront.  
**`/erp`** is the internal business system.

---

## 1. Who uses it

| Role | Access | Purpose |
| --- | --- | --- |
| **Owner** | Full ERP | Oversight, reports, pricing, staff, finance, settings |
| **Manager** | Almost full (no destructive settings) | Day-to-day ops, purchasing, approvals |
| **Staff** | Sales, inventory count, enquiries, customers | Counter & floor work |
| **Public** | Storefront only | Browse / enquire / (later) buy |

Roles live in `profiles.role`: `owner` | `manager` | `staff` | `customer`.

---

## 2. ERP modules (complete suite)

### A. Command Center (Dashboard)
- Today’s sales (BTN), orders, enquiries
- Low stock alerts
- Open POs / unpaid COD
- Top sellers (7/30 days)
- Owner-only: margin snapshot, cash collected vs pending

### B. Catalogue (PIM)
- Books, authors, categories, collections
- ISBN, formats, covers (Cloudinary), publish toggle
- Cost price + sell price (margin visible to owner/manager)

### C. Inventory (ledger-based)
- On-hand qty derived from **stock movements** (never edit qty blindly without a reason)
- Movement types: `purchase_in`, `sale_out`, `adjustment`, `damage`, `return_in`, `return_out`, `transfer`
- Low-stock list + reorder suggestions
- Stock count / recount sessions

### D. Purchasing
- Suppliers (publishers, distributors)
- Purchase orders (draft → ordered → partial → received → closed)
- Goods receipt → auto stock_in movements
- Landed cost notes

### E. Sales & Orders (OMS)
- Online orders + walk-in / POS tickets in one `orders` table
- Status: `draft` → `confirmed` → `paid` / `cod_pending` → `fulfilled` → `cancelled`
- Line items, discounts, tax (if any), fulfillment type
- Stock decrement on confirm/pay (configurable)

### F. POS (in-store)
- Fast search by title / ISBN
- Cart, cash / QR / card tender
- Print/share receipt
- Tied to staff user + optional cash session open/close

### G. Customers (CRM)
- Parties: walk-in, account customers, schools, institutions
- Contact info, notes, purchase history
- Enquiry → customer linkage

### H. Enquiries
- Inbox from website
- Assign, status, convert to quote/order

### I. Finance (light ERP)
- Payments ledger linked to orders
- Methods: cash, COD, bank_qr, card, transfer
- Daily cash-up (POS sessions)
- Owner reports: revenue, COGS estimate, gross margin
- Expense entries (rent, utilities, shipping) — simple

### J. Publishing ops (DSB imprint)
- Title pipeline: idea → editing → print → published
- Print run records
- Author royalty agreements + accrual notes (manual payout log)

### K. People & access
- Invite staff, set role
- Owner can deactivate users
- Audit log of critical actions (stock adjust, price change, void sale)

### L. Settings
- Store profile (address, hours, phone)
- Currency BTN, low-stock default
- Receipt footer, tax toggle
- Cloudinary / payment keys (env — not in DB secrets)

---

## 3. Staff vs Owner screens

| Screen | Staff | Manager | Owner |
| --- | --- | --- | --- |
| Dashboard | Ops widgets | Full ops | + finance widgets |
| POS | ✓ | ✓ | ✓ |
| Orders | View/fulfill | ✓ | ✓ |
| Inventory view | ✓ | ✓ | ✓ |
| Stock adjust | Limited | ✓ | ✓ |
| Purchasing | View | ✓ | ✓ |
| Catalogue edit | Limited | ✓ | ✓ |
| Cost / margin | ✗ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ |
| Enquiries | ✓ | ✓ | ✓ |
| Finance / expenses | ✗ | View | ✓ |
| Reports | Basic | Full ops | Full + margin |
| Staff management | ✗ | ✗ | ✓ |
| Settings | ✗ | Partial | ✓ |
| Audit log | ✗ | View | ✓ |
| Publishing royalties | ✗ | ✓ | ✓ |

---

## 4. Data model (ERP core)

```text
profiles                 -- auth users + role
store_settings           -- singleton store config

authors / categories / collections / books / book_*  -- PIM
suppliers
purchase_orders / purchase_order_items
goods_receipts / goods_receipt_items

stock_movements          -- immutable ledger
stock_counts / stock_count_items

customers
enquiries

orders / order_items
payments
pos_sessions

expenses
audit_logs

publishing_titles        -- optional pipeline
print_runs
royalty_agreements / royalty_payouts
```

### Inventory truth
```text
on_hand(book_id) = SUM(stock_movements.qty_delta)
books.stock_qty = cached denormalized value updated by trigger
```

### Sale flow
```text
POS/Web cart → order (confirmed) → stock_movements(sale_out)
            → payment row(s) → fulfill / pickup
```

### Purchase flow
```text
PO → send to supplier → goods_receipt → stock_movements(purchase_in)
                      → update cost price optional
```

---

## 5. App structure

```text
/                 Public luxury storefront
/erp/login        Staff/owner login
/erp              Dashboard
/erp/pos
/erp/orders
/erp/catalogue/books
/erp/inventory
/erp/purchasing
/erp/customers
/erp/enquiries
/erp/finance
/erp/publishing
/erp/reports
/erp/staff
/erp/settings
```

Same Next.js app, route groups `(storefront)` and `(erp)`.

---

## 6. Build order (working ERP)

1. Auth + roles + ERP shell  
2. Catalogue + Cloudinary  
3. Stock ledger + inventory screens  
4. Customers + enquiries  
5. POS + orders + payments  
6. Purchasing + receiving  
7. Finance light + owner dashboard  
8. Publishing ops  
9. Audit log + staff management  
10. Public storefront wired to same catalogue/stock  

---

## 7. Definition of “complete working ERP”

Staff can:
- Sell at counter (POS)
- Check/adjust stock with reason
- Receive supplier stock
- Handle website enquiries
- Fulfill pickup/delivery orders

Owners can:
- See sales, margin, cash position
- Manage staff access
- Control pricing & cost
- Run purchasing
- Review audit trail
- Track DSB publication print/royalty basics

All data live in Supabase — **no mock data**.
