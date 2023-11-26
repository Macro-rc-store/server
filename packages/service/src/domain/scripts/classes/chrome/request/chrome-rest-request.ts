import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults, HeadersDefaults, RawAxiosRequestHeaders } from "axios";
import module from "../../../module";
import { SERVER_CLASS, WORKER } from "../../../codes";
import ScriptStore from "../../../store";
import Script from "../../../script";

class ChromeRestRequest {
  private axios: typeof axios;
  private axiosInstance: AxiosInstance;

  constructor(module: module, options?: {
    timeout?: number,
    headers?: AxiosHeaders | Partial<HeadersDefaults> | Partial<RawAxiosRequestHeaders>
  }) {
    this.axios = module.import(WORKER.AXIOS) as typeof axios;
    this.updateHeadersBeforeSend(options?.headers);
    this.axiosInstance = this.axios.create({
      timeout: options?.timeout ? options.timeout * 1000 : undefined,
      headers: options?.headers ? this.convertToReplaceableHeaders(options.headers) : {}
    });
  }

  private updateHeadersBeforeSend(headers: AxiosHeaders | Partial<HeadersDefaults> | Partial<RawAxiosRequestHeaders> | any | undefined) {
    const window: any = globalThis;
    const regex = /_r_(.*?)_r_/;

    function isReplaceableHeader(name: string) {
      return regex.test(name);
    }
  
    function extractHeaderFromReplaceable(name: string) {
      const match = name.match(regex);
  
      if (match && match[1]) {
        const value = match[1];
        return value;
      } else {
        return undefined;
      }
    }

    if (window._listeners_updateHeadersBeforeSend) {
      chrome.webRequest.onBeforeSendHeaders.removeListener(window._listeners_updateHeadersBeforeSend);
    }

    window._listeners_updateHeadersBeforeSend = function (details: chrome.webRequest.WebRequestHeadersDetails) {
      let { requestHeaders } = details;

      if (headers) {
        for(let name in headers) {
          if (name && headers[name]) {
            requestHeaders?.push({
              name: name,
              value: headers[name] as string
            });
          }
        }
      }
      
      if (requestHeaders) {
        const replaceAbleHeaderNames = requestHeaders.filter(header => isReplaceableHeader(header.name)).map(header => extractHeaderFromReplaceable(header.name)?.toLowerCase());

        requestHeaders = requestHeaders.filter(header => {
          return !replaceAbleHeaderNames.includes(header.name.toLowerCase());
        }).map(header => {
          if (isReplaceableHeader(header.name)) {
            header.name = extractHeaderFromReplaceable(header.name) || header.name;
          }

          return header;
        });
      }

      return { requestHeaders };
    };

    chrome.webRequest.onBeforeSendHeaders.addListener(
      window._listeners_updateHeadersBeforeSend,
      { urls: ["<all_urls>"] },
      ['blocking', 'requestHeaders', 'extraHeaders']
    );
  }

  private convertToReplaceableHeaders(headers: AxiosHeaders | Partial<HeadersDefaults> | Partial<RawAxiosRequestHeaders> | any) {
    for (let name in headers) {
      const newHeaderName = `_r_${name}_r_`;
      headers[newHeaderName] = headers[name];
      delete headers[name];
    }
    
    return headers;
  }

  request(config: AxiosRequestConfig<any>) {
    config.headers = this.convertToReplaceableHeaders(config.headers);
    
    return this.axiosInstance.request(config);
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.REST_REQUEST,
    content: ChromeRestRequest,
    name: 'ChromeRestRequest class'
  })
);

export default ChromeRestRequest;