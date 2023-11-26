import {Document} from 'mongoose';
import BaseRepository from "@/shared/repository/base.repository";

abstract class BaseService<T extends Document> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  getById(id: string) {
    return this.repository.findOne({_id: id});
  }

  async deleteByIds(ids: Array<string>) {
    return this.repository.deleteMany({
      _id: {
        $in: ids
      }
    });
  }
}

export default BaseService;