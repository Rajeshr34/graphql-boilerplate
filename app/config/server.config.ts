import express = require("express");
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {GraphQLError, GraphQLFormattedError} from "graphql";
import {UniqueConstraintError} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import Auth from "../services/auth";
import Crypt from "../services/crypt";
import OutputHelper from "../helpers/output.helper";
import path from "path";
import {ExecutionParams} from "subscriptions-transport-ws";
import {PubSub} from "graphql-subscriptions";

const pub = new PubSub();

export class ServerConfig {
    static appRoot: any;

    public static getExpress() {
        // Load Basic
        this.loadSettings();
        //Sequelize
        this.getSequelize();

        const app = express();
        app.use(helmet());
        app.use(cors());
        app.use(bodyParser.json());
        return app;
    }

    public static async contextData(req: express.Request, connection: ExecutionParams) {
        const crypt = Crypt.instance();

        const out = new OutputHelper(req ? req.acceptsLanguages() : [process.env.DEFAULT_LANGUAGE]);
        await out.start();

        const auth = new Auth(req ? req.headers : null, crypt, out);
        await auth.start();

        return {
            auth,
            out: out,
            crypt: crypt,
            pubSub: pub,
        }
    }

    public static isDebug(): Boolean | boolean {
        return process.env.DEBUG == "true";
    }

    public static formatError(error: GraphQLError): GraphQLFormattedError {
        if (this.isDebug()) {
            return error;
        }
        const customError = {
            message: error.message,
            code: error.extensions.code,
        };
        if (error.originalError instanceof UniqueConstraintError) {
            customError.message = error.originalError.errors[0].message;
        }
        return customError;
    }

    public static getSequelize() {
        // https://github.com/RobinBuschmann/sequelize-typescript
        return new Sequelize({
            database: process.env.TEST_DB || process.env.DB,
            dialect: 'postgres',
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            models: [this.appRoot + '/models/base'],
        });
    }

    public static loadSettings() {
        //Save App Root Path
        ServerConfig.appRoot = path.resolve(__dirname + '/../');
        // Load .env File
        dotenv.config();
    }

    public static async loadSequelize(force: boolean = false) {
        const seq = this.getSequelize();
        //Sync Helps to Create Tables to DB if not Exits
        await seq.sync({
            // @ts-ignore
            force: force
        });
    }
}
