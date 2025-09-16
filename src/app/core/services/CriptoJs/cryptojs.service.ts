import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Enviroments } from '../../../enviroments/env';

@Injectable({providedIn: 'root'})
export class CryptoJsService {
    constructor() { }

        
          private password:string=Enviroments.key;

      Encriptar(toEncryp:string){
          const iv = CryptoJS.lib.WordArray.random(16);
          return CryptoJS.AES.encrypt(toEncryp,this.password,{iv}).toString();
      }
      Desencriptar(toDecript:string){
              return CryptoJS.AES.decrypt(toDecript,this.password).toString(CryptoJS.enc.Utf8);
      }

    
}