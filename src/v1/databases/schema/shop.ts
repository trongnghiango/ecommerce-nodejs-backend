// /src/v1/databases/schema/user.ts (Ví dụ với TypeScript)
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
// import { accountsTable } from './accounts'; // Nếu có quan hệ

// PostgreSQL không có kiểu Array mặc định như MongoDB.
// Bạn có thể dùng kiểu text[] hoặc JSONB. Ở đây ví dụ với text[]

export const shopsTable = pgTable('shops', {
  id: serial('id').primaryKey(), // Auto-incrementing primary key
  username: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  status: varchar('status', { length: 50, enum: ['active', 'inactive'] }).default('inactive'),
  verify: boolean('verify').default(false),
  // roles: rolesArray('roles').default([]), // ['SHOP_OWNER', 'EDITOR']
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Định nghĩa quan hệ nếu cần
// export const shopRelations = relations(shopsTable, ({ many }) => ({
//   accounts: many(accountsTable), // Giả sử một shop có nhiều account liên quan
// }));

export type Shop = typeof shopsTable.$inferSelect; // Type cho select
export type NewShop = typeof shopsTable.$inferInsert; // Type cho insert
