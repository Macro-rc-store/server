import BaseRepository from '../../../../../shared/repository/base.repository';
import { VariantDocument } from '../entities/variant.entity';
import Variants from '../models/variant.model';


class VariantRepository extends BaseRepository<VariantDocument> {
  constructor() {
    super(Variants);
  }
}

export default VariantRepository;