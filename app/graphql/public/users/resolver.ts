import Mail from "../../../services/mail/mail";
import UsersModel from "../../../models/users.model";
import {withFilter} from "graphql-subscriptions";
import SubscriptionHelper from "../../../helpers/subscription.helper";


export default {
    Query: {
        me: async (parent: any, args: any, context: any, {session}: any) => {
            return "";
        }
    },
    Subscription: {
        // SubscriptionHelper.publishSubForm(session.pubSub, decode, obj);
        testSubscriber: {
            subscribe: withFilter(
                (rootValue?: any, args?: any, context?: any, info?: any) => {
                    return info.session.pubSub.asyncIterator(SubscriptionHelper.EVENTS.TEST_SUBSCRIBER)
                },
                async (parent: any, {key, code}: any, context: any, {session}: any) => {
                    return SubscriptionHelper.validateToken(key, code, parent.auth.code, session.crypt);
                }
            ),
        },
    },
    Mutation: {
        loadSubscriber: async (parent: any, args: any, context: any, {session}: any) => {
            return SubscriptionHelper.generateToken(session.crypt);
        },

        postSubscriber: async (parent: any, {key, code, data}: any, context: any, {session}: any) => {
            if (await SubscriptionHelper.validateToken(key, code, code, session.crypt)) {
                SubscriptionHelper.publishTestSubscriber(session.pubSub, {key, code}, data);
            }
            return session.out.setSuccess("SUBSCRIBER_TEST_POST");
        },

        signIn: async (parent: any, {email, password}: any, context: any, {session}: any) => {
            const user = await UsersModel.getByEmail(email);
            if (!user) {
                session.out.setAuthError("SIGN_IN_USER_NOT_FOUND");
            }
            const isValid = await session.crypt.validatePassword(password, user.userPassword);
            if (!isValid) {
                session.out.setAuthError("SIGN_IN_INVALID_PASSWORD");
            }
            if (user.userStatus !== true) {
                session.out.setAuthError("SIGN_IN_USER_DISABLED");
            }
            session.auth.setUser(user);
            return session.auth.setToken(UsersModel.defaultReturn(user));
        },

        register: async (parent: any, args: any, context: any, {session}: any) => {
            args.status = false;
            args.role = UsersModel.ROLES.CLIENT;
            args.password = await session.crypt.hashPassword(args.password);
            const user = await UsersModel.createUser(args, session.out);
            await Mail.emailActivation(user.userActivationKey, user.userEmail, user.userMobile);
            return session.out.setSuccess("REGISTER_SUCCESS", true, UsersModel.defaultReturn(user));
        },

        refreshToken: async (parent: any, {refreshToken}: any, context: any, {session}: any) => {
            const userData = await session.auth.validateToken(refreshToken, true);
            if (userData) {
                return session.auth.setToken(UsersModel.defaultReturn(userData));
            }
            session.out.setAuthError("REFRESH_TOKEN_ERROR");
        },

        resetPassword: async (parent: any, {email}: any, context: any, {session}: any) => {
            const user = await UsersModel.getByEmail(email);
            if (user) {
                await user.update({
                    userActivationKey: session.crypt.generateActivationKey(),
                });
                await Mail.passwordReset(user.userActivationKey, user.userEmail, user.userMobile);
            }
            return session.out.setSuccess("RESET_PASSWORD_SUCCESS", true, null);
        },

        newPassword: async (parent: any, {password, activationKey, email}: any, context: any, {session}: any) => {
            const item = await UsersModel.getByEmail(email);
            if (!item || (item && item.userActivationKey !== activationKey)) {
                session.out.setValidationError("NEW_PASSWORD_INPUT_ERROR");
            }
            const hashPassword: any = await session.crypt.hashPassword(password);
            await item.update({
                userPassword: hashPassword,
                userActivationKey: session.crypt.generateActivationKey(),
            });
            return session.out.setSuccess("NEW_PASSWORD_SUCCESS");
        },
    },
};
