import mongoose, { Model } from "mongoose";
import MongoMigration from "./base.migrate";
import Accounts from "../../../domain/models/account.model";
import AccountService from "../../../domain/services/account.service";
import config from "../../../config/index.config";

class AccountMigration implements MongoMigration {
  model: Model<any>;
  service: AccountService;
  
  constructor() {
    this.model = Accounts;
    this.service = new AccountService();
  }

  async createDefaultDocuments() {
    const {email, username, password} = config.admin;
    await this.service.createOrUpdate(email as string, username as string, password as string);
  }

  async up() {
    await this.createDefaultDocuments();
  }
}

export default AccountMigration;