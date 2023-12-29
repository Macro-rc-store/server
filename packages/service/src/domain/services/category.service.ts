import CategoryRepository from "../repositories/category.repository";

class CategoryService {
  repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }
}

export default CategoryService;