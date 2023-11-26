import { AnyBulkWriteOperation } from 'mongodb';
import { Model, Document, FilterQuery, ProjectionFields, UpdateQuery, QueryOptions } from 'mongoose';

type BulkOperation<T> = AnyBulkWriteOperation<T extends Document<any, any, any> ? any : T extends {} ? T : any>;

abstract class BaseRepository<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async find(query: FilterQuery<T>, projection?: ProjectionFields<T>): Promise<T[]> {
    return this.model.find(query, projection).exec();
  }

  async findLimit(query: FilterQuery<T>, size: number, projection?: ProjectionFields<T>): Promise<T[]> {
    return this.model.find(query, projection).limit(size).exec();
  }

  async findPagination(query: FilterQuery<T>, page: number, pageSize: number, projection?: ProjectionFields<T>): Promise<T[]> {
    const data = await this.model.find(query, projection)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    return data;
  }

  async count(query: FilterQuery<T>) {
    const count = await this.model.countDocuments(query);
    return count;
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(query).exec();
  }

  async updateOne(query: FilterQuery<T>, data: UpdateQuery<T> | Partial<T>, options?: QueryOptions<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(query, data, options).exec();
  }

  async updateMany(query: FilterQuery<T>, data: UpdateQuery<T> | Partial<T>) {
    const result = await this.model.updateMany(query, data).exec();
    return result;
  }

  async deleteOne(query: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.deleteOne(query).exec();
    return result.deletedCount !== 0;
  }

  async deleteMany(query: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.deleteMany(query).exec();
    return result.deletedCount !== 0;
  }

  async bulkWrite(bulkOperations: AnyBulkWriteOperation<T extends Document<any, any, any> ? any : T extends {} ? T : any>[]) {
    const result = await this.model.bulkWrite(bulkOperations);
    return result;
  }    
}

export default BaseRepository;