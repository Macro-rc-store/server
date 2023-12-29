import BaseRepository from "@/shared/repository/base.repository";
import { ProductDocument } from "../entities/product.entity";
import Products from "../models/product.model";

class ProductRepository extends BaseRepository<ProductDocument> {
  constructor() {
    super(Products);
  }
}

export default ProductRepository;