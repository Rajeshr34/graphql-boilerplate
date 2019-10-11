import {IncomingHttpHeaders} from "http";
import Crypt from "./crypt";
import {skip} from 'graphql-resolvers';
import OutputHelper from "../helpers/output.helper";

import Users from "../models/base/users";
import UsersModel from "../models/users.model";


export default class Auth {

    public static readonly TYPES = {
        USER: 1,
        API: 2,
    };
    private userData: Users;
    private apiData: any;
    private crypt: Crypt;
    private readonly headers: IncomingHttpHeaders;
    private type: number;
    private out: OutputHelper;


    constructor(headers: IncomingHttpHeaders, crypt: Crypt, out: OutputHelper) {
        this.crypt = crypt;
        this.headers = headers;
        this.out = out;
    }

    static isUserAuthenticated = (parent: any, args: any, context: any, {session}: any): any => {
        if (session.auth.isUserAuthenticated()) {
            return skip;
        }
    };

    static isAdmin = (parent: any, args: any, context: any, {session}: any) => {
        if (session.auth.isAdmin()) {
            return skip;
        }
    };

    static isClient = (parent: any, args: any, context: any, {session}: any) => {
        if (session.auth.isClient()) {
            return skip;
        }
    };

    public async start() {
        if (this.headers && this.headers.authorization) {
            await this.validateToken(this.headers.authorization, false);
        }
    }

    init(data: { type: any, data: any }) {
        if (data) {
            this.type = data.type;
            if (this.isUser()) {
                this.setUser(data.data);
            } else if (this.isApi()) {
                this.setApi(data.data);
            }
        }
    }

    isApi() {
        return this.type == Auth.TYPES.API;
    }

    isUser() {
        return this.type == Auth.TYPES.USER;
    }

    isUserEnabled() {
        return this.isUserLoggedIn() && this.userData.userStatus === true;
    }

    isUserLoggedIn() {
        return this.userData != null && this.userData.userID > 0;
    }

    getUserID() {
        return this.userData.userID;
    }

    getUserData() {
        return this.userData;
    }

    getRoleType() {
        return this.userData.userType;
    }

    validatePassword(password: string) {
        return this.crypt.validatePassword(password, this.userData.userPassword);
    }

    // for Admin Or Client Or Any Other Types
    isUserAuthenticated() {
        if (this.isUserLoggedIn()) {
            if (this.isUserEnabled()) {
                return true;
            } else {
                this.out.setAuthError("AUTH_USER_DISABLED");
            }
        }
        this.out.setAuthError("AUTH_NOT_AUTHENTICATED");
    }

    isAdmin() {
        if (this.isUserAuthenticated()) {
            if (this.getRoleType() == UsersModel.ROLES.ADMIN) {
                return true;
            }
        }
    }

    isClient() {
        if (this.isUserAuthenticated()) {
            if (this.getRoleType() == UsersModel.ROLES.CLIENT) {
                return true;
            }
        }
    }

    createUserToken(isRefreshToken: boolean, expireTime: String) {
        const userData = {
            id: this.userData.userID,
            email: this.userData.userEmail,
            role: this.userData.userType,
            isRefreshToken
        };
        const encryptData = {data: this.crypt.enCrypt(JSON.stringify(userData))};
        let jtwOptions = {};
        if (expireTime) {
            jtwOptions = {expiresIn: expireTime};
        }
        return `Bearer ${this.crypt.generateJwt(encryptData, jtwOptions)}`;
    }

    public setToken(data: any) {
        data.token = this.createUserToken(false, process.env.TOKEN_TIME);
        data.refreshToken = this.createUserToken(true, process.env.TOKEN_REFRESH_TIME);
        return data;
    }

    private async validateToken(authorization: string, refreshToken: boolean) {
        try {
            authorization = authorization.replace('Bearer ', '');
            const {data}: any = this.crypt.decodeJwt(authorization, {});
            const jsonData = JSON.parse(this.crypt.deCrypt(data));
            if (!jsonData.isRefreshToken || refreshToken) {
                const userData = await UsersModel.getByID(jsonData.id);
                this.init({
                    data: userData,
                    type: Auth.TYPES.USER
                });
                return userData;
            }
        } catch (e) {
            this.out.logError(e);
        }
        this.out.setAuthError("AUTH_INVALID_TOKEN");
    }

    private setUser(data: any) {
        this.userData = data;
    }

    private setApi(data: any) {
        this.apiData = data;
    }

}
