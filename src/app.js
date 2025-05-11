const express = require('express');
require('dotenv').config(); // Load .env file at the very beginning

const helmet = require('helmet');
const morgan = require('morgan'); // Corrected variable name
const compression = require('compression');
const setupSwagger = require('./swagger');
const { NotFoundError } = require('./v1/core/api-error'); // Removed unused ApiError
const { errorConverter, errorHandler } = require('./v1/middlewares/error');
const { logger } = require('./v1/utils/logger.util'); // Assuming logger is correctly set up
const { initializeAccessControl } = require('./v1/auth/accessControl'); // Import AccessControl initializer

const app = express();

/**
 * Asynchronous application starter function.
 * Initializes database, AccessControl, and then starts the server.
 */
async function startApplication() {
  try {
    // Initialize AccessControl
    // Choose one:
    initializeAccessControl(); // Default: loads from JSON
    // initializeAccessControl(true); // To attempt loading from DB (requires _loadGrantsFromDatabase to be async or grants pre-loaded)
    // If _loadGrantsFromDatabase is async, initializeAccessControl should be async and awaited here:
    // await initializeAccessControl(true);

    logger.info('AccessControl initialized.', { label: 'APP_STARTUP' });

    // init dbs
    require('./v1/databases/drizzle'); // This should ideally also be async if it performs async ops
    // require('./v1/databases/init.redis'); // Uncomment if using Redis

    logger.info('Databases initialized.', { label: 'APP_STARTUP' });
  } catch (error) {
    logger.error('Failed to initialize core services during startup:', {
      message: error.message,
      stack: error.stack,
      label: 'APP_STARTUP_FATAL',
    });
    process.exit(1); // Exit if critical initializations fail
  }

  // Setup Swagger
  setupSwagger(app);

  // Use common middlewares
  app.use(helmet());
  app.use(morgan('combined')); // Use morgan directly
  app.use(compression());

  // Body-parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Router VERSION 1
  app.use(require('./v1/routes/index.router'));

  // Catch 404 for any other route not handled
  app.use((req, res, next) => {
    next(new NotFoundError('The requested resource was not found on this server.'));
  });

  // Convert other errors to ApiError, if needed
  app.use(errorConverter);

  // Centralized error handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 3051;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, { label: 'SERVER_CORE' });
    logger.info(`API documentation available at http://localhost:${PORT}/api-docs`, {
      label: 'SERVER_CORE',
    });
  });
}

// Start the application
startApplication().catch((error) => {
  // This catch is for any unhandled promise rejection during the async startApplication itself.
  logger.error('Unhandled error during application startup sequence:', {
    message: error.message,
    stack: error.stack,
    label: 'APP_STARTUP_UNHANDLED',
  });
  process.exit(1);
});

module.exports = app; // Export app for testing or other programmatic uses
