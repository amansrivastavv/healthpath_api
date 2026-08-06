import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions, SendMailResult } from './mail.interface';
import { getForgotPasswordTemplate } from './templates/forgot-password.template';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.initTransporter();
  }

  private async initTransporter(): Promise<void> {
    const host = this.configService.get<string>('smtp.host');
    const port = this.configService.get<number>('smtp.port');
    const secure = this.configService.get<boolean>('smtp.secure') ?? false;
    const user = this.configService.get<string>('smtp.user');
    const pass = this.configService.get<string>('smtp.pass');

    // Create SMTP transporter
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // Verify SMTP connection on application startup
    try {
      await this.transporter.verify();
      this.logger.log('SMTP Connected Successfully');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMTP Connection Failed: ${errMsg}`);
    }
  }

  async sendMail(options: MailOptions): Promise<SendMailResult> {
    const from = options.from || this.configService.get<string>('smtp.from');
    try {
      const info = (await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })) as { messageId?: string };

      const messageId = info.messageId || 'unknown';
      this.logger.log(
        `Mail Sent Successfully to ${options.to}. Message ID: ${messageId}`,
      );
      return { messageId };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Mail Failed to send to ${options.to}: ${errMsg}`);
      throw new InternalServerErrorException(
        'Failed to send email notification',
      );
    }
  }

  async sendForgotPasswordEmail(
    email: string,
    token: string,
  ): Promise<SendMailResult> {
    const frontendUrl =
      this.configService.get<string>('frontendUrl') || 'http://localhost:3000';
    const html = getForgotPasswordTemplate(frontendUrl, token);
    return this.sendMail({
      to: email,
      subject: 'Reset Your HealthPath Password',
      html,
    });
  }
}
