import EmailRepository from "../repositories/email.repository";

class EmailService {
  repository: EmailRepository;

  constructor() {
    this.repository = new EmailRepository();
  }
}

export default EmailService;