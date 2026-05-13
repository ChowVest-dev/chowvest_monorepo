const http = require('http');
http.get('http://localhost:3000/auth', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nHEADERS:', res.headers));
});
