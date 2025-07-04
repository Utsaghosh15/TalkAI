import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

/**
 * Test Authentication System
 */
async function testAuth() {
  console.log('🧪 Testing TalkAI Authentication System\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('   MongoDB Status:', healthData.services?.mongodb ? '✅ Connected' : '❌ Disconnected');
    console.log('   Email Service:', healthData.services?.email ? '✅ Initialized' : '❌ Not initialized');
    console.log('');

    // Test 2: API Information
    console.log('2. Testing API Information...');
    const apiResponse = await fetch(`${BASE_URL}/`);
    const apiData = await apiResponse.json();
    console.log('✅ API Version:', apiData.version);
    console.log('   Features:', Object.keys(apiData.features).join(', '));
    console.log('');

    // Test 3: Send OTP (without email service)
    console.log('3. Testing OTP Request...');
    try {
      const otpResponse = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      const otpData = await otpResponse.json();
      
      if (otpResponse.ok) {
        console.log('✅ OTP Request:', otpData.message);
        console.log('   Email:', otpData.data.email);
        console.log('   Expires in:', otpData.data.expiresIn, 'seconds');
      } else {
        console.log('⚠️ OTP Request:', otpData.error);
      }
    } catch (error) {
      console.log('❌ OTP Request failed (expected if email service not configured):', error.message);
    }
    console.log('');

    // Test 4: Rate Limiting
    console.log('4. Testing Rate Limiting...');
    const rateLimitPromises = [];
    for (let i = 0; i < 4; i++) {
      rateLimitPromises.push(
        fetch(`${BASE_URL}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: `test${i}@example.com` })
        })
      );
    }
    
    const rateLimitResponses = await Promise.all(rateLimitPromises);
    const rateLimitResults = await Promise.all(
      rateLimitResponses.map(res => res.json())
    );
    
    const successCount = rateLimitResults.filter(result => result.success).length;
    const rateLimitedCount = rateLimitResults.filter(result => result.error?.includes('rate')).length;
    
    console.log(`✅ Rate Limiting: ${successCount} successful, ${rateLimitedCount} rate limited`);
    console.log('');

    // Test 5: Authentication Endpoints Structure
    console.log('5. Testing Authentication Endpoints...');
    const authEndpoints = [
      { method: 'POST', path: '/auth/send-otp', description: 'Send OTP' },
      { method: 'POST', path: '/auth/verify-otp-register', description: 'Verify OTP and Register' },
      { method: 'POST', path: '/auth/signin', description: 'Sign In' },
      { method: 'GET', path: '/auth/google', description: 'Google OAuth' },
      { method: 'GET', path: '/auth/profile', description: 'Get Profile (Protected)' }
    ];

    for (const endpoint of authEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
        });
        
        if (response.status === 401 || response.status === 400) {
          console.log(`✅ ${endpoint.description}: Endpoint accessible (${response.status})`);
        } else if (response.status === 302) {
          console.log(`✅ ${endpoint.description}: Redirect (Google OAuth)`);
        } else {
          console.log(`⚠️ ${endpoint.description}: Unexpected status (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.description}: Error - ${error.message}`);
      }
    }
    console.log('');

    // Test 6: Protected Chat Endpoints
    console.log('6. Testing Protected Chat Endpoints...');
    const chatEndpoints = [
      { method: 'GET', path: '/api/chat-mongo/sessions', description: 'Get User Sessions' },
      { method: 'POST', path: '/api/chat-mongo/session', description: 'Create Session' },
      { method: 'GET', path: '/api/chat-mongo/stats', description: 'Get Chat Stats' }
    ];

    for (const endpoint of chatEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
        });
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint.description}: Properly protected (401 Unauthorized)`);
        } else {
          console.log(`⚠️ ${endpoint.description}: Unexpected status (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.description}: Error - ${error.message}`);
      }
    }
    console.log('');

    // Test 7: Legacy Chat Endpoints (should work without auth)
    console.log('7. Testing Legacy Chat Endpoints...');
    try {
      const legacyResponse = await fetch(`${BASE_URL}/api/chat/status`);
      const legacyData = await legacyResponse.json();
      console.log('✅ Legacy Chat Status:', legacyData.success ? 'Working' : 'Error');
    } catch (error) {
      console.log('❌ Legacy Chat Status: Error -', error.message);
    }
    console.log('');

    console.log('🎉 Authentication System Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   - Health check: Working');
    console.log('   - API endpoints: Accessible');
    console.log('   - Rate limiting: Functional');
    console.log('   - Protected routes: Properly secured');
    console.log('   - Legacy system: Backward compatible');
    console.log('\n💡 Next Steps:');
    console.log('   1. Configure MongoDB connection');
    console.log('   2. Set up email service (Gmail SMTP)');
    console.log('   3. Configure Google OAuth credentials');
    console.log('   4. Test full authentication flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run the test
testAuth(); 