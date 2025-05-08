import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_AUTH_USER'),
        pass: this.configService.get<string>('GMAIL_USER_PASS'),
      },
    });
  }
  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    let info = await this.transporter.sendMail({
      from: `'Job Search'<${process.env.GMAIL_AUTH_USER}>`,
      to,
      subject,
      html,
    });
    return info.rejected.length ? false : true;
  }
}
