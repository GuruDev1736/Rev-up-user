# DigiLocker Integration Setup Guide

## Overview
This application integrates with DigiLocker API for secure government document verification (Aadhar Card and Driving License).

## Prerequisites
1. A DigiLocker Developer Account
2. Registered application on DigiLocker Developer Portal

## Setup Steps

### 1. Register Your Application on DigiLocker

1. Visit the DigiLocker Developer Portal: https://digilocker.gov.in/
2. Click on "Sign Up" and create a developer account
3. Once logged in, go to "Developer Console" or "My Applications"
4. Click "Create New Application" or "Register Application"
5. Fill in the required details:
   - **Application Name**: RevUp Bikes
   - **Application Description**: Bike rental platform with document verification
   - **Redirect URI**: `http://localhost:3000/api/digilocker/callback` (for development)
   - **Redirect URI**: `https://yourdomain.com/api/digilocker/callback` (for production)
   - **Application Type**: Web Application
   - **Permissions Required**: 
     - Read Aadhar Card
     - Read Driving License

6. Submit the application for approval
7. Once approved, you'll receive:
   - **Client ID** (Public key)
   - **Client Secret** (Private key - keep this secure!)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your DigiLocker credentials:
   ```env
   NEXT_PUBLIC_DIGILOCKER_CLIENT_ID=your_actual_client_id
   DIGILOCKER_CLIENT_SECRET=your_actual_client_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. For production, update `NEXT_PUBLIC_BASE_URL` to your domain:
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

### 3. Update Redirect URI in DigiLocker Portal

Make sure the redirect URI in your DigiLocker application settings matches:
- **Development**: `http://localhost:3000/api/digilocker/callback`
- **Production**: `https://yourdomain.com/api/digilocker/callback`

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a bike booking page
3. Click "Verify via DigiLocker" button
4. You should be redirected to DigiLocker's authorization page
5. Log in with your DigiLocker credentials
6. Authorize the application
7. You'll be redirected back with the verified document

## API Endpoints Used

### Authorization
- **URL**: `https://digilocker.gov.in/public/oauth2/1/authorize`
- **Method**: GET
- **Parameters**:
  - `response_type`: code
  - `client_id`: Your Client ID
  - `redirect_uri`: Your callback URL
  - `state`: Document type (aadhar/license)

### Token Exchange
- **URL**: `https://digilocker.gov.in/public/oauth2/1/token`
- **Method**: POST
- **Body**:
  - `code`: Authorization code
  - `grant_type`: authorization_code
  - `client_id`: Your Client ID
  - `client_secret`: Your Client Secret
  - `redirect_uri`: Your callback URL

### Fetch Documents
- **URL**: `https://digilocker.gov.in/public/oauth2/2/files/issued`
- **Method**: GET
- **Headers**: `Authorization: Bearer {access_token}`

### Fetch Document File
- **URL**: `https://digilocker.gov.in/public/oauth2/2/file/{uri}`
- **Method**: GET
- **Headers**: `Authorization: Bearer {access_token}`

## Document Types

### Aadhar Card
- **Document Type Code**: `ADHAR` or `AADHAAR`
- **Issuer**: `UIDAI`

### Driving License
- **Document Type Code**: `DRIVING LICENSE` or `DL`
- **Issuer**: State Transport Authority

## Security Best Practices

1. **Never expose Client Secret**: Keep it only in server-side environment variables
2. **Use HTTPS in production**: DigiLocker requires secure connections
3. **Validate redirect URIs**: Ensure callback URLs are whitelisted
4. **Store access tokens securely**: Use encrypted storage for user tokens
5. **Implement token refresh**: Access tokens expire, implement refresh logic
6. **Audit logs**: Log all DigiLocker API calls for security auditing

## Troubleshooting

### Common Issues

1. **"Popup blocked" error**
   - Solution: Allow popups for your domain in browser settings

2. **"Invalid redirect URI" error**
   - Solution: Verify redirect URI matches exactly in DigiLocker portal

3. **"Invalid client credentials" error**
   - Solution: Check Client ID and Secret in environment variables

4. **"Document not found" error**
   - Solution: User doesn't have the requested document in DigiLocker

5. **"Token exchange failed" error**
   - Solution: Check Client Secret and ensure code hasn't expired

## Production Deployment Checklist

- [ ] Register production domain in DigiLocker portal
- [ ] Update redirect URI to production URL
- [ ] Set production environment variables
- [ ] Enable HTTPS on your domain
- [ ] Test complete flow on production
- [ ] Set up error monitoring
- [ ] Configure backup document upload method
- [ ] Add rate limiting for API calls
- [ ] Implement token caching strategy

## Support

For DigiLocker API issues:
- Documentation: https://digilocker.gov.in/assets/img/DigiLocker_API_Specification_v2.0.pdf
- Support Email: support@digitallocker.gov.in

For application issues:
- Contact your development team
- Check application logs
- Review error messages in callback responses

## Notes

- DigiLocker approval process may take 2-3 business days
- Test with sandbox credentials during development
- Some documents may require additional permissions
- User consent is required for each document access
- Access tokens typically expire in 1 hour
