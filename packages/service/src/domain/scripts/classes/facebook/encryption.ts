import { BaseEntity } from "@/shared/entity/base.entity";
import { SERVER_CLASS } from "../../codes";
import Script from "../../script";
import ScriptStore from "../../store";

class FacebookEncryption {
  private loginPasswordEncryption: {
    publicKey: string;
    keyId: number;
  };

  constructor(publicKey: string, keyId: number) {
    this.loginPasswordEncryption = {
      publicKey: publicKey,
      keyId: keyId,
    };
  }

  private encodeBase64(uint8Array: Uint8Array) {
    const binaryString = uint8Array.reduce(
      (str, byte) => str + String.fromCharCode(byte),
      ""
    );
    const base64String = btoa(binaryString);
    return base64String;
  }

  private decodeUTF8(a: string) {
    if (typeof a !== "string") throw new TypeError("expected string");
    var b;
    a = unescape(encodeURIComponent(a));
    var c = new Uint8Array(a.length);
    for (b = 0; b < a.length; b++) c[b] = a.charCodeAt(b);
    return c;
  }

  private loginPasswordEncryptionR(a: string) {
    var b = [];
    for (var c = 0; c < a.length; c += 2)
      b.push(parseInt(a.slice(c, c + 2), 16));
    return new Uint8Array(b);
  }

  private loginPasswordEncryptionDoSomething(a: any, d: any, e: any, f: any) {
    var overheadLength = 48;
    var h = window.crypto,
      i = 64,
      j = 1,
      k = 1,
      l = 1,
      m = 2,
      n = 32,
      o = 16,
      p = k + l + m + n + overheadLength + 16;
    var g = p + e.length;
    if (d.length != i) throw new Error("public key is not a valid hex sting");
    var s = this.loginPasswordEncryptionR(d);
    if (!s) throw new Error("public key is not a valid hex string");
    var t = new Uint8Array(g),
      u = 0;
    t[u] = j;
    u += k;
    t[u] = a;
    u += l;
    d = {
      name: "AES-GCM",
      length: n * 8,
    };
    var v = {
      name: "AES-GCM",
      iv: new Uint8Array(12),
      additionalData: f,
      tagLen: o,
    };
    return h.subtle
      .generateKey(d, !0, ["encrypt", "decrypt"])
      .then(function (a) {
        var c = h.subtle.exportKey("raw", a as any);
        a = h.subtle.encrypt(v, a as any, e.buffer) as any;
        return Promise.all([c, a]);
      })
      .then(function (a: any) {
        var b = new Uint8Array(a[0]);
        const window: any = globalThis;
        b = window.sealedBox.seal(b, s);
        t[u] = b.length & 255;
        t[u + 1] = (b.length >> 8) & 255;
        u += m;
        t.set(b, u);
        u += n;
        u += overheadLength;
        if (b.length !== n + overheadLength)
          throw new Error("encrypted key is the wrong length");
        b = new Uint8Array(a[1]);
        a = b.slice(-o);
        b = b.slice(0, -o);
        t.set(a, u);
        u += o;
        t.set(b, u);
        return t;
      })
      .catch(function (a) {
        throw a;
      });
  }

  async encryptFacebookPass(password: string) {
    const publicKey = this.loginPasswordEncryption.publicKey;
    const keyId = this.loginPasswordEncryption.keyId;
    const timeNow = parseInt((Date.now() / 1000).toString()).toString();
    const dpass = this.decodeUTF8(password);
    const dtime = this.decodeUTF8(timeNow);
    const a = await this.loginPasswordEncryptionDoSomething(keyId, publicKey, dpass, dtime);
    return ['#PWD_BROWSER', 5, timeNow, this.encodeBase64(a)].join(":");
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.FACEBOOK.ENCRYPTION,
    content: FacebookEncryption,
    name: "FacebookEncryption class",
  })
);

export default FacebookEncryption;
