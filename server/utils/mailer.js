const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP verification email
 */
async function sendOTPEmail(to, name, otp) {
  return transporter.sendMail({
    from: `"DataBot 🎓" <${process.env.FROM_EMAIL}>`,
    to,
    subject: 'Your DataBot Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#141929;border:1px solid #1e2d4a;border-radius:16px;overflow:hidden;">
              <!-- Header -->
              <tr><td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:32px;text-align:center;">
                <div style="font-size:42px;margin-bottom:8px;">🎓</div>
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">DataBot</h1>
                <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Department Report Intelligence System</p>
              </td></tr>
              <!-- Body -->
              <tr><td style="padding:36px 40px;">
                <h2 style="color:#f0f4ff;font-size:18px;margin:0 0 12px;">Hey ${name}! 👋</h2>
                <p style="color:#8899bb;font-size:14px;line-height:1.7;margin:0 0 28px;">
                  Welcome to DataBot! Use the verification code below to complete your signup. 
                  This code expires in <strong style="color:#f0f4ff;">10 minutes</strong>.
                </p>
                <!-- OTP Box -->
                <div style="background:#0d1322;border:2px solid #3b82f6;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                  <p style="color:#8899bb;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;font-weight:600;">Verification Code</p>
                  <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#fff;text-shadow:0 0 30px rgba(59,130,246,0.6);">${otp}</div>
                </div>
                <p style="color:#4a5a7a;font-size:12px;line-height:1.6;margin:0;">
                  If you didn't request this, you can safely ignore this email. 
                  Never share this code with anyone.
                </p>
              </td></tr>
              <!-- Footer -->
              <tr><td style="border-top:1px solid #1e2d4a;padding:20px 40px;text-align:center;">
                <p style="color:#4a5a7a;font-size:11px;margin:0;">© 2024 DataBot · Department Report Intelligence System</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}

/**
 * Send welcome email after successful registration
 */
async function sendWelcomeEmail(to, name, username) {
  return transporter.sendMail({
    from: `"DataBot 🎓" <${process.env.FROM_EMAIL}>`,
    to,
    subject: 'Welcome to DataBot! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#141929;border:1px solid #1e2d4a;border-radius:16px;overflow:hidden;">
              <tr><td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:32px;text-align:center;">
                <div style="font-size:42px;margin-bottom:8px;">🎉</div>
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">You're in!</h1>
              </td></tr>
              <tr><td style="padding:36px 40px;">
                <h2 style="color:#f0f4ff;font-size:18px;margin:0 0 12px;">Welcome, ${name}!</h2>
                <p style="color:#8899bb;font-size:14px;line-height:1.7;margin:0 0 20px;">
                  Your DataBot account has been successfully created. 
                  You can now sign in using your credentials.
                </p>
                <div style="background:#0d1322;border:1px solid #1e2d4a;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                  <p style="color:#4a5a7a;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Your Username</p>
                  <p style="color:#f0f4ff;font-size:18px;font-weight:700;margin:0;letter-spacing:0.5px;">${username}</p>
                </div>
                <p style="color:#4a5a7a;font-size:12px;">Keep your credentials safe. You're all set! 🚀</p>
              </td></tr>
              <tr><td style="border-top:1px solid #1e2d4a;padding:20px 40px;text-align:center;">
                <p style="color:#4a5a7a;font-size:11px;margin:0;">© 2024 DataBot · Department Report Intelligence System</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}

module.exports = { sendOTPEmail, sendWelcomeEmail };
