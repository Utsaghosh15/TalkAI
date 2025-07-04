/**
 * Simple API Test Script
 * Tests the main chat endpoint and service status
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing TalkAI API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Service status
    console.log('\n2. Testing service status...');
    const statusResponse = await fetch(`${BASE_URL}/api/chat/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Service status:', statusData.data);

    // Test 3: Send a chat message
    console.log('\n3. Testing chat endpoint...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello! Can you tell me about yourself?'
      })
    });
    const chatData = await chatResponse.json();
    
    if (chatData.success) {
      console.log('✅ Chat response received');
      console.log('📝 Response:', chatData.data.response.substring(0, 100) + '...');
      console.log('🆔 Session ID:', chatData.data.sessionId);
    } else {
      console.log('❌ Chat failed:', chatData.error);
    }

    // Test 4: Create a session
    console.log('\n4. Testing session creation...');
    const sessionResponse = await fetch(`${BASE_URL}/api/chat/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'testuser123'
      })
    });
    const sessionData = await sessionResponse.json();
    
    if (sessionData.success) {
      console.log('✅ Session created:', sessionData.data.sessionId);
    } else {
      console.log('❌ Session creation failed:', sessionData.error);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run tests
testAPI(); 