import { Document } from "mongoose";

export interface ProductDocument extends Document {
  data: string;
  catagory_id: string;
  variant_id: string;
}