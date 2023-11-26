import { SERVER_CLASS } from '../../codes';
import module from '../../module';
import Script from '../../script';
import ScriptStore from '../../store';
import ChromeBrowsingData from './browsing-data';
import ChromeCookie from './cookie';
import ChromeWindow from './window';

class ChromeService {
  browsingData: ChromeBrowsingData;
  cookie: ChromeCookie;
  window: ChromeWindow;

  constructor(module: module) {
    this.browsingData = new (module.import(SERVER_CLASS.CHROME.BROWSING_DATA) as typeof ChromeBrowsingData);
    this.cookie = new (module.import(SERVER_CLASS.CHROME.COOKIE) as typeof ChromeCookie);
    this.window = new (module.import(SERVER_CLASS.CHROME.WINDOW) as typeof ChromeWindow);
  }

  reload() {
    location.reload();
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.MAIN,
    content: ChromeService,
    name: 'ChromeService class'
  })
);

export default ChromeService;