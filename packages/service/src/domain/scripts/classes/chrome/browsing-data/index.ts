import { BaseEntity } from "@/shared/entity/base.entity";
import { SERVER_CLASS } from "../../../codes";
import Script from "../../../script";
import ScriptStore from "../../../store";

class ChromeBrowsingData {
  types: string[];
  chromeInstance: typeof chrome.browsingData;

  constructor() {
    this.types = [
      'appcache',
      'cache',
      'cookies',
      'downloads',
      'fileSystems',
      'formData',
      'history',
      'indexedDB',
      'localStorage',
      'pluginData',
      'passwords',
      'serviceWorkers',
      'webSQL'
    ];

    this.chromeInstance = chrome.browsingData;
  }

  removeAll() {
    const dataTypes: BaseEntity = Object.fromEntries(
      new Map(
        this.types.map(type => [type, true])
      )
    );

    return new Promise((resolve) => {
      this.chromeInstance.remove({}, dataTypes, function () {
        resolve(true);
      });
    });
  }

  removeAllFromOrigins(origins: Array<string>) {
    const dataTypes: BaseEntity = Object.fromEntries(
      new Map(
        this.types.map(type => [type, true])
      )
    );

    return new Promise((resolve) => {
      this.chromeInstance.remove({origins}, dataTypes, function () {
        resolve(true);
      });
    });
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.BROWSING_DATA,
    content: ChromeBrowsingData,
    name: 'ChromeBrowsingData class'
  })
);

export default ChromeBrowsingData;