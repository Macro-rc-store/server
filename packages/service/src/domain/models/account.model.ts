import { Schema, model } from 'mongoose';
import { AccountRole, AccountDocument } from '../entities/account.entity';


const AccountSchema = new Schema<AccountDocument>({
  email: {type: String},
  username: {type: String},
  password: {type: String},
  role: {type: String, enum: AccountRole},
  balance: {type: Number},
}, {
  timestamps: true
});

const Accounts = model<AccountDocument>('Account', AccountSchema);

export default Accounts;
