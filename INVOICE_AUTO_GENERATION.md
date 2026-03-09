# 📧 Auto Invoice Generation - Implementation Guide

## ✅ What's Implemented

### 1. **Invoice List Shows Subscription Data**
- Invoice list now displays subscription plan name under customer name
- Shows subscription ID in the Payment ID column
- Displays actual VAT amounts (20%) instead of $0.00

### 2. **Automatic Invoice Generation**
When a new subscription is added to the database:
- ✅ Automatically fetches customer details using customer ID
- ✅ Generates a unique invoice number (INV-0001, INV-0002, etc.)
- ✅ Calculates Net Amount, VAT (20%), and Total Amount
- ✅ Creates invoice record in database
- ✅ Sends formatted invoice email to customer automatically
- ✅ Marks email as "Sent" with timestamp

### 3. **Invoice Email Format**
Matches your exact template:
```
SENIOT
INVOICE
Website: www.seniotgateway.com
Email: info@seniotgateway.com

60 TORRING WAY          VAT No: GB 123 456 789
MORDEN                  Invoice date: DD/MM/YYYY
SURREY SM4 5QA          Invoice No: INV-XXXX
UNITED KINGDOM

CUSTOMER NAME           Customer ID: XXX
Plan: Subscription Plan
BILLING ADDRESS

Ref | Plant Devices | Unit Price | VAT | Total
----|---------------|------------|-----|------
... | Device Name   | £ XX.XX    | 20% | £ XX.XX

Total Net Amount: £ XXX.XX
Total VAT: £ XX.XX
Invoice Total: £ XXX.XX
```

## 🔧 How It Works

### Flow Diagram
```
New Subscription Created
    ↓
Get Customer Details (ID, Name, Email)
    ↓
Get Device Details (if deviceIds provided)
    ↓
Calculate: Net Amount, VAT (20%), Total
    ↓
Generate Invoice Number (INV-XXXX)
    ↓
Create Invoice in Database
    ↓
Send Email to Customer
    ↓
Mark Email as "Sent"
```

## 📝 Required Fields for Subscription

When creating a subscription, include:
```json
{
  "planName": "Premium Plan",
  "price": 100.00,
  "country": "UK",
  "customerId": "customer123",  // REQUIRED for auto-invoice
  "deviceIds": ["DEV001", "DEV002"],  // Optional: for multiple devices
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "Active"
}
```

## 🎯 Key Features

1. **VAT Calculation**: Automatically calculates 20% VAT
   - Net Amount: £100.00
   - VAT (20%): £20.00
   - Total: £120.00

2. **Multiple Devices Support**: Can include multiple devices in one invoice
   - Each device shown as separate row
   - Price split evenly across devices

3. **Email Configuration**: Uses Gmail SMTP (already configured)
   - Email: shyamneymar111@gmail.com
   - Sends from: info@seniotgateway.com (display name)

4. **Error Handling**: If invoice generation fails, subscription still creates
   - Logs error to console
   - Doesn't block subscription creation

## 🚀 Testing

### Test Auto-Invoice Generation:
1. Create a new subscription with valid customerId
2. Check customer has email address in database
3. Invoice automatically created and email sent
4. Check invoice list - shows subscription data
5. Check customer email inbox

### Manual Invoice Creation:
Still works as before through "Add Invoice" button

## 📊 Database Fields

### Invoice Table (Updated):
```javascript
{
  invoiceId: "INV123...",
  invoiceNumber: "INV-0001",
  customerId: "customer123",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  subscriptionId: "SUB123456",      // NEW
  planName: "Premium Plan",          // NEW
  devices: [{                        // NEW
    deviceId: "DEV001",
    deviceName: "Dairy 1",
    plantName: "Plant A"
  }],
  netAmount: 100.00,
  vatRate: 20,                       // NEW (was 0)
  vatAmount: 20.00,                  // NEW (was 0)
  totalAmount: 120.00,
  status: "Unpaid",
  emailStatus: "Sent",
  lastEmailSent: "2024-01-15T10:30:00Z",
  createdAt: "2024-01-15T10:30:00Z"
}
```

## 🔐 Email Configuration

Already configured in `.env`:
```env
EMAIL_USER=shyamneymar111@gmail.com
EMAIL_PASS=mdydufdo yhzmcoyb
```

## 📱 Frontend Updates

### Invoice List Page:
- Shows subscription plan name under customer name
- Displays subscription ID in Payment ID column
- Shows actual VAT amount with percentage
- Real-time updates every 5 seconds

## ⚠️ Important Notes

1. **Customer Must Have Email**: Auto-invoice only works if customer has email
2. **VAT is 20%**: Fixed at 20% (UK standard rate)
3. **Invoice Number**: Auto-increments (INV-0001, INV-0002, etc.)
4. **Email Sent Once**: Email sent immediately when subscription created
5. **Can Resend**: Use "Resend Email" button in invoice list

## 🎉 Success!

Your system now:
- ✅ Shows subscription data in invoice list
- ✅ Auto-generates invoices when subscriptions are created
- ✅ Automatically sends invoice emails to customers
- ✅ Calculates VAT correctly (20%)
- ✅ Supports multiple devices per invoice
- ✅ Matches your exact invoice template

## 🔄 Next Steps (Optional)

1. Add billing address fields to customer table
2. Customize VAT rate per country
3. Add invoice PDF generation
4. Add payment gateway integration
5. Add invoice reminders for unpaid invoices
