// Test script để kiểm tra tính năng reload tin nhắn hỗ trợ với format mới từ server
// Chạy file này trong console của browser để test

console.log('🧪 Testing Support Message Reload Feature with New Server Format...');

// Simulate incoming support message với format mới từ server
const testSupportMessage = {
  type: 'support_message',
  from: 'partner_test_id_12345',
  message: 'Test message content for reload feature with new format',
  ticketId: 'ticket_test_' + Date.now(),
  updatedContent: [
    'Vừa tạo 1 ticket cho Test User - Test Order',
    'partner_test_id_12345: Test message content for reload feature with new format'
  ]
};

// Simulate message sent confirmation
const testMessageSentConfirmation = {
  type: 'message_sent',
  ticketId: 'ticket_test_' + Date.now(),
  message: 'Message sent successfully',
  updatedContent: [
    'Vừa tạo 1 ticket cho Test User - Test Order',
    'user_id_12345: User reply message',
    'partner_test_id_12345: Partner response message'
  ]
};

// Function để test việc reload với format mới
function testSupportMessageReload() {
  console.log('📨 Sending test support message with new format...');
  
  // Dispatch custom event để simulate WebSocket message
  const event = new CustomEvent('websocket_message', {
    detail: testSupportMessage
  });
  
  window.dispatchEvent(event);
  
  console.log('✅ Test message sent with new format. Check console for reload logs.');
  console.log('Expected logs:');
  console.log('  - "💬 New support message received:" with full message object');
  console.log('  - "Support message - ticketId: [id], from: [fromId], message: [content]"');
  console.log('  - "🔄 Loading support messages for user: [userId]"');
  console.log('  - "✅ Support messages loaded successfully: [count] tickets created"');
}

// Function để test message sent confirmation
function testMessageSentConfirmation() {
  console.log('📩 Sending test message sent confirmation...');
  
  const event = new CustomEvent('websocket_message', {
    detail: testMessageSentConfirmation
  });
  
  window.dispatchEvent(event);
  
  console.log('✅ Test confirmation sent. Check console for reload logs.');
  console.log('Expected logs:');
  console.log('  - "✅ Message sent confirmation:" with confirmation object');
  console.log('  - "📩 Message sent successfully, reloading messages..."');
  console.log('  - Reload should happen after 500ms delay');
}

// Function để test multiple messages để kiểm tra debounce
function testMultipleSupportMessages() {
  console.log('📨 Sending multiple test support messages to test debounce...');
  
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const testMessage = {
        ...testSupportMessage,
        ticketId: 'ticket_test_' + Date.now() + '_' + i,
        from: 'partner_test_' + i,
        message: `Test message ${i + 1} for debounce testing`,
        updatedContent: [
          `Vừa tạo 1 ticket cho Test User ${i + 1} - Test Order ${i + 1}`,
          `partner_test_${i}: Test message ${i + 1} for debounce testing`
        ]
      };
      
      const event = new CustomEvent('websocket_message', {
        detail: testMessage
      });
      
      window.dispatchEvent(event);
      console.log(`✅ Test message ${i + 1} sent`);
    }, i * 200); // Send every 200ms to test debounce
  }
  
  console.log('Expected: First message should trigger reload, subsequent messages should be debounced');
  console.log('Look for "⏱️ Reload debounced - too soon since last reload" messages');
}

// Function để test legacy format (backward compatibility)
function testLegacyFormat() {
  console.log('📨 Testing legacy message format for backward compatibility...');
  
  const legacyMessage = {
    type: 'support_message',
    data: {
      _id: 'legacy_msg_' + Date.now(),
      sender: 'legacy_sender_123',
      receiver: 'legacy_receiver_456',
      content: ['Legacy format message content'],
      createdAt: new Date().toISOString(),
      read: false
    }
  };
  
  const event = new CustomEvent('websocket_message', {
    detail: legacyMessage
  });
  
  window.dispatchEvent(event);
  
  console.log('✅ Legacy format test sent. Should still trigger reload for backward compatibility.');
}

// Function để test performance với nhiều message liên tiếp
function testPerformanceWithManyMessages() {
  console.log('🚀 Performance testing with many rapid messages...');
  
  const startTime = Date.now();
  let reloadCount = 0;
  
  // Override console.log temporarily to count reloads
  const originalLog = console.log;
  console.log = function(...args) {
    if (args[0] && args[0].includes('🔄 Loading support messages')) {
      reloadCount++;
    }
    originalLog.apply(console, args);
  };
  
  // Send 20 messages rapidly
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const testMessage = {
        ...testSupportMessage,
        ticketId: 'performance_test_' + i,
        from: 'perf_test_' + i,
        message: `Performance test message ${i + 1}`
      };
      
      const event = new CustomEvent('websocket_message', {
        detail: testMessage
      });
      
      window.dispatchEvent(event);
      
      // Check if we're done
      if (i === 19) {
        setTimeout(() => {
          const endTime = Date.now();
          console.log = originalLog; // Restore original console.log
          console.log(`🏁 Performance test completed in ${endTime - startTime}ms`);
          console.log(`📊 Total reloads triggered: ${reloadCount} (should be much less than 20 due to debounce)`);
          console.log(`⚡ Expected: ~2-3 reloads for 20 rapid messages (2 second debounce)`);
        }, 1000);
      }
    }, i * 50); // Very rapid - 50ms apart
  }
}

// Export functions for manual testing
window.testSupportMessageReload = testSupportMessageReload;
window.testMessageSentConfirmation = testMessageSentConfirmation;
window.testMultipleSupportMessages = testMultipleSupportMessages;
window.testLegacyFormat = testLegacyFormat;
window.testPerformanceWithManyMessages = testPerformanceWithManyMessages;

console.log('🎯 Test functions available:');
console.log('- testSupportMessageReload(): Test single message reload with new format');
console.log('- testMessageSentConfirmation(): Test message sent confirmation');
console.log('- testMultipleSupportMessages(): Test debounce with multiple messages');
console.log('- testLegacyFormat(): Test backward compatibility with old format');
console.log('- testPerformanceWithManyMessages(): Performance test with many rapid messages');
console.log('');
console.log('💡 Usage: Call these functions in browser console to test');
console.log('📋 Example: testSupportMessageReload()');

// Auto-run basic test after 2 seconds
setTimeout(() => {
  console.log('🔄 Auto-running basic test in 2 seconds...');
  setTimeout(testSupportMessageReload, 2000);
}, 2000);
