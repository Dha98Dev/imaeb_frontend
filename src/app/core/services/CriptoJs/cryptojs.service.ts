import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Enviroments } from '../../../enviroments/env';

@Injectable({ providedIn: 'root' })
export class CryptoJsService {
  constructor() {}

  private password: string = Enviroments.key;

  Encriptar(toEncryp: string) {
    const iv = CryptoJS.lib.WordArray.random(16);
    return this.toBase64Url(CryptoJS.AES.encrypt(toEncryp, this.password, { iv }).toString());
  }
  Desencriptar(toDecript: string) {
    return CryptoJS.AES.decrypt(this.fromBase64Url(toDecript), this.password).toString(CryptoJS.enc.Utf8);
  }

  toBase64Url(b64: string): string {
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  fromBase64Url(b64url: string): string {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '='; // re-agrega padding
    return b64;
  }
  urlEncode(text: string) {
    return this.toBase64Url(this.Encriptar(text));
  }
  urlDecode(text:string) {
    return this.Desencriptar(this.fromBase64Url(text))
  }
}
