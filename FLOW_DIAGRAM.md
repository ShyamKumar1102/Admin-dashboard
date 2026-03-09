# 📊 Auto-Invoice Generation Flow Diagram

## 🔄 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CREATES SUBSCRIPTION                     │
│                                                                  │
│  Frontend: Subscriptions Page                                   │
│  ├─ Click "New Subscription"                                    │
│  ├─ Select Customer (with email)                                │
│  ├─ Select Country                                              │
│  ├─ Select Plan (Standard/Premium/Enterprise)                   │
│  └─ Click "Create Subscription"                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND RECEIVES REQUEST                      │
│                                                                  │
│  POST /api/subscriptions                                        │
│  {                                                               │
│    planName: "Premium Plan",                                    │
│    price: 100.00,                                               │
│    country: "UK",                                               │
│    customerId: "customer123"                                    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 1: CREATE SUBSCRIPTION IN DATABASE             │
│                                                                  │
│  ✅ Generate subscription ID: SUB123456                          │
│  ✅ Save to DynamoDB: Seniot-subscription table                  │
│  ✅ Status: Active                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: FETCH CUSTOMER DETAILS                      │
│                                                                  │
│  Query: seniot_customer table                                   │
│  ├─ Get customer by customerId                                  │
│  ├─ Extract: name, email, address                               │
│  └─ Verify email exists                                         │
│                                                                  │
│  Result:                                                         │
│  {                                                               │
│    username: "customer123",                                     │
│    firstName: "John",                                           │
│    surname: "Doe",                                              │
│    email: "john@example.com"                                    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: FETCH DEVICE DETAILS (Optional)             │
│                                                                  │
│  If deviceIds provided:                                         │
│  Query: seniot_devices table                                    │
│  ├─ Get devices by deviceIds                                    │
│  └─ Extract: deviceName, plantName                              │
│                                                                  │
│  Result:                                                         │
│  [                                                               │
│    { deviceId: "DEV001", deviceName: "Dairy 1", plantName: "A" }│
│    { deviceId: "DEV002", deviceName: "Dairy 2", plantName: "B" }│
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: CALCULATE INVOICE AMOUNTS                   │
│                                                                  │
│  Net Amount:    £100.00  (from subscription price)              │
│  VAT Rate:      20%      (UK standard rate)                     │
│  VAT Amount:    £ 20.00  (100 × 0.20)                           │
│  Total Amount:  £120.00  (100 + 20)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: GENERATE INVOICE NUMBER                     │
│                                                                  │
│  Query: Invoices table                                          │
│  ├─ Get all existing invoices                                   │
│  ├─ Find highest invoice number                                 │
│  └─ Increment by 1                                              │
│                                                                  │
│  Result: INV-0001 (or INV-0002, INV-0003, etc.)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 6: CREATE INVOICE IN DATABASE                  │
│                                                                  │
│  Save to DynamoDB: Invoices table                               │
│  {                                                               │
│    invoiceId: "INV123...",                                      │
│    invoiceNumber: "INV-0001",                                   │
│    customerId: "customer123",                                   │
│    customerName: "John Doe",                                    │
│    customerEmail: "john@example.com",                           │
│    subscriptionId: "SUB123456",                                 │
│    planName: "Premium Plan",                                    │
│    devices: [...],                                              │
│    netAmount: 100.00,                                           │
│    vatRate: 20,                                                 │
│    vatAmount: 20.00,                                            │
│    totalAmount: 120.00,                                         │
│    status: "Unpaid",                                            │
│    createdAt: "2024-01-15T10:30:00Z"                            │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 7: GENERATE EMAIL HTML                         │
│                                                                  │
│  Template: email-invoice.service.js                             │
│  ├─ SENIOT header                                               │
│  ├─ Company address (60 TORRING WAY...)                         │
│  ├─ VAT No: GB 123 456 789                                      │
│  ├─ Invoice date & number                                       │
│  ├─ Customer details                                            │
│  ├─ Device table with prices                                    │
│  └─ Total amounts (Net, VAT, Total)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 8: SEND EMAIL VIA GMAIL SMTP                   │
│                                                                  │
│  Nodemailer Configuration:                                      │
│  ├─ From: shyamneymar111@gmail.com                              │
│  ├─ To: john@example.com                                        │
│  ├─ Subject: "Invoice INV-0001 - SENIOT"                        │
│  └─ HTML: Professional invoice template                         │
│                                                                  │
│  ✅ Email sent successfully!                                     │
│  Message ID: <abc123@gmail.com>                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 9: UPDATE INVOICE EMAIL STATUS                 │
│                                                                  │
│  Update: Invoices table                                         │
│  {                                                               │
│    emailStatus: "Sent",                                         │
│    lastEmailSent: "2024-01-15T10:30:00Z"                        │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 10: RETURN SUCCESS TO FRONTEND                 │
│                                                                  │
│  Response:                                                       │
│  {                                                               │
│    success: true,                                               │
│    data: { subscriptionId: "SUB123456", ... }                   │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 11: FRONTEND UPDATES                           │
│                                                                  │
│  ✅ Show success message                                         │
│  ✅ Refresh subscription list                                    │
│  ✅ Close modal                                                  │
│  ✅ Real-time service updates invoice list (5 sec)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 12: USER VIEWS INVOICE                         │
│                                                                  │
│  Navigate to: Invoices Page                                     │
│  See:                                                            │
│  ├─ Invoice #: INV-0001                                         │
│  ├─ Customer: John Doe                                          │
│  ├─ Plan: 📦 Premium Plan (shown below customer)                │
│  ├─ Payment ID: SUB123456                                       │
│  ├─ Net: $100.00                                                │
│  ├─ VAT: $20.00 (20%)                                           │
│  ├─ Total: $120.00                                              │
│  └─ Status: Unpaid                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 13: CUSTOMER RECEIVES EMAIL                    │
│                                                                  │
│  Customer's Inbox:                                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ From: SENIOT <shyamneymar111@gmail.com>                │    │
│  │ Subject: Invoice INV-0001 - SENIOT                     │    │
│  │                                                         │    │
│  │ SENIOT                                                  │    │
│  │ INVOICE                                                 │    │
│  │                                                         │    │
│  │ Website: www.seniotgateway.com                         │    │
│  │ Email: info@seniotgateway.com                          │    │
│  │                                                         │    │
│  │ 60 TORRING WAY        VAT No: GB 123 456 789           │    │
│  │ MORDEN                Invoice date: 15/01/2024         │    │
│  │ SURREY SM4 5QA        Invoice No: INV-0001             │    │
│  │ UNITED KINGDOM                                          │    │
│  │                                                         │    │
│  │ John Doe              Customer ID: customer123         │    │
│  │ Plan: Premium Plan                                      │    │
│  │ BILLING ADDRESS                                         │    │
│  │                                                         │    │
│  │ ┌──────────────────────────────────────────────────┐  │    │
│  │ │ Ref  │ Plant Devices │ Unit Price │ VAT │ Total │  │    │
│  │ ├──────────────────────────────────────────────────┤  │    │
│  │ │ DEV1 │ Dairy 1       │ £ 50.00    │ 20% │£60.00 │  │    │
│  │ │ DEV2 │ Dairy 2       │ £ 50.00    │ 20% │£60.00 │  │    │
│  │ └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │ Total Net Amount: £ 100.00                             │    │
│  │ Total VAT: £  20.00                                    │    │
│  │ Invoice Total: £ 120.00                                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

## 🎯 Key Points

1. **Automatic** - No manual intervention needed
2. **Fast** - Happens in < 2 seconds
3. **Reliable** - Error handling at each step
4. **Professional** - Branded email template
5. **Accurate** - VAT calculated correctly (20%)
6. **Traceable** - Email status tracked in database

## 🔄 Real-Time Updates

```
Frontend Auto-Refresh (Every 5 seconds)
    ↓
Fetch latest invoices from backend
    ↓
Backend enriches with subscription data
    ↓
Frontend displays updated invoice list
    ↓
User sees new invoice immediately
```

## 📊 Database Tables Involved

1. **Seniot-subscription** - Stores subscription
2. **seniot_customer** - Customer details
3. **seniot_devices** - Device details (optional)
4. **Invoices** - Invoice records
5. **Email logs** - Tracked in invoice record

## ✅ Success Indicators

- Console: "✅ Email sent successfully"
- Invoice list: Shows new invoice
- Email status: "Sent"
- Customer: Receives email
- Subscription: Shows in subscription list

## 🎊 Result

**One action (create subscription) triggers:**
- ✅ Subscription created
- ✅ Invoice generated
- ✅ Email sent
- ✅ Database updated
- ✅ UI refreshed
- ✅ Customer notified

**All automatically! 🚀**
