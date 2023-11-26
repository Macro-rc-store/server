import BaseRepository from '../../../../../shared/repository/base.repository';
import { AccountDocument } from '../entities/account.entity';
import Accounts from '../models/account.model';


class AccountRepository extends BaseRepository<AccountDocument> {
  constructor() {
    super(Accounts);
  }
}

export default AccountRepository;