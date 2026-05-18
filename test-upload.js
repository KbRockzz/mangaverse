const http = require('http');

const data = JSON.stringify({
  name: "Test",
  avatar: "data:image/jpeg;base64," + "A".repeat(3 * 1024 * 1024) // 3MB base64
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/cm3l4023l0001y1g6x5c50u7c', // Just a dummy ID, we just want to see if it parses body or throws 413
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
