const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('../api/routes/v1');
const error = require('../api/middlewares/error');
const reqId = require('../api/middlewares/reqId');

/**
 * Express instance
 * @public
 */
const app = express();

app.use(reqId);

app.use(morgan('combined'));

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// secure apps by setting various HTTP headers
app.use(helmet());
app.use(helmet.hidePoweredBy());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount api v1 routes
app.use('/api/v1', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
