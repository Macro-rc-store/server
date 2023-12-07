import AccountRepository from "../repositories/account.repository";
import config from '../../config/index.config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

class AccountService {
  repository: AccountRepository;
  jwtSecretKey: string;
  defaultExpired: string;
  rememberExpired: string;

  constructor() {
    this.repository = new AccountRepository();
    this.jwtSecretKey = config.jwt.secretKey as string;
    this.defaultExpired = config.jwt.defaultExpired as string;
    this.rememberExpired = config.jwt.rememberExpired as string;
  }

  hashPassword(password: string) {
    return crypto.createHash('md5').update(password).digest("hex");
  }

  async getInfo(username: string) {
    const accountInfo = await this.repository.findOne({username});

    const payload = {
      username: username,
      email: accountInfo?.email,
      balance: accountInfo?.balance
    }

    return payload;
  }

  async authenticate(username: string, password: string, remember?: boolean) {
    const account = await this.repository.findOne({username, password: this.hashPassword(password)});

    if (!account) {
      return false;
    }

    const payload = {
      id: account._id,
      username: account.username
    };
    const token = jwt.sign(
      payload, 
      this.jwtSecretKey, 
      {
        algorithm: 'HS256', 
        expiresIn: (remember) ? this.rememberExpired : this.defaultExpired
      }
    );

    return token;
  }

  async hasExistUserName(username: string) {
    const account = await this.repository.findOne({username});

    if(!account) {
      return false
    }
    return true;
  }

  async createOrUpdate(email: string, username: string, password: string, balance: number = 0) {
    await this.repository.updateOne({
      username
    }, {
      email,
      username,
      password: this.hashPassword(password),
      balance
    }, {
      upsert: true
    });
  }

  async changePassword(username: string, newPassword: string) {
    await this.repository.updateOne({
      username,
    }, {
      password: this.hashPassword(newPassword),
    });
  }

  async updateBalance(username: string, balance: number) {
    await this.repository.updateOne({
      username,
    }, {
      balance: balance,
    });
  }
}

export default AccountService;