import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // 'aadhar' or 'license'
    const error = searchParams.get('error');

    if (error) {
      // Handle error from DigiLocker
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>DigiLocker Verification Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
              }
              .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #dc2626;
                margin-bottom: 0.5rem;
              }
              p {
                color: #6b7280;
                margin-bottom: 1.5rem;
              }
              button {
                background: #dc2626;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s;
              }
              button:hover {
                background: #b91c1c;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Verification Failed</h1>
              <p>DigiLocker verification was cancelled or failed. Please try again or use manual upload.</p>
              <button onclick="closeWindow()">Close & Return</button>
            </div>
            <script>
              function closeWindow() {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'digilocker-callback',
                    success: false,
                    error: '${error}'
                  }, window.location.origin);
                }
                window.close();
              }
              // Auto close after 3 seconds
              setTimeout(closeWindow, 3000);
            </script>
          </body>
        </html>
        `,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange authorization code for access token with DigiLocker API
    const tokenUrl = 'https://digilocker.gov.in/public/oauth2/1/token';
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/digilocker/callback`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch issued documents list from DigiLocker
    const documentsUrl = 'https://digilocker.gov.in/public/oauth2/2/files/issued';
    const documentsResponse = await fetch(documentsUrl, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!documentsResponse.ok) {
      throw new Error('Failed to fetch documents from DigiLocker');
    }

    const documentsData = await documentsResponse.json();
    
    // Find the requested document type
    let documentUri = null;
    let documentDetails = null;

    if (state === 'aadhar') {
      // Find Aadhar document (UIDAI issued document)
      const aadharDoc = documentsData.items?.find(doc => 
        doc.doctype === 'ADHAR' || doc.doctype === 'AADHAAR' || doc.issuer === 'UIDAI'
      );
      if (aadharDoc) {
        documentUri = aadharDoc.uri;
        documentDetails = aadharDoc;
      }
    } else if (state === 'license') {
      // Find Driving License
      const licenseDoc = documentsData.items?.find(doc => 
        doc.doctype === 'DRIVING LICENSE' || doc.doctype === 'DL'
      );
      if (licenseDoc) {
        documentUri = licenseDoc.uri;
        documentDetails = licenseDoc;
      }
    }

    if (!documentUri) {
      throw new Error(`${state === 'aadhar' ? 'Aadhar Card' : 'Driving License'} not found in DigiLocker`);
    }

    // Fetch the actual document file
    const fileUrl = `https://digilocker.gov.in/public/oauth2/2/file/${documentUri}`;
    const fileResponse = await fetch(fileUrl, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch document file from DigiLocker');
    }

    // Get document metadata
    const documentData = {
      documentId: documentDetails.uri,
      documentUrl: fileUrl,
      documentType: documentDetails.doctype,
      issuer: documentDetails.issuer,
      name: documentDetails.name,
      size: documentDetails.size,
      date: documentDetails.date,
      verified: true,
      verifiedAt: new Date().toISOString(),
      source: 'digilocker',
      accessToken: accessToken, // Store for future use if needed
    };

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DigiLocker Verification Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
              animation: checkmark 0.8s ease-in-out;
            }
            @keyframes checkmark {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            h1 {
              color: #059669;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1rem;
            }
            .info {
              background: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              margin: 1rem 0;
              font-size: 0.875rem;
              color: #374151;
              text-align: left;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
            }
            .info-row:last-child {
              margin-bottom: 0;
            }
            .label {
              font-weight: 600;
            }
            .spinner {
              border: 3px solid #f3f4f6;
              border-top: 3px solid #059669;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
              margin: 1rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Verification Successful!</h1>
            <p>Your ${state === 'aadhar' ? 'Aadhar Card' : 'Driving License'} has been verified via DigiLocker.</p>
            <div class="info">
              <div class="info-row">
                <span class="label">Document Type:</span>
                <span>${documentDetails.doctype}</span>
              </div>
              <div class="info-row">
                <span class="label">Issuer:</span>
                <span>${documentDetails.issuer}</span>
              </div>
              <div class="info-row">
                <span class="label">Verified At:</span>
                <span>${new Date().toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span style="color: #059669;">✓ Government Verified</span>
              </div>
            </div>
            <div class="spinner"></div>
            <p style="font-size: 0.875rem; color: #9ca3af;">Closing window and returning to booking...</p>
          </div>
          <script>
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'digilocker-callback',
                success: true,
                data: ${JSON.stringify(documentData)}
              }, window.location.origin);
            }
            
            // Close window after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('DigiLocker callback error:', error);
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DigiLocker Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #dc2626;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
            .error-details {
              background: #fef2f2;
              border: 1px solid #fecaca;
              padding: 0.75rem;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              color: #991b1b;
              margin-bottom: 1rem;
              word-break: break-word;
            }
            button {
              background: #dc2626;
              color: white;
              border: none;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.3s;
            }
            button:hover {
              background: #b91c1c;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Something Went Wrong</h1>
            <p>An error occurred during verification. Please try again or use manual upload.</p>
            <div class="error-details">${error.message}</div>
            <button onclick="closeWindow()">Close & Return</button>
          </div>
          <script>
            function closeWindow() {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'digilocker-callback',
                  success: false,
                  error: '${error.message}'
                }, window.location.origin);
              }
              window.close();
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
