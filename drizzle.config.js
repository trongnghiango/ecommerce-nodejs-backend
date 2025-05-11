// drizzle.config.js (Nếu dùng JavaScript)
require('dotenv').config(); // Đảm bảo biến môi trường được tải

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

module.exports = {
  schema: './src/v1/databases/schema/*',
  out: './src/v1/databases/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};

// // drizzle.config.ts (Nếu dùng TypeScript)
// import type { Config } from 'drizzle-kit';
// import *_ from 'dotenv/config'; // Đảm bảo biến môi trường được tải

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is not set in .env file');
// }

// export default {
//   schema: './src/v1/databases/schema/*', // Đường dẫn tới các file schema
//   out: './src/v1/databases/migrations', // Thư mục chứa migrations
//   driver: 'pg', // Chỉ định driver là PostgreSQL
//   dbCredentials: {
//     connectionString: process.env.DATABASE_URL,
//   },
//   verbose: true, // Hiển thị log chi tiết khi chạy drizzle-kit
//   strict: true,  // Chế độ nghiêm ngặt
// } satisfies Config;
