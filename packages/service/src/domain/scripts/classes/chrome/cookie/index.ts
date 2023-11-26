import { SERVER_CLASS } from "../../../codes";
import Script from "../../../script";
import ScriptStore from "../../../store";

class ChromeCookie {
  toString(cookies: chrome.cookies.Cookie[]) {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';');
  }

  getAll(details: chrome.cookies.GetAllDetails): Promise<chrome.cookies.Cookie[]> {
    return new Promise((resolve) => {
      chrome.cookies.getAll(details, resolve);
    });
  }

  setCookie(origin: string, name: string, value: string): Promise<chrome.runtime.LastError | chrome.cookies.Cookie | null> {
    const cookie = {
      url: origin,
      name: name,
      value: value,
      path: '/',
      secure: true,
      expirationDate: Math.floor(Date.now() / 1000) + 3600
    };

    return new Promise((resolve, reject) => {
      chrome.cookies.set(cookie, function(cookie) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(cookie);
      });
    });
  }

  setCookies(origin: string, cookies: Array<{
    name: string,
    value: string
  }>) {
    return Promise.all(cookies.map(cookie => this.setCookie(origin, cookie.name, cookie.value)));
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.COOKIE,
    content: ChromeCookie,
    name: 'ChromeCookie class'
  })
);

export default ChromeCookie;