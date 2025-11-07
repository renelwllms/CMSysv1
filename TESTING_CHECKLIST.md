# Testing Checklist - Cafe Management System

Use this checklist to verify all features are working correctly.

## Prerequisites Setup

- [ ] PostgreSQL installed and running
- [ ] Database `cafe_management` created
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file configured with correct DATABASE_URL
- [ ] Prisma migrations applied (`npx prisma migrate dev`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend server running (`npm run start:dev`)

---

## 1. Authentication Tests

### Login Tests
- [ ] Login with admin credentials (admin@cafe.com / Admin123!)
- [ ] Login with staff credentials (staff@cafe.com / Staff123!)
- [ ] Login with kitchen credentials (kitchen@cafe.com / Kitchen123!)
- [ ] Login fails with wrong password
- [ ] Login fails with non-existent email
- [ ] Save access token for subsequent tests

### Profile Tests
- [ ] Get current user profile (with token)
- [ ] Profile returns correct user details
- [ ] Profile request fails without token

### Register Tests (Admin Only)
- [ ] Register new staff user (as admin)
- [ ] Register new kitchen user (as admin)
- [ ] Registration fails without admin token
- [ ] Registration fails with duplicate email

---

## 2. Menu Management Tests

### Public Menu Tests
- [ ] Get all menu items (no auth required)
- [ ] Filter by category (e.g., DRINKS)
- [ ] Filter by availability (isAvailable=true)
- [ ] Get single menu item by ID
- [ ] Get items by specific category (e.g., /menu/category/CAKES)
- [ ] Get all categories list

### Staff Menu Tests (Requires Auth)
- [ ] Create new menu item (Drinks)
- [ ] Create menu item with image upload
- [ ] Create cabinet food with stock quantity
- [ ] Update menu item price
- [ ] Update menu item availability
- [ ] Toggle availability on/off
- [ ] Update stock quantity for cabinet food
- [ ] Get menu statistics

### Admin Menu Tests
- [ ] Delete menu item (soft delete)
- [ ] Verify deleted item not shown in public list

### Image Upload Tests
- [ ] Upload valid image (jpg, png)
- [ ] Image accessible via /uploads/menu-items/filename
- [ ] Upload fails with invalid file type
- [ ] Upload fails with file too large (>5MB)

---

## 3. Tables & QR Code Tests

### Table Creation
- [ ] Create new table (T01)
- [ ] QR code automatically generated
- [ ] QR code file exists in /uploads/qr-codes/
- [ ] Get all tables list
- [ ] Get single table by ID

### QR Code Tests
- [ ] Get QR code data for table
- [ ] QR code URL points to correct order page
- [ ] Download QR code image
- [ ] Regenerate QR code for table
- [ ] Old QR code file deleted after regeneration

### Table Management
- [ ] Update table number
- [ ] Toggle table active/inactive
- [ ] Delete table
- [ ] QR code deleted when table deleted

---

## 4. Customer Order Tests (Public - No Auth)

### Basic Order Creation
- [ ] Create order with single item
- [ ] Create order with multiple items
- [ ] Order number generated (ORD-YYYYMMDD-XXX format)
- [ ] Total amount calculated correctly
- [ ] Order status is PENDING
- [ ] Payment status is PENDING

### Order with Table
- [ ] Create order linked to table
- [ ] Table ID stored in order

### Order with Notes
- [ ] Create order with customer notes
- [ ] Create order with item-specific notes

### Cabinet Food Order
- [ ] Create order with cabinet food
- [ ] Stock quantity decremented
- [ ] Item becomes unavailable when stock reaches 0
- [ ] Order fails if insufficient stock

### Cake Pre-Order
- [ ] Create cake order
- [ ] Down payment amount calculated (50% of total)
- [ ] Down payment due date set (2 working days)
- [ ] Cake pickup date saved
- [ ] Cake custom notes saved
- [ ] isCakeOrder flag set to true

### Order Retrieval (Public)
- [ ] Get order by order number
- [ ] Get customer orders by phone number
- [ ] Order details include all items
- [ ] Order includes menu item details

---

## 5. Staff Order Management Tests

### Order Viewing
- [ ] Get all orders (staff/admin)
- [ ] Filter orders by status (PENDING)
- [ ] Filter orders by payment status (PAID)
- [ ] Get single order with full details
- [ ] View includes customer info
- [ ] View includes order items

### Payment Confirmation
- [ ] Mark order as paid
- [ ] Payment status changes to PAID
- [ ] Paid timestamp recorded
- [ ] Staff ID recorded
- [ ] Order status changes to WAITING
- [ ] Cannot mark already paid order

### Order Status Updates
- [ ] Update order status to COOKING
- [ ] Update order status to COMPLETED
- [ ] Completed timestamp recorded
- [ ] Status updates reflected in order list

### Order Cancellation
- [ ] Cancel unpaid order
- [ ] Cannot cancel paid order
- [ ] Cannot cancel completed order
- [ ] Stock restored for cabinet food on cancellation

### Order Statistics
- [ ] Get order statistics
- [ ] Today's order count correct
- [ ] Today's revenue correct
- [ ] Pending orders count correct
- [ ] Active orders count correct

---

## 6. Kitchen Order Tests

### Kitchen Queue
- [ ] Login as kitchen user
- [ ] Get kitchen orders
- [ ] Only paid orders shown
- [ ] Only WAITING and COOKING orders shown
- [ ] Orders sorted by creation time

### Kitchen Status Updates
- [ ] Update order status to COOKING
- [ ] Update order status to COMPLETED
- [ ] Kitchen user can update statuses
- [ ] Kitchen user cannot mark as paid

---

## 7. Auto-Clear Logic Tests

### Regular Orders Auto-Clear
- [ ] Create unpaid order
- [ ] Wait 1 hour (or modify code to 1 minute for testing)
- [ ] Verify order auto-cancelled
- [ ] autoCleared flag set to true
- [ ] autoClearedAt timestamp recorded

### Cake Orders Auto-Clear
- [ ] Create cake order
- [ ] Wait 2 working days (or modify code for testing)
- [ ] Verify order auto-cancelled if not paid
- [ ] Paid cake orders NOT cancelled

### Manual Cron Trigger
- [ ] Check server logs for cron job execution
- [ ] Verify cron runs every hour
- [ ] No errors in cron execution

---

## 8. Security & Authorization Tests

### Role-Based Access
- [ ] Kitchen user cannot create menu items
- [ ] Kitchen user cannot create tables
- [ ] Kitchen user CAN view kitchen orders
- [ ] Kitchen user CAN update order status
- [ ] Staff user cannot delete menu items
- [ ] Staff user CAN create menu items
- [ ] Admin user has full access

### Token Security
- [ ] Request fails with invalid token
- [ ] Request fails with expired token
- [ ] Request fails with no token (protected routes)
- [ ] Public routes work without token

### Input Validation
- [ ] Invalid email format rejected
- [ ] Short password rejected (<6 chars)
- [ ] Negative price rejected
- [ ] Invalid category rejected
- [ ] Invalid order status rejected
- [ ] Missing required fields rejected

---

## 9. File Storage Tests

### Upload Directory Structure
- [ ] /uploads/menu-items/ exists
- [ ] /uploads/qr-codes/ exists
- [ ] /uploads/logos/ exists
- [ ] /uploads/payment-proofs/ exists

### File Access
- [ ] Uploaded images accessible via HTTP
- [ ] QR codes accessible via HTTP
- [ ] Files served with correct MIME types

### File Cleanup
- [ ] Old image deleted when item updated
- [ ] QR code deleted when table deleted
- [ ] No orphaned files accumulate

---

## 10. Database Integrity Tests

### Data Relationships
- [ ] Order includes order items
- [ ] Order items link to menu items
- [ ] Orders link to tables
- [ ] Orders link to staff users
- [ ] Deleting menu item doesn't delete orders (foreign key)

### Data Validation
- [ ] Unique constraints enforced (email, table number, order number)
- [ ] Enum values validated
- [ ] Required fields enforced
- [ ] Date formats correct

### Transactions
- [ ] Order creation is atomic (all or nothing)
- [ ] Stock updates are consistent
- [ ] No partial data on errors

---

## 11. API Response Tests

### Success Responses
- [ ] Status codes correct (200, 201)
- [ ] Response format consistent
- [ ] Timestamps in ISO format
- [ ] Decimal values correct (prices)

### Error Responses
- [ ] 400 for validation errors
- [ ] 401 for unauthorized
- [ ] 403 for forbidden
- [ ] 404 for not found
- [ ] 409 for conflicts
- [ ] Error messages clear and helpful

### Response Data
- [ ] No sensitive data exposed (no passwords)
- [ ] Consistent field naming
- [ ] Proper data types
- [ ] Nested data properly included

---

## 12. Performance Tests

### Response Time
- [ ] Login < 500ms
- [ ] Get menu < 300ms
- [ ] Create order < 1s
- [ ] Image upload < 3s
- [ ] QR generation < 2s

### Concurrent Requests
- [ ] Multiple orders simultaneously
- [ ] Multiple logins simultaneously
- [ ] No race conditions in stock updates

### Database Queries
- [ ] Queries use indexes
- [ ] No N+1 query problems
- [ ] Efficient joins

---

## 13. Edge Cases

### Null/Empty Values
- [ ] Optional fields can be null
- [ ] Empty strings handled
- [ ] Empty arrays handled

### Boundary Values
- [ ] Price = 0 allowed
- [ ] Quantity = 1 works
- [ ] Large quantities handled
- [ ] Long text in notes

### Special Characters
- [ ] Phone numbers with + and -
- [ ] Names with special characters
- [ ] Unicode in Indonesian text

---

## 14. Integration Tests

### Complete Order Flow
- [ ] Customer creates order
- [ ] Staff marks as paid
- [ ] Order appears in kitchen
- [ ] Kitchen marks cooking
- [ ] Kitchen marks completed
- [ ] Order history shows all steps

### Complete Cake Order Flow
- [ ] Customer orders cake
- [ ] Down payment details shown
- [ ] Staff confirms payment
- [ ] Order goes to kitchen
- [ ] Kitchen completes order

### Menu Management Flow
- [ ] Create menu item
- [ ] Upload image
- [ ] Update availability
- [ ] Use in order
- [ ] Update stock
- [ ] Delete item

---

## 15. Documentation Tests

- [ ] README.md clear and complete
- [ ] QUICK_START.md steps work
- [ ] API_TESTING_GUIDE.md examples work
- [ ] Code comments accurate
- [ ] Environment variables documented

---

## Testing Tools

### Recommended Order
1. Start with Postman/Thunder Client
2. Test authentication first
3. Test public endpoints (menu, orders)
4. Test protected endpoints (with token)
5. Test role-based access
6. Test edge cases
7. Test integration flows

### Logging
- [ ] Check server logs for errors
- [ ] Check database logs
- [ ] Check file system for uploads

---

## Production Readiness Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] No database errors
- [ ] Change default passwords
- [ ] Change JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Set up monitoring
- [ ] Load test completed
- [ ] Security audit done

---

## Known Issues / Notes

Document any issues found during testing:

```
Issue: [Description]
Steps to Reproduce: [Steps]
Expected: [Expected behavior]
Actual: [Actual behavior]
Status: [Fixed/Pending/Wontfix]
```

---

## Test Results Summary

**Date Tested:** __________

**Total Tests:** __________

**Passed:** __________

**Failed:** __________

**Blocked:** __________

**Pass Rate:** __________%

---

## Sign-Off

- [ ] All critical features tested and working
- [ ] All blocker issues resolved
- [ ] Documentation reviewed and accurate
- [ ] System ready for next phase

**Tester:** __________________

**Date:** __________________

**Notes:**
```
[Add any additional notes or observations]
```
