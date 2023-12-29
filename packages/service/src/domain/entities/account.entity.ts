import { Document } from 'mongoose';

export enum AccountRole {
  USER = "user",
  ADMIN = "admin"
}

export interface AccountDocument extends Document{
  email: string;
  username: string;
  password: string;
  balance: number;
  role: AccountRole;
}