import { Model } from "mongoose";

export default interface MongoMigration {
  model: Model<any>;
  up(): Promise<void> | void;
}