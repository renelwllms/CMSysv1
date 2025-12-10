const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function generateQRCodes() {
  try {
    // Login to get token
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@cafe.com', password: 'Admin123!' });

    const token = loginResponse.access_token;
    console.log('✓ Logged in successfully');

    // Get all tables
    const tables = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/tables',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Found ${tables.length} tables`);

    // Regenerate QR code for each table
    for (const table of tables) {
      try {
        await makeRequest({
          hostname: 'localhost',
          port: 4000,
          path: `/api/tables/${table.id}/regenerate-qr`,
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }, {});
        console.log(`✓ Generated QR code for ${table.tableNumber}`);
      } catch (error) {
        console.error(`✗ Failed to generate QR code for ${table.tableNumber}:`, error.message);
      }
    }

    console.log('\n✅ QR code generation complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateQRCodes();
