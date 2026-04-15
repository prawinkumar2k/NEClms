import http from "node:http";

const options = {
  hostname: 'localhost',
  port: 8085,
  path: '/api/profile',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ name: 'test' }));
req.end();
