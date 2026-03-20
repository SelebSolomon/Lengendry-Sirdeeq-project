import sgMail from "@sendgrid/mail";
import { ENV } from "../../config/env.config.js";
import { EmailOptions } from "./interface/email.options.js";
import { EmailResult } from "./interface/email.result.js";
import { EmailContents } from "./email-template/email-content.js";

class EmailService {
  private readonly appUrl: string;
  private readonly fromEmail: string;
  private initialized = false;

  constructor() {
    this.appUrl = ENV.FRONTEND_URL;
    this.fromEmail = ENV.SENDGRID_FROM;

    sgMail.setApiKey(ENV.SENDGRID_API_KEY);
    this.initialized = true;
  }

  async sendMail(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.initialized) {
        const message = "Email client is not initialized. Check SENDGRID_API_KEY env var.";
        console.error(message);
        return { success: false, error: message };
      }

      await sgMail.send({
        from: options.from ?? this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return { success: true };
    } catch (error: any) {
      console.error(`Failed to send email to ${options.to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(to: string, token: string, name: string): Promise<EmailResult> {
    const verificationLink = `${this.appUrl}/verify-email?token=${token}`;
    return this.sendMail({
      to,
      subject: "Verify Your Email Address",
      html: EmailContents.emailVerification(verificationLink, name),
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
    return this.sendMail({
      to,
      subject: "Welcome to Sirdeaq Project!",
      html: EmailContents.welcome(name),
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<EmailResult> {
    const resetLink = `${this.appUrl}/reset-password?token=${token}`;
    return this.sendMail({
      to,
      subject: "Password Reset Request",
      html: EmailContents.passwordReset(resetLink),
    });
  }
}

export const emailService = new EmailService();
