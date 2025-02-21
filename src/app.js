const express = require('express');

const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const setupSwagger = require('./swagger');
const { ApiError, NotFoundError } = require('./v1/core/api-error');
const { errorConverter, errorHandler } = require('./v1/middlewares/error');

const app = express();

// init dbs
require('./v1/databases/init.mongodb');
// require('./v1/databases/init.redis');

// Thiết lập Swagger
setupSwagger(app);

// user middleware
app.use(helmet());
app.use(morgan('combined'));
// compress responses
app.use(compression());

// add body-parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// router VERSION 1
app.use(require('./v1/routes/index.router'));

// Error Handling Middleware called
app.use((req, res, next) => {
  // throw ApiError.notFound();
  throw new NotFoundError();
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
