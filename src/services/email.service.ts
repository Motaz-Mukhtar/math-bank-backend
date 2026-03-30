import nodemailer from 'nodemailer';
import { env } from '../config/env';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (
  to: string,
  code: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"بنك الرياضيات" <${env.EMAIL_USER}>`,
    to,
    subject: 'تأكيد البريد الإلكتروني - بنك الرياضيات',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>مرحباً بك في بنك الرياضيات!</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <h1 style="color: #14B8A6; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>هذا الرمز صالح لمدة 15 دقيقة.</p>
        <p>إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  code: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"بنك الرياضيات" <${env.EMAIL_USER}>`,
    to,
    subject: 'إعادة تعيين كلمة المرور - بنك الرياضيات',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>رمز إعادة تعيين كلمة المرور الخاص بك هو:</p>
        <h1 style="color: #14B8A6; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>هذا الرمز صالح لمدة 15 دقيقة.</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};
