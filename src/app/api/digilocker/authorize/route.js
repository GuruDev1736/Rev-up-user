import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state'); // 'aadhar' or 'license'
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');

  // This is a mock DigiLocker authorization page for testing
  // In production, users will be redirected to actual DigiLocker: https://digilocker.gov.in
  
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker Authorization (Demo)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
          }
          .container {
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 450px;
            width: 100%;
            animation: slideUp 0.5s ease-out;
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .header {
            text-align: center;
            margin-bottom: 2rem;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
          }
          h1 {
            color: #1f2937;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            color: #6b7280;
            font-size: 0.875rem;
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          .info-box h3 {
            color: #1e40af;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .info-box p {
            color: #1e40af;
            font-size: 0.8rem;
            line-height: 1.5;
          }
          .doc-type {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }
          .doc-type .icon {
            font-size: 3rem;
            margin-bottom: 0.5rem;
          }
          .doc-type .label {
            color: #374151;
            font-weight: 600;
            font-size: 1.125rem;
          }
          .permissions {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          .permissions h3 {
            color: #92400e;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .permissions ul {
            list-style: none;
            padding-left: 0;
          }
          .permissions li {
            color: #92400e;
            font-size: 0.8rem;
            padding: 0.25rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .permissions li::before {
            content: "✓";
            color: #059669;
            font-weight: bold;
          }
          .actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          button {
            flex: 1;
            padding: 0.875rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s;
          }
          .btn-approve {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
          }
          .btn-approve:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px -1px rgba(5, 150, 105, 0.4);
          }
          .btn-cancel {
            background: #f3f4f6;
            color: #374151;
          }
          .btn-cancel:hover {
            background: #e5e7eb;
          }
          .demo-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 0.5rem;
            padding: 0.75rem;
            margin-top: 1rem;
            text-align: center;
          }
          .demo-note p {
            color: #991b1b;
            font-size: 0.75rem;
            font-weight: 500;
          }
          @media (max-width: 480px) {
            .container {
              padding: 1.5rem;
            }
            h1 {
              font-size: 1.25rem;
            }
            .actions {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐</div>
            <h1>DigiLocker Authorization</h1>
            <p class="subtitle">Secure government document verification</p>
          </div>

          <div class="info-box">
            <h3>🏢 RevUp Bikes</h3>
            <p>is requesting access to your DigiLocker documents for verification purposes.</p>
          </div>

          <div class="doc-type">
            <div class="icon">${state === 'aadhar' ? '🆔' : '🚗'}</div>
            <div class="label">${state === 'aadhar' ? 'Aadhar Card' : 'Driving License'}</div>
          </div>

          <div class="permissions">
            <h3>⚠️ This app will be able to:</h3>
            <ul>
              <li>Read your ${state === 'aadhar' ? 'Aadhar Card' : 'Driving License'} details</li>
              <li>Verify document authenticity</li>
              <li>Store verification status</li>
            </ul>
          </div>

          <div class="actions">
            <button class="btn-cancel" onclick="handleCancel()">Cancel</button>
            <button class="btn-approve" onclick="handleApprove()">Authorize</button>
          </div>

          <div class="demo-note">
            <p>🧪 DEMO MODE - This is a simulated DigiLocker page for testing</p>
          </div>
        </div>

        <script>
          const state = '${state}';
          const redirectUri = decodeURIComponent('${redirectUri}');

          function handleApprove() {
            // Simulate successful authorization
            const authCode = 'DEMO_AUTH_CODE_' + Date.now();
            const callbackUrl = redirectUri + '?code=' + authCode + '&state=' + state;
            
            // Show loading
            document.querySelector('.btn-approve').innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Authorizing...';
            document.querySelector('.btn-approve').disabled = true;
            document.querySelector('.btn-cancel').disabled = true;
            
            // Redirect after short delay
            setTimeout(() => {
              window.location.href = callbackUrl;
            }, 1000);
          }

          function handleCancel() {
            const callbackUrl = redirectUri + '?error=access_denied&state=' + state;
            window.location.href = callbackUrl;
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
