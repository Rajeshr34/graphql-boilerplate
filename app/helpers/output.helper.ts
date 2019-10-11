import {AuthenticationError, UserInputError} from "apollo-server-errors";
import {ValidationError} from "sequelize";
import fs from "fs";
import path from "path";
import {ServerConfig} from "../config/server.config";

export default class OutPutHelper {

    public static readonly ERROR_TYPES = {
        AUTH: 1,
        VALIDATION: 2,
        USER_INPUT: 3,
    };
    private readonly acceptLanguages: string[];
    private supportedLanguages: string[];
    private languageData: any = null;

    constructor(acceptLanguages: string[]) {
        this.acceptLanguages = acceptLanguages;
        this.supportedLanguages = process.env.LANGUAGES_SUPPORT.split("|");
    }

    async start() {
        if (!this.languageData) {
            for (const item of this.acceptLanguages) {
                if (this.supportedLanguages.includes(item)) {
                    const file = this.getLanguageFile(item);
                    if (fs.existsSync(file)) {
                        this.languageData = JSON.parse(fs.readFileSync(file, 'utf8'));
                        break;
                    }
                }
            }
        }
        if (!this.languageData) {
            const file = this.getLanguageFile(process.env.DEFAULT_LANGUAGE);
            if (fs.existsSync(file)) {
                this.languageData = JSON.parse(fs.readFileSync(file, 'utf8'));
            }
        }

        if (!this.languageData) {
            const file = ServerConfig.appRoot + "/../language.json";
            if (fs.existsSync(file)) {
                this.languageData = JSON.parse(fs.readFileSync(file, 'utf8'));
            }
        }
    }

    public setSuccess(msg: string, loadJson: boolean = true, returnData: any = {}) {
        if (loadJson)
            msg = this.loadJson(msg);
        if (!returnData) {
            returnData = {};
        }
        returnData.success = true;
        returnData.message = msg;
        return returnData;
    }

    public setAuthError(msg: string, loadJson: boolean = true) {
        if (loadJson)
            msg = this.loadJson(msg);
        this.setError(msg, OutPutHelper.ERROR_TYPES.AUTH);
    }

    public setValidationError(msg: string, loadJson: boolean = true) {
        if (loadJson)
            msg = this.loadJson(msg);
        this.setError(msg, OutPutHelper.ERROR_TYPES.VALIDATION);
    }

    public setUserInputError(msg: string, loadJson: boolean = true) {
        if (loadJson)
            msg = this.loadJson(msg);
        this.setError(msg, OutPutHelper.ERROR_TYPES.USER_INPUT);
    }

    public logError(e: any) {

    }

    private getLanguageFile(item: string) {
        return path.resolve(ServerConfig.appRoot + "/../" + process.env.STORAGE + '/language/' + item + '.json');
    }

    private setError(msg: string, errorType: any) {
        switch (errorType) {
            case OutPutHelper.ERROR_TYPES.AUTH:
                throw new AuthenticationError(msg);
            case OutPutHelper.ERROR_TYPES.VALIDATION:
                throw new ValidationError(msg);
            case OutPutHelper.ERROR_TYPES.USER_INPUT:
                throw new UserInputError(msg);
        }
    }

    private loadJson(key: any): string {
        if (this.languageData) {
            return this.languageData[key];
        }
        return "";
    }
}
