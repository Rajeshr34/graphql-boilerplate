import SendGrid from "./servers/send.grid";


export default class Mail {

    static async emailActivation(activationKey: any, email: any, mobile: any) {
        const msgBody = SendGrid.msgBody('', {
            email: email,
            name: '',
        }, process.env.EMAIL_ACTIVATION, {
            token: activationKey,
            email: email,
            mobile: mobile,
        }, null, null);
        await SendGrid.getSgMail().send(msgBody);
    }

    static passwordReset(activationKey: any, email: any, mobile: any) {
        const msgBody = SendGrid.msgBody('', {
            email: email,
            name: '',
        }, process.env.RESET_PASSWORD, {
            token: activationKey,
            email: email,
            mobile: mobile,
        }, null, null);
        SendGrid.getSgMail().send(msgBody);
    }
}
