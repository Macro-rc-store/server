import ScriptStore from '../../store';
import Script from "../../script";
import { SERVER_CLASS, WORKER } from '../../codes';
import module from '../../module';
import * as OTPAuth from "otpauth";

class CommonUtils {
  private classes: {
    OTPAuth?: typeof OTPAuth
  };

  constructor(module?: module) {
    this.classes = {};

    if (module) {
      this.classes.OTPAuth = module.import(WORKER.OTPAUTH);
    }
  }

  wait(ms: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  randomUid() {
    const S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
  
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  generate2FAcode(secret: string) {
    if (!this.classes.OTPAuth) {
      throw new Error('CommonUtils.classes.OTPAuth undefined');
    }

    try {
      const otp = new this.classes.OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: this.classes.OTPAuth.Secret.fromBase32(secret.replace(/ /g, ''))
      });
  
      return otp.generate();
    }
    catch(error) {
      throw new Error('Mã 2FA không hợp lệ');
    }
  }

  randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getCurrentTimeSecond() {
    return parseInt((Date.now() / 1000).toString());
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.UTILS.COMMON,
    content: CommonUtils,
    name: 'CommonUtils class'
  })
);

export default CommonUtils;