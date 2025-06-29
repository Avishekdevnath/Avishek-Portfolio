import { sendContactFormEmail, sendNotificationEmail } from '../lib/email';

async function testEmailFunctionality() {
  console.log('Testing email functionality...\n');

  // Test data
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Message',
    message: 'This is a test message to verify email functionality is working correctly.'
  };

  try {
    // Test contact form email
    console.log('1. Testing contact form email...');
    const contactFormResult = await sendContactFormEmail(testData);
    
    if (contactFormResult) {
      console.log('✅ Contact form email sent successfully');
      console.log(`   Message ID: ${contactFormResult.messageId}`);
    } else {
      console.log('❌ Contact form email failed');
    }

    console.log('\n2. Testing notification email...');
    const notificationResult = await sendNotificationEmail({
      subject: 'Test Notification',
      message: 'This is a test notification email.',
      type: 'info'
    });

    if (notificationResult) {
      console.log('✅ Notification email sent successfully');
      console.log(`   Message ID: ${notificationResult.messageId}`);
    } else {
      console.log('❌ Notification email failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailFunctionality()
    .then(() => {
      console.log('\n🎉 Email test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Email test failed:', error);
      process.exit(1);
    });
}

export default testEmailFunctionality; 