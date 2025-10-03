import nodemailer from 'nodemailer';

interface EmailOptions {
  subject: string;
  text: string;
  html?: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendEmailNotification(options: EmailOptions) {
  try {
    // Don't send emails if credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    // Error sending email
    throw error;
  }
}

export function parseIncomingEmailReply(emailData: any) {
  try {
    return {
      messageId: emailData.messageId,
      from: emailData.from,
      subject: emailData.subject,
      message: emailData.text || emailData.html,
      date: new Date(),
    };
  } catch (error) {
    // Error parsing email reply
    throw error;
  }
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const text = `
    New Contact Form Submission
    
    From: ${data.name}
    Email: ${data.email}
    Subject: ${data.subject}
    
    Message:
    ${data.message}
  `;

  const html = `
    <h2>New Contact Form Submission</h2>
    
    <p><strong>From:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    
    <h3>Message:</h3>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
  `;

  return sendEmailNotification({
    subject: `New Contact Form Message: ${data.subject}`,
    text,
    html
  });
}

export async function sendNotificationEmail(data: {
  subject: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
}) {
  const text = `
    ${data.subject}
    
    ${data.message}
  `;

  const getColorByType = (type: string = 'info') => {
    switch (type) {
      case 'warning':
        return '#FFA500';
      case 'success':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  };

  const html = `
    <div style="padding: 20px; border-left: 4px solid ${getColorByType(data.type)};">
      <h2 style="margin: 0; color: #333;">${data.subject}</h2>
      <p style="margin-top: 10px; color: #666;">${data.message.replace(/\n/g, '<br>')}</p>
    </div>
  `;

  return sendEmailNotification({
    subject: data.subject,
    text,
    html
  });
}

export async function sendReply(data: {
  to: string;
  name: string;
  subject: string;
  originalMessage: string;
  replyMessage: string;
}) {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Contact'}" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: `Re: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${data.name},</p>
          
          <p>${data.replyMessage.replace(/\n/g, '<br>')}</p>
          
          <div style="margin: 20px 0; padding: 20px; border-left: 4px solid #ddd; color: #666;">
            <p><strong>Original Message:</strong></p>
            ${data.originalMessage.replace(/\n/g, '<br>')}
          </div>
          
          <p>Best regards,<br>
          ${process.env.EMAIL_FROM_NAME || 'Portfolio Contact'}</p>
        </div>
      `,
      text: `
Hi ${data.name},

${data.replyMessage}

Original Message:
${data.originalMessage}

Best regards,
${process.env.EMAIL_FROM_NAME || 'Portfolio Contact'}
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    // Error sending reply
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}