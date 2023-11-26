import { BaseEntity } from '@/shared/entity/base.entity';
import Imap from 'imap';

export enum EmailBox {
  INBOX = 'INBOX'
}

export interface Email {
  uid: number;
  headers: EmailHeader;
  date: Date;
  body: string;
}

export interface RawEmailHeader {
  from: Array<string>;
  to: Array<string>;
  subject: Array<string>;
  date: Array<Date>;
}

export interface EmailHeader {
  from: string;
  to: string;
  subject: string;
  date: Date;
}

function convertTZ(date: any, tzString: string) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

class HotmailInboxReader {
  private imap: Imap;

  constructor(username: string, password: string) {
    this.imap = new Imap({
      user: username,
      password: password,
      host: 'imap-mail.outlook.com', // imap-mail.outlook.com,
      port: 993,
      tls: true,
      authTimeout: 10 * 1000
    });
  }

  private async authenticate() {
    if (['connected'].includes(this.imap.state)) {
      return true;
    }

    return new Promise((resolve, reject) => {
      this.imap.once('ready', function() {
        resolve(true);
      });

      this.imap.once('error', (error: any) => {
        this.disconnect();
        reject(error);
      });

      this.imap.connect();
    });
  }

  disconnect() {
    try {
      this.imap.closeBox(() => {});
      this.imap.destroy();
      this.imap.end();
    }
    catch(error) {
      
    }
  }

  async searchInbox(criteria: any[]): Promise<Array<Email>> {
    await this.authenticate();

    return new Promise((resolve, reject) => {
      this.imap.openBox(EmailBox.INBOX, true, (error: Error) => {
        if (error) {
          this.disconnect();
          return reject(error);
        }

        this.imap.search(criteria, (searchErr: Error, uids: number[]) => {
          if (uids.length == 0) {
            this.disconnect();
            return resolve([]);
          }

          if (searchErr) {
            this.disconnect();
            return reject(searchErr);
          }

          const fetch = this.imap.fetch(uids, { bodies: '', struct: true });
          const emails: Array<Email> = [];

          fetch.on('message', (message: Imap.ImapMessage) => {
            const email: Email = {
              uid: NaN,
              date: new Date(),
              body: '',
              headers: {
                date: new Date(),
                from: '',
                subject: '',
                to: ''
              }
            };

            message.on('body', (stream: NodeJS.ReadableStream) => {
              let buffer = '';

              stream.on('data', function(chunk) {
                buffer += chunk.toString('utf8');
              });

              stream.once('end', function() {
                const rawHeaders: RawEmailHeader = Imap.parseHeader(buffer) as any;
                const headers: EmailHeader = {
                  date: convertTZ(rawHeaders.date[0], 'Asia/Ho_Chi_Minh'),
                  from: rawHeaders.from[0],
                  subject: rawHeaders.subject[0],
                  to: rawHeaders.to[0]
                };
                
                email.headers = headers;
                email.body = buffer;
              });
            });

            message.on('attributes', (attrs: Imap.ImapMessageAttributes) => {
              email.uid = attrs.uid;
              email.date = convertTZ(attrs.date, 'Asia/Ho_Chi_Minh');
              emails.push(email);
            });

            message.on('end', () => {});
          });

          fetch.once('error', (fetchErr: Error) => {
            this.disconnect();
            return reject(fetchErr);
          });

          fetch.once('end', () => {
            this.disconnect();
            return resolve(emails);
          });
        });
      })
    }); 
  }

  async readAllInbox() {
    return this.searchInbox(['ALL']);
  }

  async readNewInbox() {
    return this.searchInbox(['NEW']);
  }

  async readNewInboxFromEmail(from: string) {
    return this.searchInbox(['NEW', ['FROM', from]]);
  }

  async readNewInboxFromEmailAndSinceDate(from: string, since: Date | string) {
    const date = convertTZ(since, 'Asia/Ho_Chi_Minh');
    date.setDate(date.getDate() - 1);

    return this.searchInbox(['NEW', ['FROM', from], ['SINCE', date]]);
  }
}


export default HotmailInboxReader;