import ProductRepository from "../repositories/product.repository";

class ProductService {
  repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }
}

export default ProductService;