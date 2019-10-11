import Cryptr from 'cryptr';
import jwt from 'jsonwebtoken';
import fs from "fs";
import bcrypt from 'bcrypt';
import uniqueString from "unique-string";
import * as utility from "utility";

export default class Crypt {

    public static instance(): Crypt {
        return new Crypt();
    }

    getPrivateKey = () => fs.readFileSync('./keys/private.key', 'utf8');
    getPublicKey = () => fs.readFileSync('./keys/public.key', 'utf8');

    getCrypt = () => new Cryptr(process.env.CRYPT_PASSWORD);

    enCrypt = (data: any) => {
        return this.getCrypt().encrypt(data);
    };

    deCrypt = (data: any) => {
        return this.getCrypt().decrypt(data);
    };

    generateJwt = (data: any, options: any) => {
        options = options || {};
        options.algorithm = 'RS256';
        return jwt.sign(data, this.getPrivateKey(), options);
    };

    decodeJwt = (data: any, options: any) => {
        options = options || {};
        options.algorithm = 'RS256';
        return jwt.verify(data, this.getPublicKey(), options);
    };

    generateJwtCode = (data: any) => {
        return jwt.sign(this.enCrypt(JSON.stringify(data)), process.env.CRYPT_PASSWORD, {algorithm: "HS512"});
    };

    decodeJtwCode = (data: any) => {
        const options = {
            algorithm: 'HS512'
        };
        // @ts-ignore
        return JSON.parse(this.deCrypt(jwt.verify(data, process.env.CRYPT_PASSWORD, options)));
    };


    hashPassword = (password: String) => bcrypt.hash(password, 10);

    validatePassword = (candidate: string, password: any) => bcrypt.compare(candidate, password);

    randomString(numberOfLoop: number) {
        let out = "";
        for (let i = 0; i < numberOfLoop; i++) {
            out += Math.random().toString(36).substring(2, 15);
        }
        return out + uniqueString();
    }

    generateActivationKey = () => {
        return this.randomString(6);
    };

    md5(data: string) {
        return utility.md5(data);
    }
}
