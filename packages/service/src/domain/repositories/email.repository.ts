import BaseRepository from "@/shared/repository/base.repository";
import { EmailDocument } from "../entities/email.entity";
import Emails from "../models/email.model";

class EmailRepository extends BaseRepository<EmailDocument> {
  constructor() {
    super(Emails);
  }
}

export default EmailRepository;