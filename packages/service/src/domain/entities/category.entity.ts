import { Document } from "mongoose";

export interface CategoryDocument extends Document {
  title: string;
  type: string;
  description?: string;
}