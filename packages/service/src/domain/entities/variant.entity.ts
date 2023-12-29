import { Document } from "mongoose";

export interface VariantDocument extends Document {
  title: string;
  catagory_id: string;
  description?: string;
  country?: string;
  price: number;
}