<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KARMA Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0f172a;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #f8fafc;
            margin: 0;
            font-size: 24px;
            letter-spacing: 2px;
            font-weight: 700;
        }
        .header p {
            color: #94a3b8;
            margin: 6px 0 0 0;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .content {
            padding: 32px 24px;
        }
        .otp-box {
            background-color: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0f172a;
            font-family: monospace;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 24px;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KARMA</h1>
            <p>Premium Real Estate • Kannur</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $name }}</strong>,</p>
            <p>Use the 6-digit verification code below to unlock exact property locations, coordinates, and confidential insights on KARMA Real Estate:</p>
            
            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 10 minutes</div>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                If you did not request this verification code, please ignore this email. Never share your OTP with anyone.
            </p>
        </div>
        <div class="footer">
            © {{ date('Y') }} KARMA Real Estate, Kannur, Kerala. All rights reserved.
        </div>
    </div>
</body>
</html>
