import { Document } from 'mongoose';

export interface AccountDocument extends Document{
  email: string;
  username: string;
  password: string;
  balance: number;
}