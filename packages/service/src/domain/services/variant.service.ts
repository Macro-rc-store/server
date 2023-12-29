import VariantRepository from "../repositories/variant.repository";

class VariantService {
  repository: VariantRepository;

  constructor() {
    this.repository = new VariantRepository();
  }
}

export default VariantService;