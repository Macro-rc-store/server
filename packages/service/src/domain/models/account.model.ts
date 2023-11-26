import { Schema, model } from 'mongoose';
import { AccountDocument } from '../entities/account.entity';


const AccountSchema = new Schema<AccountDocument>({
  email: {type: String},
  username: {type: String},
  password: {type: String}
}, {
  timestamps: true
});

const Accounts = model<AccountDocument>('Account', AccountSchema);

export default Accounts;
