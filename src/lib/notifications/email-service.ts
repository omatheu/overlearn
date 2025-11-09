import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Email Service for sending notification emails
 * Uses SMTP configuration from environment variables
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize SMTP transporter
   */
  private initialize() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    // Check if all required env vars are present
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.warn(
        "[EmailService] SMTP not configured. Email notifications will be disabled."
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.isConfigured = true;
      console.log("[EmailService] SMTP configured successfully");
    } catch (error) {
      console.error("[EmailService] Failed to initialize SMTP:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if email service is configured and ready
   */
  public isReady(): boolean {
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Send an email
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isReady()) {
      console.warn(
        "[EmailService] Cannot send email: Service not configured"
      );
      return false;
    }

    try {
      const emailFrom = process.env.EMAIL_FROM || "OverLearn <noreply@overlearn.app>";

      await this.transporter!.sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || this.generateHtml(options.text, options.subject),
      });

      console.log(`[EmailService] Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error("[EmailService] Failed to send email:", error);
      return false;
    }
  }

  /**
   * Generate simple HTML template for email
   */
  private generateHtml(text: string, subject: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 OverLearn</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <p>${text.replace(/\n/g, "<br>")}</p>
    </div>
    <div class="footer">
      <p>This is an automated message from OverLearn.</p>
      <p>You can manage your notification preferences in the app settings.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send notification email
   */
  public async sendNotificationEmail(
    to: string,
    title: string,
    message: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: title,
      text: message,
    });
  }

  /**
   * Test email configuration
   */
  public async testConnection(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.transporter!.verify();
      console.log("[EmailService] Connection test successful");
      return true;
    } catch (error) {
      console.error("[EmailService] Connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
