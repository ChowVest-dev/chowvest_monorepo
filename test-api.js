const http = require('http');
http.get('http://localhost:3000/api/commodities', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log('ITEMS COUNT:', Array.isArray(json) ? json.length : 'Not an array');
        if (json.length > 0) console.log('FIRST ITEM:', json[0].name);
      } catch (e) {
        console.log('JSON PARSE ERROR');
      }
    } else {
      console.log('ERROR RESPONSE:', data);
    }
  });
});
