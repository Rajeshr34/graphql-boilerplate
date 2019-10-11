import {PubSub} from "graphql-subscriptions";
import Crypt from "../services/crypt";
import {InterfaceSubscriberPublishTest} from "../interfaces/InterfaceSubscriberPublishTest";

export default class SubscriptionHelper {

    public static readonly EVENTS = {
        TEST_SUBSCRIBER: "TEST_SUBSCRIBER",
    };

    public static async validateToken(key: String, code: String, parentCode: String, crypt: Crypt) {
        const decode = await crypt.decodeJtwCode(key);
        return decode && decode.code && decode.code === code && parentCode === decode.code;
    }

    public static async generateToken(crypt: Crypt, data?: any) {
        const unique = await crypt.generateActivationKey();
        return {
            key: await crypt.generateJwtCode({
                code: unique,
                data
            }),
            code: unique
        }
    }

    static publishTestSubscriber(pubSub: PubSub, decode: { key: string, code: string }, data: InterfaceSubscriberPublishTest) {
        pubSub.publish(SubscriptionHelper.EVENTS.TEST_SUBSCRIBER, {
            testSubscriber: {
                data
            },
            auth: decode,
        }).then(() => {

        });
    }
}
