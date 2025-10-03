import { sendContactFormEmail, sendNotificationEmail } from '../lib/email';

async function testEmailFunctionality() {

  // Test data
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Message',
    message: 'This is a test message to verify email functionality is working correctly.'
  };

  try {
    // Test contact form email
    const contactFormResult = await sendContactFormEmail(testData);
    
    if (contactFormResult) {
    } else {
    }

    const notificationResult = await sendNotificationEmail({
      subject: 'Test Notification',
      message: 'This is a test notification email.',
      type: 'info'
    });

    if (notificationResult) {
    } else {
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailFunctionality()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Email test failed:', error);
      process.exit(1);
    });
}

export default testEmailFunctionality; 