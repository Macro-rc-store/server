import { Schema, model } from "mongoose";
import { EmailDocument, POP3Status } from "../entities/email.entity";

const EmailSchema = new Schema<EmailDocument>({
  product_name: { type: String },
  description: { type: String },
  pop3: { type: String, enum: [POP3Status.ON, POP3Status.OFF] },
  live: { type: String },
  country: { type: String },
  price: { type: Number },
  quantity: { type: Number },
}, {
  timestamps: true
});

const Emails = model<EmailDocument>("Email", EmailSchema);

export default Emails;