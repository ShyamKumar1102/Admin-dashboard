# 🧪 Test Auto-Invoice Generation

## Test Case 1: Create Subscription with Auto-Invoice

### API Request:
```bash
POST http://localhost:5000/api/subscriptions
Content-Type: application/json

{
  "planName": "Premium IoT Plan",
  "price": 250.00,
  "country": "United Kingdom",
  "customerId": "EXISTING_CUSTOMER_ID",
  "deviceIds": ["DEVICE_ID_1", "DEVICE_ID_2"],
  "startDate": "2024-01-15",
  "endDate": "2025-01-15",
  "status": "Active"
}
```

### Expected Result:
1. ✅ Subscription created with ID: SUB123456
2. ✅ Invoice auto-generated: INV-0001
3. ✅ Email sent to customer automatically
4. ✅ Invoice shows in invoice list with subscription data

### What Happens Behind the Scenes:
```
1. Subscription created → SUB123456
2. System fetches customer details using customerId
3. System fetches device details using deviceIds
4. Calculates:
   - Net Amount: £250.00
   - VAT (20%): £50.00
   - Total: £300.00
5. Generates invoice number: INV-0001
6. Creates invoice in database
7. Sends email to customer
8. Marks email as "Sent"
```

## Test Case 2: View Invoice List

### API Request:
```bash
GET http://localhost:5000/api/invoices
```

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "invoiceId": "INV123...",
      "invoiceNumber": "INV-0001",
      "customerId": "customer123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "subscriptionId": "SUB123456",
      "planName": "Premium IoT Plan",
      "devices": [
        {
          "deviceId": "DEV001",
          "deviceName": "Dairy 1",
          "plantName": "Plant A"
        },
        {
          "deviceId": "DEV002",
          "deviceName": "Dairy 2",
          "plantName": "Plant B"
        }
      ],
      "netAmount": 250.00,
      "vatRate": 20,
      "vatAmount": 50.00,
      "totalAmount": 300.00,
      "status": "Unpaid",
      "emailStatus": "Sent",
      "lastEmailSent": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "subscription": {
        "subscriptionid": "SUB123456",
        "planName": "Premium IoT Plan",
        "country": "United Kingdom",
        "price": 250.00,
        "status": "Active"
      }
    }
  ]
}
```

## Test Case 3: Frontend Display

### Invoice List Page Shows:
```
Invoice #    | Customer Name           | Email              | Payment ID  | Net    | VAT      | Total   | Status
-------------|-------------------------|-----------------------|-------------|--------|----------|---------|--------
INV-0001     | John Doe                | john@example.com      | SUB123456   | $250.00| $50.00   | $300.00 | Unpaid
             | 📦 Premium IoT Plan     |                       |             |        | (20%)    |         |
```

## Test Case 4: Email Received

### Customer Receives Email:
```
Subject: Invoice INV-0001 - SENIOT

SENIOT
INVOICE

Website: www.seniotgateway.com
Email: info@seniotgateway.com

60 TORRING WAY          VAT No: GB 123 456 789
MORDEN                  Invoice date: 15/01/2024
SURREY SM4 5QA          Invoice No: INV-0001
UNITED KINGDOM

John Doe                Customer ID: customer123
Plan: Premium IoT Plan
BILLING ADDRESS

Ref      | Plant Devices        | Unit Price | VAT | Total
---------|----------------------|------------|-----|-------
DEV001   | Plant A              | £ 125.00   | 20% | £ 150.00
         | ID: DEV001           |            |     |
DEV002   | Plant B              | £ 125.00   | 20% | £ 150.00
         | ID: DEV002           |            |     |

Total Net Amount: £ 250.00
Total VAT: £ 50.00
Invoice Total: £ 300.00
```

## 🔍 Troubleshooting

### Issue: Email Not Sent
**Check:**
1. Customer has email address in database
2. EMAIL_USER and EMAIL_PASS in .env file
3. Gmail "Less secure app access" or App Password enabled
4. Check backend console for error messages

### Issue: Invoice Not Created
**Check:**
1. customerId exists in customer table
2. Customer has valid email
3. Check backend console logs
4. Subscription still creates even if invoice fails

### Issue: Subscription Data Not Showing
**Check:**
1. Frontend refreshing every 5 seconds
2. Backend returning enriched invoice data
3. Browser console for errors

## 📝 Manual Testing Steps

1. **Start Backend:**
   ```bash
   cd seniot-backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd seniot
   npm start
   ```

3. **Create Test Customer** (if needed):
   - Go to Customers page
   - Add customer with email address
   - Note the customer ID

4. **Create Subscription:**
   - Go to Subscriptions page
   - Click "Add Subscription"
   - Fill in details with customer ID
   - Submit

5. **Check Invoice List:**
   - Go to Invoices page
   - See new invoice with subscription data
   - Status should be "Unpaid"
   - Email status should be "Sent"

6. **Check Email:**
   - Open customer's email inbox
   - Look for invoice email
   - Verify format matches template

## ✅ Success Criteria

- [x] Subscription creates successfully
- [x] Invoice auto-generated with correct number
- [x] VAT calculated at 20%
- [x] Email sent to customer
- [x] Invoice shows in list with subscription data
- [x] Email format matches template
- [x] Can resend email manually if needed

## 🎯 Quick Test Command

Use this curl command to test:
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Test Plan",
    "price": 100.00,
    "country": "UK",
    "customerId": "YOUR_CUSTOMER_ID",
    "startDate": "2024-01-15",
    "endDate": "2025-01-15",
    "status": "Active"
  }'
```

Replace `YOUR_CUSTOMER_ID` with an actual customer ID from your database.
