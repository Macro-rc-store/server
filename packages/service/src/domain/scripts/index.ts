import ScriptStore from "./store";
import * as scripts from './exports';

class ScriptManager {
  private static instance: ScriptManager;
  store: ScriptStore;
  scripts: typeof scripts | undefined;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ScriptManager();
    }

    return this.instance;
  }

  constructor() {
    this.store = ScriptStore.getInstance();
  }

  initialize() {
    this.scripts = scripts;
  }
}

export default ScriptManager;