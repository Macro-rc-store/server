import SubcribeAppBootstrap from "./subcribe-app.bootstrap";
import mongoose, { ConnectOptions } from 'mongoose';
import config from '../../config/index.config';
import logger from '../logger/index.logger';
import MongoMigration from "../migration/mongo/base.migrate";
import AccountMigration from "../migration/mongo/account.migrate";

class AppMongo implements SubcribeAppBootstrap {
  uri: string | undefined;
  options: ConnectOptions;
  migrations: Array<MongoMigration>

  constructor() {
    this.uri = config.mongo.uri;
    this.options = {
      minPoolSize: 20,
      maxPoolSize: 100
    };
    this.migrations = [
      new AccountMigration
    ];
  }

  async connect() {
    if (!this.uri) {
      throw new Error('MONGO_URI is not define');
    }

    logger.info('Connecting to MongoDB...');
    await mongoose.connect(this.uri, this.options);
    logger.info('Successfully connected to MongoDB!');
  }

  async migrate() {
    for (let i=0; i<this.migrations.length; i++) {
      await this.migrations[i].up();
      logger.info(`${this.migrations[i].model.modelName} migrated`);
    }
  }

  async subcribe() {
    try {
      await this.connect();
      await this.migrate();
    }
    catch(error) {
      logger.error('Error connecting to MongoDB:', error);
    }
  }
}

export default AppMongo;