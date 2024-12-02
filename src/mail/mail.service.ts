import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
/* import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'; */

@Injectable()
export class MailService {
  /*  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('mail.host'),
      port: configService.get<number>('mail.port') || 587,
      secure: false,
      auth: {
        user: configService.get<string>('mail.auth.user'),
        pass: configService.get<string>('mail.auth.pass'),
      },
    });
  } */
  /*  async sendOtp(email: string, otp: string) {
    const mailOptions = await this.transporter.sendMail({
      from: 'youremail@gmail.com',
      to: email,
      subject: 'Verify your email',
      text: `Your otp is ${otp}`,
    });

    await this.transporter.sendMail(mailOptions);
  } */

  constructor(private readonly mailService: MailerService) {}

  // Método para enviar un email
  async sendEmail(to: string, subject: string, template: string, context: any) {
    await this.mailService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
