# ERP — Full Production Mode

Complete staff/owner feature set required for daily Thimphu store operations.

## Roles
| Role | Scope |
| --- | --- |
| Owner | All + staff + settings + margin + migrate media |
| Manager | Ops + purchasing + finance + publishing + media migrate |
| Staff | POS, catalogue (limited cost), inventory adjust, enquiries, customers |

## Module checklist (production)

### 1. Command center `/erp`
- [x] Today sales / orders / enquiries / low stock  
- [ ] Cash session open indicator  
- [ ] Quick actions: New sale, Add book, Open enquiries  

### 2. POS `/erp/pos` — PRODUCTION
- [x] Search + cart + pay  
- [ ] ISBN barcode-friendly search  
- [x] Open/close **POS session** (float in/out)  
- [x] Receipt view (print / WhatsApp share text)  
- [ ] Hold cart / resume  
- [ ] Mobile full-screen charge sheet  

### 3. Orders `/erp/orders`
- [x] List + detail + status + mark payment  
- [ ] Filter by channel/status/date  
- [x] Convert enquiry → order  
- [ ] Refund / void with reason + stock return movement  

### 4. Catalogue `/erp/catalogue`
- [x] CRUD + authors/categories  
- [ ] Pick cover from **Media Library**  
- [ ] Bulk publish/unpublish  
- [ ] Duplicate title  

### 5. Media Library `/erp/media` — NEW
- [x] Grid of Supabase / Cloudinary assets  
- [x] AI generate → Supabase  
- [x] Upload → Supabase  
- [x] Migrate → Cloudinary + delete Supabase  
- [x] Attach to book  

### 6. Inventory `/erp/inventory`
- [x] Adjust + ledger + low stock  
- [ ] Stock count session  
- [ ] Print low-stock list  

### 7. Purchasing `/erp/purchasing`
- [x] Single-line PO + receive all  
- [x] Multi-line PO editor  
- [x] Partial receive quantities  
- [x] Supplier edit/deactivate  

### 8. Customers `/erp/customers`
- [x] Create + list  
- [x] Edit + purchase history  
- [x] Link from enquiry  

### 9. Enquiries `/erp/enquiries`
- [x] Inbox + status  
- [x] Assign to staff  
- [x] Convert to customer / draft order  
- [ ] Email notify (Resend)  

### 10. Finance `/erp/finance`
- [x] Payments + expenses  
- [ ] Daily cash-up from POS sessions  
- [ ] Date range filters  

### 11. Publishing `/erp/publishing`
- [x] Pipeline create/update  
- [ ] Print runs + royalty payouts UI  

### 12. Reports `/erp/reports`
- [x] Basic 30-day  
- [x] Export CSV  
- [x] Margin by title (owner/manager)  

### 13. Staff `/erp/staff` + Audit `/erp/audit`
- [x] Invite + roles  
- [x] Audit log viewer  

### 14. Settings `/erp/settings`
- [x] Store profile  
- [ ] Receipt footer preview  
- [ ] Media defaults (auto-migrate toggle)  

## Production acceptance (ERP)
1. Open session → sell 2 books → receipt → close session balances  
2. Create 3-line PO → partial receive → stock correct  
3. Generate AI cover → attach book → migrate to Cloudinary → Supabase file gone  
4. Enquiry → customer → (optional) order  
5. Owner report shows sales + margin  

## Implementation order
1. Schema: `media_assets`, `pos_sessions` usage, stock counts  
2. Media library + AI + migrate  
3. POS sessions + receipt  
4. Multi-line purchasing  
5. Customer history + enquiry convert  
6. Reports export + audit UI ✅  
