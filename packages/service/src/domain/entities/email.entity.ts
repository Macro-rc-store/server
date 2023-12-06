import { Document } from "mongoose";

export enum POP3Status {
  ON = "ON",
  OFF = "OFF"
}

export interface EmailDocument extends Document {
  product_name: string,
  description: string,
  pop3: POP3Status,
  live: string,
  country: string,
  price: number,
  quantity: number
}