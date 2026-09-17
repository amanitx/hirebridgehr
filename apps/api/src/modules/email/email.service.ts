import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('smtp.host');
    const user = this.config.get<string>('smtp.user');
    const pass = this.config.get<string>('smtp.pass');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('smtp.port'),
        secure: false,
        auth: { user, pass },
      });
      this.logger.log('SMTP configured');
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async send(to: string, subject: string, html: string, template = 'generic') {
    const from = this.config.get<string>('smtp.from')!;

    if (!this.transporter) {
      this.logger.log(`📧 [DEV EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.log(`   Body: ${html.substring(0, 200)}...`);
      return { sent: false, reason: 'no-smtp' };
    }

    try {
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`📧 Email sent to ${to} (${template})`);
      return { sent: true };
    } catch (err) {
      this.logger.error(`Email failed to ${to}: ${err.message}`);
      return { sent: false, reason: err.message };
    }
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.config.get('apiUrl')}/api/auth/verify-email?token=${token}`;
    const html = `
      <h2>Welcome to HirebridgeHR, ${name}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${url}">Verify Email</a></p>
      <p>Or copy this token: <code>${token}</code></p>
    `;
    return this.send(to, 'Verify your HirebridgeHR email', html, 'verify-email');
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const url = `${this.config.get('webUrl')}/reset-password?token=${token}`;
    const html = `
      <h2>Password Reset</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${url}">Reset Password</a></p>
      <p>Or copy this token: <code>${token}</code></p>
    `;
    return this.send(to, 'Reset your HirebridgeHR password', html, 'reset-password');
  }
}
