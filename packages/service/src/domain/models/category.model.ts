import { Schema, model } from "mongoose";
import { CategoryDocument } from "../entities/category.entity";

const CategorySchema = new Schema<CategoryDocument>({
  title: {type: String},
  type: {type: String},
  description: {sype: String}
});

const Categories = model<CategoryDocument>('Category', CategorySchema);

export default Categories;