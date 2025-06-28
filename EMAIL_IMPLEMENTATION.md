# Email Implementation Guide

This document explains the email functionality implemented for the contact form.

## Overview

The contact form now sends two types of emails:
1. **Contact Notification** - Sent to you when someone submits the form
2. **Auto-Reply** - Sent to the person who submitted the form

## Files Created/Modified

### New Files:
- `src/lib/email.ts` - Email utility functions
- `src/scripts/test-email.ts` - Test script for email functionality
- `GMAIL_SETUP.md` - Gmail setup guide
- `env.example` - Environment variables template

### Modified Files:
- `src/app/api/messages/route.ts` - Updated to send emails
- `package.json` - Added test script and dependencies

## Features

### 1. Contact Notification Email
- **Recipient**: You (the portfolio owner)
- **Content**: 
  - Sender's name, email, and message
  - Formatted HTML with your brand colors
  - Quick action links (reply directly, view in dashboard)
  - Professional styling

### 2. Auto-Reply Email
- **Recipient**: The person who submitted the form
- **Content**:
  - Thank you message
  - 24-hour response promise
  - Links to your projects and social media
  - Professional branding

### 3. Error Handling
- Email failures don't break the contact form
- Messages are still saved to the database
- Detailed error logging for debugging

### 4. Rate Limiting
- Prevents spam with 5 messages per hour per IP
- Configurable limits in the API route

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer @types/nodemailer
npm install --save-dev tsx
```

### 2. Configure Gmail
Follow the detailed guide in `GMAIL_SETUP.md`:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Set up environment variables

### 3. Environment Variables
Create a `.env.local` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Test the Setup
```bash
npm run test-email
```

## Usage

### Frontend
The contact form automatically sends emails when submitted. No changes needed to the frontend code.

### Backend
The API route (`/api/messages`) now:
1. Validates the form data
2. Saves the message to the database
3. Sends notification email to you
4. Sends auto-reply to the sender
5. Returns success/error response

### Testing
Use the test script to verify email functionality:
```bash
npm run test-email
```

## Customization

### Email Templates
Edit the templates in `src/lib/email.ts`:
- `createContactEmailTemplate()` - Notification email
- `sendAutoReply()` - Auto-reply email

### Styling
The emails use inline CSS with your brand colors:
- Primary: `#FF8C00` (Orange)
- Background: `#FFE4CC` (Light Orange)
- Text: Various grays for readability

### Content
Update the email content to match your:
- Name and title
- Social media links
- Portfolio sections
- Response time promises

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Use App Password, not regular password
   - Ensure 2FA is enabled

2. **Emails not sending**
   - Check environment variables
   - Verify Gmail settings
   - Check console logs

3. **Rate limiting**
   - Gmail: 500 emails/day limit
   - Consider alternative services for high volume

### Debug Mode
Enable detailed logging by checking the console output when emails are sent.

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **App Passwords**: Use Gmail App Passwords, not regular passwords
3. **Rate Limiting**: Implemented to prevent abuse
4. **Error Handling**: Email failures don't expose sensitive information

## Alternative Email Services

If you prefer not to use Gmail, you can modify `src/lib/email.ts` to use:

- **SendGrid** (100 emails/day free)
- **Mailgun** (5,000 emails/month free)
- **Resend** (3,000 emails/month free)
- **Brevo** (300 emails/day free)

## Production Deployment

1. Update `NEXT_PUBLIC_SITE_URL` to your domain
2. Set environment variables on your hosting platform
3. Consider using a dedicated email service
4. Monitor email delivery rates
5. Set up error alerts for email failures

## Support

If you encounter issues:
1. Check the `GMAIL_SETUP.md` guide
2. Review the console logs
3. Test with the provided test script
4. Verify your environment variables 