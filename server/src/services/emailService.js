import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"NeighborNode" <noreply@neighbornode.com>',
        to,
        subject,
        text,
        html
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to NeighborNode, ${user.firstName}!</h1>
      <p>We're excited to have you as part of our community.</p>
      <p>Start exploring services in your neighborhood today!</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to NeighborNode!',
      html
    });
  }

  async sendBookingNotification(booking, type) {
    // Implementation for booking notifications
    console.log(`Sending ${type} notification for booking ${booking._id}`);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html
    });
  }
}

export default new EmailService();