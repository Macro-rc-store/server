import { Schema, model } from "mongoose";
import { VariantDocument } from "../entities/variant.entity";

const VariantSchema = new Schema<VariantDocument>({
  title: {type: String},
  catagory_id: {type: String},
  description: {sype: String},
  country: {sype: String},
  price: {sype: String}
});

const Variants = model<VariantDocument>('Variant', VariantSchema);

export default Variants;