import { sendContactNotification, sendAutoReply } from '../lib/email';

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
    // Test contact notification
    console.log('1. Testing contact notification...');
    const notificationResult = await sendContactNotification(testData);
    
    if (notificationResult.success) {
      console.log('✅ Contact notification sent successfully');
      console.log(`   Message ID: ${notificationResult.messageId}`);
    } else {
      console.log('❌ Contact notification failed');
      console.log(`   Error: ${notificationResult.error}`);
    }

    console.log('\n2. Testing auto-reply...');
    const autoReplyResult = await sendAutoReply({
      name: testData.name,
      email: testData.email,
      subject: testData.subject
    });

    if (autoReplyResult.success) {
      console.log('✅ Auto-reply sent successfully');
      console.log(`   Message ID: ${autoReplyResult.messageId}`);
    } else {
      console.log('❌ Auto-reply failed');
      console.log(`   Error: ${autoReplyResult.error}`);
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