import BaseRepository from '../../../../../shared/repository/base.repository';
import { CategoryDocument } from '../entities/category.entity';
import Categories from '../models/category.model';


class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor() {
    super(Categories);
  }
}

export default CategoryRepository;