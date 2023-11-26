import ITab from "./entities/itab";
import module from "../../../module";
import ScriptStore from "../../../store";
import Script from "../../../script";
import { SERVER_CLASS } from "../../../codes";
import CommonUtils from "../../utils/common.utils";
import IEventData, { ExecuteScriptOptions, ICommandResponse } from "./entities";

class HeadLessTab implements ITab {
  id: number;
  active: boolean;
  commonUtils: CommonUtils;

  private iframe: HTMLIFrameElement;
  private win: Window | null;
  BackgroundCommands: { EXECUTE_SCRIPT: string; };

  constructor(module: module, attrs?: {
    width?: number,
    height?: number;
  }) {
    /**
     * imports
     */
    const CommonUtils = module.import(SERVER_CLASS.UTILS.COMMON);
    this.commonUtils = new CommonUtils();
    /**
     * main
     */
    this.id = Date.now();
    this.active = true;

    this.iframe = document.createElement('iframe');

    this.iframe.width = attrs?.width?.toString() || screen.width.toString();
    this.iframe.height = attrs?.height?.toString() || screen.height.toString();

    this.BackgroundCommands = {
      EXECUTE_SCRIPT: 'execute-script'
    }
    
    document.body.appendChild(this.iframe);

    this.win = this.iframe.contentWindow;

    this.initialize();
  }

  static removeAllTabs() {
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
      iframe.remove();
    });
  }

  private initialize() {
    this.removeXFrameOptionHeader();
    this.modifySecFetchDestHeader('document');
  }
 
  private removeXFrameOptionHeader() {
    const window: any = globalThis;
    const listenerKey = '_listeners_removeXFrameOptionHeaderBeforeReceive';

    if (window[listenerKey]) {
      chrome.webRequest.onHeadersReceived.removeListener(window[listenerKey]);
    }

    window[listenerKey] = function(details: chrome.webRequest.WebResponseHeadersDetails) {
      var headers = details.responseHeaders;
      var filteredHeaders = headers ? headers.filter(function(header) {
        return header.name.toLowerCase() !== 'X-Frame-Options'.toLowerCase();
      }) : headers;
      return { responseHeaders: filteredHeaders };
    };

    chrome.webRequest.onHeadersReceived.addListener(
      window[listenerKey],
      { urls: ['<all_urls>'] },
      ['blocking', 'responseHeaders']
    );
  }

  private modifySecFetchDestHeader(value: string) {
    const window: any = globalThis;
    const api = 'onBeforeSendHeaders';
    const listenerKey = '_listeners_modifySecFetchDestHeaderBeforeSend';

    if (window[listenerKey]) {
      chrome.webRequest[api].removeListener(window[listenerKey]);
    }

    window[listenerKey] = function(details: chrome.webRequest.WebRequestHeadersDetails) {
      var headers = details.requestHeaders;
      
      if (headers) {
        for (var i = 0; i < headers.length; i++) {
          if (headers[i].name.toLowerCase() === 'sec-fetch-dest') {
            headers[i].value = value;
            break;
          }
        }
      }

      return { requestHeaders: headers };
    };

    chrome.webRequest[api].addListener(
      window[listenerKey],
      { urls: ['<all_urls>'] },
      ['blocking', 'requestHeaders', 'extraHeaders']
    );
  }

  async waitForLoad(): Promise<void> {
    const _this = this;
    const loadEvent = 'load';
    
    return new Promise(function(resolve){
      if (!_this.iframe) {
        return resolve();
      }

      function listener() {
        resolve();
        _this.iframe?.removeEventListener(loadEvent, listener);
      }

      _this.iframe?.addEventListener(loadEvent, listener);
    });
  }

  getUrl(): string {
    if (!this.active) {
      throw new Error('This tab inactive!');
    }

    return this.iframe.src;
  }

  goto(url: string) {
    if (!this.active) {
      throw new Error('This tab inactive!');
    }

    this.iframe.src = url;
    return this.waitForLoad();
  }

  close() {
    this.iframe.remove();
    this.active = false;
  }

  async executeScript(script: Function, options: ExecuteScriptOptions, ...args: Array<any>): Promise<any> {
    if (!this.active) {
      throw new Error('This tab inactive!');
    }

    const cid = this.commonUtils.randomUid();
    const BackgroundCommands = this.BackgroundCommands;
    const {timeout} = options;
    const message = <IEventData> {
      cmd: this.BackgroundCommands.EXECUTE_SCRIPT,
      params: {
        script: script.toString(),
        args: [...args] || [],
        cid: cid
      }
    }

    this.win?.postMessage(message, '*');

    return new Promise(function(resolve, reject){
      let executed = false;

      function receiveMessage(event: MessageEvent<any>) {
        const data: ICommandResponse = event.data;

        if (data.cmd == BackgroundCommands.EXECUTE_SCRIPT && data.cid == cid) {
          executed = true;
          removeEventListener('message', receiveMessage);

          if (data.error) {
            const error = new Error(data.error.message);
            error.name = data.error.name;
            error.stack = data.error.stack;
            return reject(error);
          }
          
          resolve(data.result);
        }
      }

      if (timeout && !executed) {
        setTimeout(function(){
          reject(new Error('Timeout!'));
        }, timeout);
      }

      addEventListener('message', receiveMessage, false);
    });
  }

  async click(selector: string, options?: ExecuteScriptOptions) {
    return this.executeScript(function(selector: string){
      const element: HTMLButtonElement | null = document.querySelector(selector);
      
      if (element) {
        element.click();
      } else {
        throw new Error('Element is null');
      }
    }, options || {}, selector);
  }

  async setValue(selector: string, value: string, options?: ExecuteScriptOptions) {
    return this.executeScript(function(selector: string, value: string){
      const element: HTMLInputElement | HTMLSelectElement | null = document.querySelector(selector);
      
      if (element) {
        element.value = value;
      } else {
        throw new Error(`Element: (${selector}) is null`);
      }
    }, options || {}, selector, value);
  }

  async getValue(selector: string, options?: ExecuteScriptOptions): Promise<string> {
    return this.executeScript(function(selector: string){
      const element: HTMLInputElement | HTMLSelectElement | null = document.querySelector(selector);
      
      if (element) {
        return element.value;
      } else {
        throw new Error(`Element: (${selector}) is null`);
      }
    }, options || {}, selector);
  }

  async waitForSelector(selector: string, options?: ExecuteScriptOptions) {
    return this.executeScript(async function(selector: string){
      return new Promise(function(resolve){
        const intervalId = setInterval(function(){
          const element = document.querySelector(selector);
          console.log(element)
          if (element) {
            clearInterval(intervalId);
            resolve(true);
          }
        }, 100);
      });
    }, options || {}, selector);
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.TAB.HEADLESS,
    content: HeadLessTab,
    name: 'HeadLessTab class'
  })
);

export default HeadLessTab;