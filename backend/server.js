//const app = require('./app');
//
//app.set('port', process.env.PORT || 443);
//
//const server = app.listen(app.get('port'), () => {
//    console.log(`Listening on ${ server.address().port }`);
//});

const https = require('https');
const fs = require('fs');
const app = require('./app');

const options = {
  key: fs.readFileSync('./ssl_keys/squlio.key'),
  cert: fs.readFileSync('./ssl_keys/squlio.crt'),
};

https.createServer(options, app).listen(app.get('port'), () => {
  console.log(`Serwer HTTPS działa na porcie ${app.get('port')}`);
});