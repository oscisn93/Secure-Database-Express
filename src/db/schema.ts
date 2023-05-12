import { InferModel } from 'drizzle-orm';
import { 
  mysqlTable,
  varchar
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable("appusers",
{
  username: varchar('username', { length: 255 }),
  password: varchar('password', { length: 255 }),
  info: varchar('info', { length: 255 }),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

