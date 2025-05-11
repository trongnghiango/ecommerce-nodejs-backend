// /src/v1/databases/drizzle.js
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
require('dotenv').config(); // Đảm bảo biến môi trường được tải

const { logger } = require('../utils/logger.util');

// Import tất cả các schema của bạn
const shopsSchema = require('./schema/shops');
const usersSchema = require('./schema/users');
const apiKeysSchema = require('./schema/apiKeys');
const keyStoresSchema = require('./schema/keyStores');
const rolesSchema = require('./schema/roles');
const resourcesSchema = require('./schema/resources');
const accountsSchema = require('./schema/accounts');
const adminsSchema = require('./schema/admins');
// ... import các schema khác

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL is not defined in .env file', { label: 'DB_SETUP' });
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Cấu hình SSL nếu cần cho production
});

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database!', { label: 'POSTGRES' });
});

pool.on('error', (err) => {
  logger.error(`PostgreSQL pool error: ${err.message}`, { stack: err.stack, label: 'POSTGRES' });
  process.exit(1); // Thoát nếu không kết nối được DB
});

const db = drizzle(pool, {
  // Ghép tất cả các schema đã import vào một object
  // Drizzle ORM không cần bạn phải truyền schema vào client như thế này
  // mà nó sẽ được import trực tiếp vào service khi cần.
  // Tuy nhiên, export các table object từ đây có thể tiện lợi.
  schema: {
    ...shopsSchema,
    ...usersSchema,
    ...apiKeysSchema,
    ...keyStoresSchema,
    ...rolesSchema,
    ...resourcesSchema,
    ...accountsSchema,
    ...adminsSchema,
  },
  logger:
    process.env.NODE_ENV === 'development' // Kích hoạt Drizzle logger ở dev
      ? {
          logQuery: (query, params) =>
            logger.debug(`DB Query: ${query}`, { params, label: 'DRIZZLE' }),
        }
      : false,
});

module.exports = {
  db, // Drizzle instance
  pool, // pg Pool instance (ít khi cần dùng trực tiếp)
  // Export các table object riêng lẻ để dễ import trong services
  shopsTable: shopsSchema.shopsTable,
  usersTable: usersSchema.usersTable,
  apiKeysTable: apiKeysSchema.apiKeysTable,
  keyStoresTable: keyStoresSchema.keyStoresTable,
  rolesTable: rolesSchema.rolesTable,
  resourcesTable: resourcesSchema.resourcesTable,
  accountsTable: accountsSchema.accountsTable,
  adminsTable: adminsSchema.adminsTable,
};
