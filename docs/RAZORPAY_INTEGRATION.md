# Razorpay Integration Guide

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Go to Settings → API Keys
3. Generate Test/Live API Keys
4. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Then update with your actual values:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.revupbikes.com

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
```

**Important:** 
- Never commit `.env.local` to version control!
- The `.env.local` file is already in `.gitignore`
- Restart dev server after changing environment variables: `npm run dev`

### 3. Configuration Management

All environment variables are centralized in `src/config/index.js`:

```javascript
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
};
```

**Usage in code:**
```javascript
import { API_CONFIG, RAZORPAY_CONFIG } from "@/config";

// Use the config values
const apiUrl = API_CONFIG.BASE_URL;
const razorpayKey = RAZORPAY_CONFIG.KEY_ID;
```

### 4. How It Works

#### Booking Flow:

1. **User fills booking form** → Selects dates, uploads documents
2. **Documents uploaded** → Aadhar & License converted to base64 and uploaded to Cloudinary
3. **Payment initiated** → Razorpay modal opens with calculated amount
4. **User pays** → Enters payment details in secure Razorpay modal
5. **Payment success** → `razorpay_payment_id` received
6. **Booking created** → API called with payment ID and document URLs
7. **Invoice generated** → Backend generates invoice PDF
8. **Invoice shown** → Modal displays booking details with download option

#### API Endpoints Used:

- `POST /api/upload` - Upload documents (Aadhar, License)
- `POST /api/bookings/create?userId={id}&bikeId={id}` - Create booking

#### Payment Data Flow:

```
User Action → Razorpay Payment
           ↓
    Payment Success
           ↓
  razorpay_payment_id
           ↓
   Create Booking API
           ↓
   Invoice Generated
           ↓
    Show to User
```

### 4. Testing Payment

#### Test Card Details:

- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

#### Test UPI:

- **UPI ID:** success@razorpay

### 5. File Structure

```
src/
├── api/
│   ├── bookings.js       # Booking API functions
│   ├── upload.js         # Document upload with base64
│   └── bikes.js          # Bike-related APIs
├── lib/
│   └── razorpay.js       # Razorpay integration
└── components/
    └── bikes/
        ├── BookingModal.jsx   # Main booking flow
        └── InvoiceModal.jsx   # Invoice display & download
```

### 6. Request/Response Formats

#### Upload Document:
```json
// Request
{
  "fileName": "aadhar.png",
  "fileData": "/9j/4AAQSkZJRg...",  // base64 without prefix
  "userId": "1"
}

// Response
{
  "STS": "200",
  "MSG": "File uploaded successfully",
  "CONTENT": "https://res.cloudinary.com/.../aadhar.png"
}
```

#### Create Booking:
```json
// Request to: /api/bookings/create?userId=1&bikeId=2
{
  "startDateTime": "2025-10-15 09:00",
  "endDateTime": "2025-10-15 18:00",
  "paymentId": "pay_xxxxxxxxxxxxx",
  "totalAmount": 450,
  "aadharcardUrl": "https://.../aadhar.pdf",
  "drivingLicenseUrl": "https://.../license.pdf"
}

// Response
{
  "STS": "200",
  "MSG": "Booking Created Successfully",
  "CONTENT": {
    "id": 10,
    "paymentId": "pay_xxxxxxxxxxxxx",
    "invoiceUrl": "https://.../invoices/INV-xxx.pdf",
    "bookingStatus": "CONFIRMED",
    // ... full booking details
  }
}
```

### 7. Features Implemented

✅ Document upload with base64 conversion
✅ Razorpay payment integration
✅ Real-time amount calculation
✅ Progress indicators during upload/payment
✅ Invoice generation from backend
✅ Invoice download functionality
✅ Comprehensive error handling
✅ Payment cancellation handling
✅ User-friendly success modal

### 8. Security Notes

- ✅ Payment handled by Razorpay (PCI DSS compliant)
- ✅ API calls use authentication tokens
- ✅ Sensitive data never stored in frontend
- ✅ Razorpay key is public (safe to expose)
- ⚠️ Never expose Razorpay **Secret Key** in frontend

### 9. Production Checklist

- [ ] Replace test Razorpay key with live key
- [ ] Test with real payment methods
- [ ] Set up webhooks for payment verification
- [ ] Enable payment confirmations via email
- [ ] Set up invoice email delivery
- [ ] Add retry logic for failed bookings
- [ ] Implement refund functionality

### 10. Troubleshooting

**Razorpay modal not opening:**
- Check if script loaded: `console.log(window.Razorpay)`
- Verify API key is correct
- Check browser console for errors

**Payment succeeds but booking fails:**
- Payment ID is captured and shown to user
- User can contact support with payment ID
- Backend should verify payment before creating booking

**Documents not uploading:**
- Check file size (may need backend limits)
- Verify base64 conversion is working
- Check API response in network tab

## Support

For Razorpay issues: https://razorpay.com/docs/
For API issues: Check backend logs and API documentation
