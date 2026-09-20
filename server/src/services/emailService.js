const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (config.EMAIL_USER && config.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });
    }
  }

  async sendOTPEmail({ to, name, otp }) {
    console.log(`\n======================================================`);
    console.log(`📨 [QuickCourt Mailer] Generating OTP Email for: ${to}`);
    console.log(`🔐 OTP CODE: [ ${otp} ] (Valid for 10 minutes)`);
    console.log(`======================================================\n`);

    if (!config.EMAIL_PASS) {
      console.warn(`⚠️ [QuickCourt Mailer] EMAIL_PASS is not configured in server/.env.`);
      console.warn(`   To deliver emails directly to user inbox, generate a 16-character Google App Password from:`);
      console.warn(`   https://myaccount.google.com/apppasswords`);
      console.warn(`   and add it as EMAIL_PASS in server/.env`);
      return { sent: false, reason: 'EMAIL_PASS_MISSING' };
    }

    try {
      if (!this.transporter) {
        this.initTransporter();
      }

      const mailOptions = {
        from: `"QuickCourt Sports" <${config.EMAIL_USER}>`,
        to,
        subject: `Your QuickCourt Verification Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #10b981; margin: 0; font-size: 28px; letter-spacing: 1px;">QuickCourt</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Local Sports Ground & Turf Booking Platform</p>
            </div>
            
            <div style="background-color: #111827; padding: 30px; border-radius: 10px; border: 1px solid #1f2937; text-align: center;">
              <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 15px;">Email Verification Code</h2>
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                Hello ${name || 'Athlete'},<br/>
                Thank you for creating an account on QuickCourt. Use the 6-digit verification code below to activate your profile:
              </p>
              
              <div style="background-color: #064e3b; border: 2px solid #10b981; border-radius: 8px; padding: 18px 24px; display: inline-block; margin-bottom: 25px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #34d399; font-family: monospace;">${otp}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.<br/>
                If you did not request this verification, please safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px; color: #64748b; font-size: 12px;">
              &copy; ${new Date().getFullYear()} QuickCourt Technologies. All rights reserved.
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ [QuickCourt Mailer] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [QuickCourt Mailer] Failed to send email via SMTP:`, err.message);
      return { sent: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
