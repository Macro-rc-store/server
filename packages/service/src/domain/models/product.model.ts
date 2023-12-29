import { Schema, model } from "mongoose";
import { ProductDocument } from "../entities/product.entity";

const ProductSchema = new Schema<ProductDocument>({
  data: { type: String },
  catagory_id: { type: String },
  variant_id: { type: String },
}, {
  timestamps: true
});

const Products = model<ProductDocument>("Products", ProductSchema);

export default Products;