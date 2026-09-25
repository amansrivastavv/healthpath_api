export function getForgotPasswordTemplate(
  frontendUrl: string,
  token: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your HealthPath Password</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f7f9;
      color: #1a1f36;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f7f9;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      color: #0070f3;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #00df89;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1a1f36;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 16px;
      line-height: 24px;
      color: #4f566b;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .otp-container {
      text-align: center;
      margin: 30px 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #0070f3;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px dashed #0070f3;
    }
    .expiry {
      font-size: 14px;
      color: #8792a2;
      background-color: #f8f9fa;
      padding: 12px 16px;
      border-radius: 6px;
      border-left: 4px solid #00df89;
      margin-bottom: 24px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 13px;
      color: #8792a2;
      line-height: 20px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <span class="logo">Health<span>Path</span></span>
      </div>
      
      <h1>Reset Your Password</h1>
      <p>Hello,</p>
      <p>We received a request to reset your password for your HealthPath account. Use the OTP below to secure your account and set a new password:</p>
      
      <div class="otp-container">
        ${token}
      </div>
      
      <div class="expiry">
        <strong>Note:</strong> This OTP is valid for <strong>15 minutes</strong> and can only be used once. If you did not request this, you can safely ignore this email.
      </div>
      
      <div class="footer">
        <p>Regards,<br><strong>HealthPath Team</strong></p>
        <p style="font-size: 11px; margin-top: 20px;">This is an automated email. Please do not reply directly to this address.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
