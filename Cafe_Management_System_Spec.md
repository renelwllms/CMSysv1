# ☕ Cafe Management System

### Overview
A **mobile-friendly Cafe Management System** designed for cafés in **Indonesia**.  
It enables customers to order via QR code, supports **Indonesian Rupiah (IDR)**, and includes **bilingual support (English & Bahasa Indonesia)**.

The system covers:
- Customer self-ordering  
- Kitchen workflow tracking  
- Staff order and menu management  
- Admin analytics and branding controls  

---

## 🌍 Key Features

### 🧾 Customer Ordering Flow

#### 1. **QR Code Ordering**
- Customers scan a **table-specific QR code** to access the public ordering page.  
- **No login required.**
- The first screen asks for:
  - **Language selection:** English 🇬🇧 or Bahasa 🇮🇩  
  - **Customer Name**
  - **WhatsApp Phone Number**

---

#### 2. **Menu Browsing**
The menu displays items categorized into clear sections:

| Category | Description |
|-----------|-------------|
| 🥤 **Drinks** | Beverages such as coffee, tea, juices, and smoothies. |
| 🍴 **Main Foods** | Hot meals, rice dishes, noodles, and other main courses. |
| 🍟 **Snacks** | Light bites and side dishes. |
| 🍰 **Cabinet Food** | Ready-to-serve display or takeaway items. |
| 🎂 **Cakes** | Custom birthday cakes and celebration cakes (pre-order available). |
| 🎁 **Gifts** | Bouquets, greeting gifts, and other packaged gift items. |

Each item includes:
- **Name**
- **Description**
- **Price (in IDR)**
- **Image**

---

#### 3. **Cake Ordering (Special Category)**
Customers can pre-order **custom or birthday cakes** through the app.

##### Options:
- **Date Selection:** Choose a pickup or event date (for advance orders).  
- **Quantity Selector:** Set how many cakes to order.  
- **Custom Notes Section:** Allows customers to add special requests, e.g.:
  - “Happy Birthday Della 🎉”  
  - “Chocolate base with strawberry topping”  
  - “Add name in gold icing”

##### Payment Policy:
- Requires a **50% down payment** to confirm the order.  
- Once the order is placed:
  - The system displays:
    > “Your cake order requires a 50% down payment to confirm. Please complete the payment within **2 working days**.”
  - Shows:
    - **Bank Account Details** (editable from **Settings Page**)  
    - **Down Payment Instructions**
    - **Amount Due (50% of total)**  
- If no payment is received within **2 working days**, the cake order is **automatically cleared**.
- Once payment is verified by staff, the order status becomes **Confirmed** and is visible on the **Kitchen Screen**.

---

#### 4. **Gifts Category**
- Customers can browse and order from the **Gifts section**, which includes:
  - **Bouquets**
  - **Greeting gifts**
  - **Special packaging items**
- Gift purchases follow the **standard payment flow** (no down payment).

---

#### 5. **Order Placement & Confirmation**
- After selecting items, customers review and confirm their order.
- A unique **order number** is generated.
- The confirmation screen displays:
  - “Please take your order number to the counter to make the payment.”
  - **Payment options:**
    - QRIS / QR Code  
    - Bank Transfer (for cake down payments)
- Orders remain **pending** until staff marks them as **Paid**.
- Once marked as **Paid**, the order appears on the **Kitchen Screen** for preparation.
- **Non-cake unpaid orders** are automatically **cleared after 1 hour**.

---

### 🔧 Bank Account Settings
Admin users can configure and update the **Bank Account Details** from the **Settings Page**:
- **Bank Name**
- **Account Holder**
- **Account Number**
- **Optional Payment Instructions**

These details appear in the **Cake Order Confirmation Screen** and on any down payment instructions page.

---

## 👩‍🍳 Staff & Kitchen Operations

### 👨‍🍳 Kitchen Users
- View **confirmed orders** only.
- Update order status:
  - 🕐 Waiting  
  - 🍳 Cooking  
  - ✅ Completed

### 👩‍💼 Staff Users
- View and manage all orders.
- Mark orders as **Paid**.
- Create and update menu items.
- Manage **stock numbers** for cabinet food.
- **Cannot access Dashboard or Settings**.

### 👑 Admin Users
- Full access to all features including:
  - Dashboard  
  - Reports  
  - Settings  
  - Menu & Order Management  
  - Analytics  

---

## 📊 Dashboard (Admin)

When Admin logs in, they are directed to the **Dashboard** by default.

### Dashboard includes:
- **Revenue Summary**
  - Total revenue for the current month.
  - Comparison with:
    - Previous month  
    - Current quarter  
    - Last 6 months  
  - Displayed as a **line chart**.
- **Top Selling Items**
  - Chart showing the most popular menu items (including cakes and gifts).
- **Confirmed Orders Overview**
  - Summary of active, completed, and pending orders.
- **Category Performance**
  - Displays sales distribution for:
    - Drinks
    - Main Foods
    - Snacks
    - Cabinet Food
    - Cakes
    - Gifts

---

## ⚙️ Settings & Configuration

Admins can access the **Settings Page** to manage:
- **Branding:**
  - Logo  
  - Theme Color  
  - Business Name & Address  
  - Location (for maps)
- **Language Settings:** Enable English 🇬🇧 and Bahasa Indonesia 🇮🇩.
- **Business Information:**
  - Contact number  
  - WhatsApp number  
  - Opening hours
- **Bank Account Settings** (for cake down payments):
  - Bank name  
  - Account holder  
  - Account number  
  - Notes/instructions text

---

## 👥 User Roles Summary

| Role | Access Level | Description |
|------|---------------|-------------|
| **Admin** | Full | Access to all modules including Dashboard, Reports, Settings, and Analytics |
| **Staff** | Limited | Manage orders, mark payments, add menu items, and track stock |
| **Kitchen** | Minimal | View and update order statuses only |

---

## 💡 Improvements & Future Enhancements
- **Loyalty Program** via WhatsApp number recognition.  
- **Push Notifications** for order status updates (“Your drink is ready!”).  
- **Table Identification** embedded in each QR code.  
- **POS Integration** for real-time sales tracking.  
- **Offline Mode** (cached menus for low connectivity).  
- **Online Delivery Mode** for takeout and delivery orders.  

---

## 🧱 Tech Stack (Suggested)
- **Frontend:** React / Next.js (PWA for mobile)  
- **Backend:** Node.js + Express / NestJS  
- **Database:** PostgreSQL / Supabase  
- **Storage:** Firebase / Cloudinary (for menu images)  
- **Auth:** JWT or Supabase Auth  
- **Notifications:** WhatsApp API / Twilio  
- **QR Code Generation:** Node library (`qrcode`)  

---

## 🧩 Build Tracking

- [ ] Project setup (frontend + backend)  
- [ ] Authentication & user roles  
- [ ] Menu management (CRUD + images)  
- [ ] QR code generator  
- [ ] Public ordering flow (multi-language)  
- [ ] Cake pre-order + down payment logic  
- [ ] Gifts category integration  
- [ ] Order management (customer → staff → kitchen)  
- [ ] Payment confirmation & auto-clear logic  
- [ ] Dashboard analytics  
- [ ] Settings & branding  
- [ ] Multi-language content system  

---

## 🔄 Payment Flow Diagram (Simplified)

```mermaid
flowchart TD
A[Customer selects Cake] --> B[Choose date & add notes]
B --> C[Place Order]
C --> D[Show 50% Down Payment Instructions + Bank Details]
D --> E[Await Payment (2 Working Days)]
E -->|Payment Received| F[Staff Confirms Payment → Order Confirmed]
E -->|No Payment after 2 days| G[Auto-Clear Cake Order]
```
