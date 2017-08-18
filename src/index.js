import 'babel-polyfill'; // enable Promise
import express from 'express';
import bodyParser from 'body-parser';
import express_validator from 'express-validator';

import config from './config';
import users from './users';
import events from './events';

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express_validator()); // this line must be immediately after any of the bodyParser middlewares!

app.get('/', function(req, res) {
  console.log('Request received');
  res.send('Welcome to Hackathon 2017! We are team "tutugao"');
});

app.use('/users', users);
app.use('/events', events);

app.listen(config.PORT, function() {
  console.log(`App is listening on port ${config.PORT}!`);
});
