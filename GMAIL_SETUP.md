# Setting up Gmail SMTP for Your Portfolio

This guide will help you set up Gmail SMTP for sending emails from your portfolio application.

## Step 1: Enable 2-Step Verification

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Scroll to "2-Step Verification" and turn it on
4. Follow the prompts to set up 2-Step Verification

## Step 2: Generate App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security"
3. Under "2-Step Verification", scroll down and click on "App passwords"
4. Select "Mail" as the app
5. Select "Other (Custom name)" as the device
6. Enter "Portfolio Website" as the name
7. Click "Generate"
8. Google will generate a 16-digit password. **Copy this password immediately** - you won't be able to see it again!

## Step 3: Configure Your Environment Variables

1. Create a `.env` file in your project root
2. Add the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password
EMAIL_FROM_NAME=Your Name

# For Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true

# Your domain (for email replies)
DOMAIN=gmail.com
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `your-16-digit-app-password` with the app password generated in Step 2
- `Your Name` with your name as you want it to appear in emails

## Step 4: Test Your Setup

1. Start your development server
2. Try sending a test message through your contact form
3. Check your email to ensure you receive the notification
4. Try replying to the email to test the reply functionality

## Troubleshooting

If you encounter issues:

1. **Emails not sending:**
   - Double-check your app password
   - Ensure 2-Step Verification is enabled
   - Verify your Gmail account hasn't been blocked for security reasons

2. **"Less secure app access" notice:**
   - This is normal and can be ignored when using an App Password
   - App Passwords are secure and recommended by Google

3. **Rate limiting:**
   - Gmail has sending limits (500 per day for regular Gmail)
   - Consider upgrading to Google Workspace for higher limits

## Security Notes

1. Never commit your `.env` file to version control
2. Keep your App Password secure
3. Regularly rotate your App Password for security
4. Monitor your email sending patterns for unusual activity

## Additional Resources

- [Gmail SMTP Documentation](https://support.google.com/mail/answer/7126229)
- [Google Account Security](https://myaccount.google.com/security)
- [Nodemailer Gmail Setup](https://nodemailer.com/usage/using-gmail/)

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use App Passwords instead of regular passwords**
3. **Keep your App Password secure**
4. **Monitor your Gmail account for unusual activity**

## Alternative Email Services

If you prefer not to use Gmail, you can also use:

- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Resend** (Free tier: 3,000 emails/month)
- **Brevo** (Free tier: 300 emails/day)

To use an alternative service, you'll need to modify the `src/lib/email.ts` file to use their SMTP settings instead of Gmail.

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` to your actual domain
2. Ensure your hosting provider supports environment variables
3. Consider using a dedicated email service for better reliability
4. Set up proper error monitoring for email failures 