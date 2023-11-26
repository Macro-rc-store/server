import module from "../../module";
import winston from "winston";
import ScriptStore from '../../store';
import Script from "../../script";
import { SERVER_CLASS, WORKER } from '../../codes';
import { ChromeCookie, ChromeRestRequest, CommonUtils } from "../../exports";

class Facebook {
  logger: winston.Logger;
  chromeCookie: ChromeCookie;
  loginStates: {
    CP_956: string;
    CP_2FA: string;
    CP_282: string;
    DISABLED: string;
    CP: string;
    OK: string;
    INVALID_CREDENTIALS: string;
    CONFIRM_EMAIL: string;
  };
  request: ChromeRestRequest;
  commonUtils: CommonUtils;
  
  constructor(module: module, request?: ChromeRestRequest) {
    this.logger = module.import(WORKER.LOGGER);
    this.chromeCookie = new (module.import(SERVER_CLASS.CHROME.COOKIE) as typeof ChromeCookie);
    this.request = request || new (module.import(SERVER_CLASS.CHROME.REST_REQUEST) as typeof ChromeRestRequest)(module);
    this.commonUtils = new (module.import(SERVER_CLASS.UTILS.COMMON) as typeof CommonUtils)(module);

    this.loginStates = {
      CP_2FA: 'CP_2FA',
      CP_956: 'CP_956',
      CP_282: 'CP_282',
      CP: 'CP',
      DISABLED: 'DISABLED',
      OK: 'OK',
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      CONFIRM_EMAIL: 'CONFIRM_EMAIL'
    };
  }

  getCookie() {
    return this.chromeCookie.getAll({domain: 'facebook.com'});
  }

  setCookies(cookies: Array<{ name: string; value: string; }>) {
    const origin = 'https://www.facebook.com';
    return this.chromeCookie.setCookies(origin, cookies);
  }

  async getCookieStr() {
    const cookies = await this.getCookie();
    return this.chromeCookie.toString(cookies);
  }

  async hasCUserCookie() {
    const cookies = await this.getCookie();
    return !!cookies.find(cookie => cookie.name == 'c_user');
  }

  async hasCheckpointCookie() {
    const cookies = await this.getCookie();
    return !!cookies.find(cookie => cookie.name == 'checkpoint');
  }

  async acceptCookie(next?: string) {
    next = next || 'https://mbasic.facebook.com/login/checkpoint';

    const {data, request} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/cookie/consent_prompt/',
      params: {
        next_uri: next,
        refsrc: 'deprecated',
        _rdr: ''
      }
    });

    if (request?.responseURL?.includes('/cookie/consent_prompt')) {
      const dtsgTokenMatch = data.match(/name="fb_dtsg" value="([^"]+)"/);

      if (dtsgTokenMatch) {
        await this.request.request({
          method: 'POST',
          url: 'https://mbasic.facebook.com/cookie/consent/',
          params: {
            next_uri: next,
          },
          headers: {
            'authority': 'mbasic.facebook.com',
            'origin': 'https://www.facebook.com',
            'referer': request?.responseURL,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
          },
          data: new URLSearchParams({
            jazoest: this.randomJazoest(),
            fb_dtsg: dtsgTokenMatch[1],
            accept_only_essential: '0'
          })
        });
      }
    }
  }

  async is2FAcheckpoint(): Promise<any> {
    const {data, request} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/checkpoint',
      headers: {
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (request?.responseURL?.includes('/cookie/consent_prompt')) {
      await this.acceptCookie();
      return this.is2FAcheckpoint();
    }

    return !!(data as string).match(/id="approvals_code"/);
  }

  async getLoginState() {
    const {request} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/home.php'
    });

    const url = new URL(request.responseURL);
    const hasCheckpointCookie = await this.hasCheckpointCookie();

    if (url.pathname.includes('/login')) {

      if (url.pathname.includes('/confirmation') && url.href.includes('confirm_email')) {
        return this.loginStates.CONFIRM_EMAIL;
      }

      if (hasCheckpointCookie) {
        if ((await this.is2FAcheckpoint())) {
          return this.loginStates.CP_2FA;
        }

        return this.loginStates.CP;
      }

      return this.loginStates.INVALID_CREDENTIALS;
    }

    if (url.pathname.includes('/confirmemail') || url.href.includes('confirm_email')) {
      return this.loginStates.CONFIRM_EMAIL;
    }

    if (url.pathname.includes('/disabled')) {
      return this.loginStates.DISABLED;
    }
    
    if (url.href.includes('828281030927956')) {
      return this.loginStates.CP_956;
    }

    if (url.href.includes('1501092823525282')) {
      return this.loginStates.CP_282;
    }

    if (url.href.includes('/checkpoint')) {
      return this.loginStates.CP;
    }

    if (hasCheckpointCookie) {
      if ((await this.is2FAcheckpoint())) {
        return this.loginStates.CP_2FA;
      }
      
      return this.loginStates.CP;
    }

    if ((await this.hasCUserCookie())) {
      return this.loginStates.OK;
    }

    return this.loginStates.INVALID_CREDENTIALS;
  }

  async getComposerData() {
    try {
      const data = await this.getComposerDataMV1();
      return data;
    }
    catch(error) {
      try {
        const data = await this.getComposerDataMbasicV1();
        return data;
      }
      catch(error) {
        try {
          const data = await this.getComposerDataMbasicV2();
          return data;
        }
        catch(error) {
          throw error;
        }
      }
    }
  }

  async getComposerDataMV1() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed'
    });
    const decodedData = (data as string).replace(/\\/g, '');
    const dtsgTokenMatch = decodedData.match(/name="fb_dtsg" value="([^"]+)"/);
    const dtsgAgTokenMatch = decodedData.match(/"dtsg_ag":{"token":"([^"]+)/);
    const nameMatch = decodedData.match(/class="img _1-yc profpic" aria-label="([^"]+)"/);
    const fbIdMatch = decodedData.match(/"USER_ID":"([^"]+)/);

    return {
      dtsg: dtsgTokenMatch ? dtsgTokenMatch[1] : null,
      dtsgAg: dtsgAgTokenMatch ? dtsgAgTokenMatch[1] : null,
      name: nameMatch ? nameMatch[1].split(',')[0] : null,
      fbId: fbIdMatch ? fbIdMatch[1] : null,
    }
  }

  async getComposerDataMbasicV2() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/me'
    });
    const decodedData = (data as string).replace(/\\/g, '');
    const dtsgTokenMatch = decodedData.match(/name="fb_dtsg" value="([^"]+)"/);
    const dtsgAgTokenMatch = decodedData.match(/"dtsg_ag":{"token":"([^"]+)/);
    const nameMatch = decodedData.match(/<title[^>]*>(.*?)<\/title>/i);
    const fbIdMatch = decodedData.match(/name="target" value="([^"]+)"/);

    return {
      dtsg: dtsgTokenMatch ? dtsgTokenMatch[1] : null,
      dtsgAg: dtsgAgTokenMatch ? dtsgAgTokenMatch[1] : null,
      name: nameMatch ? nameMatch[1].split(',')[0] : null,
      fbId: fbIdMatch ? fbIdMatch[1] : null,
    }
  }

  async getComposerDataMbasicV1() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/composer/ocelot/async_loader/?publisher=feed'
    });
    const decodedData = (data as string).replace(/\\/g, '');
    const dtsgTokenMatch = decodedData.match(/name="fb_dtsg" value="([^"]+)"/);
    const dtsgAgTokenMatch = decodedData.match(/"dtsg_ag":{"token":"([^"]+)/);
    const nameMatch = decodedData.match(/<title[^>]*>(.*?)<\/title>/i);
    const fbIdMatch = decodedData.match(/name="target" value="([^"]+)"/);

    return {
      dtsg: dtsgTokenMatch ? dtsgTokenMatch[1] : null,
      dtsgAg: dtsgAgTokenMatch ? dtsgAgTokenMatch[1] : null,
      name: nameMatch ? nameMatch[1].split(',')[0] : null,
      fbId: fbIdMatch ? fbIdMatch[1] : null,
    }
  }

  randomJazoest() {
    return this.commonUtils.randomInteger(20000, 29999).toString();
  }

  randomPassword(length: number) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
    
    return password;
  }

  parseJson(json: string) {
    const jsonStartIndex = json.indexOf('{');
    const jsonSubstring = json.substring(jsonStartIndex);

    try {
      return JSON.parse(jsonSubstring);
    } catch(error) {
      throw new Error(`Invalid json: ${json}`);
    }
  }

  async getEmailsMbasicV1() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/settings/email/?refid=70'
    });
    const formatedData = (data as string).replace(/&#064;/g, '@').replace(/%40/g, '@');

    return Array.from(new Set(formatedData.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g)));
  }

  async getPhonesMbasicV1Ref() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/settings/sms/?refid=70'
    });

    return (data as string).match(/phone_number=([^&]+)/g)?.map(match => decodeURIComponent(match.replace(/phone_number=/, ''))) || [];
  }

  async getPhonesMbasicV1ClaimedV1() {
    const {data} = await this.request.request({
      method: 'GET',
      url: 'https://mbasic.facebook.com/settings/sms/?claimed_phone'
    });

    return (data as string).match(/phone_number=([^&]+)/g)?.map(match => decodeURIComponent(match.replace(/phone_number=/, ''))) || [];
  }

  async getPhonesMbasicV1() {
    try {
      const [phonesRef, phonesClaimed] = await Promise.all([
        this.getPhonesMbasicV1Ref(),
        this.getPhonesMbasicV1ClaimedV1()
      ]);

      return Array.from(new Set([...phonesRef, ...phonesClaimed]));
    }
    catch(error) {
      throw new Error('Sorry, something went wrong.');
    }
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.FACEBOOK.MAIN,
    content: Facebook,
    name: 'Facebook class'
  })
);

export default Facebook;