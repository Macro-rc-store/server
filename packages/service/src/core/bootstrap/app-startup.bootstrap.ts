import AppMongo from "./mongo.bootstrap";
import AppServer from "./server.bootstrap";
import SubcribeAppBootstrap from "./subcribe-app.bootstrap";

class AppStartup {
  subscribers: Array<SubcribeAppBootstrap>;

  constructor() {
    this.subscribers = [
      new AppMongo,
      new AppServer
    ];
  }

  async initialize() {
    for (let i=0; i<this.subscribers.length; i++) {
      await this.subscribers[i].subcribe();
    }
  }

  start() {
    this.initialize();
  }
}

export default AppStartup;