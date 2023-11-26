import { SERVER_CLASS } from "../../codes";
import Script from "../../script";
import ScriptStore from "../../store";


class LunaProxy {
  private username: string;
  private password: string;
  private host: string;
  private port: number;
  private region: string;
  private sesstime: number;
  authListenerKey: string;

  constructor(config: {
    username: string,
    password: string,
    host: string, 
    port: number,
    region: string, 
    sesstime: number
  }) {
    this.username = config.username;
    this.password = config.password;
    this.host = config.host;
    this.port = config.port;
    this.region = config.region;
    this.sesstime = config.sesstime;
    this.authListenerKey = '_listeners_authListenerLunaproxy';
  }

  async clear() {
    const window: any = globalThis;

    return new Promise((resolve) => {
      chrome.proxy.settings.clear({}, () => {
        if (window[this.authListenerKey]) {
          chrome.webRequest.onAuthRequired.removeListener(window[this.authListenerKey]);
        }
        chrome.browsingData.remove({}, { passwords: true }, () => resolve(true));
      });
    });
  }

  async set(sessid: string) {
    const _this = this;
    const window: any = globalThis;

    await this.clear();

    return new Promise((resolve) => {
      window[_this.authListenerKey] = () => {
        const pathUsername = `user-${_this.username}`;
        const pathRegion = `region-${_this.region}`;
        const pathSessid = `sessid-${sessid}`;
        const pathSesstime = `sesstime-${_this.sesstime}`;
        const username = (_this.region == 'all') ? [pathUsername, pathSessid, pathSesstime].join('-') : [pathUsername, pathRegion, pathSessid, pathSesstime].join('-');
        const password = _this.password;

        return { authCredentials: { username: username, password: password } };
      };

      chrome.proxy.settings.set(
        {
          value: {
            mode: "pac_script",
            pacScript: {
              data: `function FindProxyForURL(url, host) {
                        if (dnsDomainIs(host, "facebook.com") || dnsDomainIs(host, "fb.me") || dnsDomainIs(host, "fb.com") || dnsDomainIs(host, "ifconfig.me")) {
                          return "PROXY ${_this.host}:${_this.port}; DIRECT";
                        }
                        return "DIRECT";
                      }`,
            },
          },
          scope: "regular",
        },
        () => {
          chrome.webRequest.onAuthRequired.addListener(
            window[this.authListenerKey],
            {
              urls: ["<all_urls>"],
            },
            ["blocking"]
          );
          resolve(true);
        }
      );
    });
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.PROXY.LUNAPROXY,
    content: LunaProxy,
    name: "LunaProxy class",
  })
);

export default LunaProxy;
