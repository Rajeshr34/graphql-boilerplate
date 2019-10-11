import sgMail from '@sendgrid/mail';

export default class SendGrid {

    static getSgMail() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        return sgMail;
    }

    static msgBody(subject: string, to: any, templateID: string, variables: object, from: any, replyTo: any) {
        if (!replyTo) {
            replyTo = {
                email: process.env.NO_REPLY_EMAIL,
                name: process.env.NO_REPLY_NAME,
            };
        }
        if (from === true) {
            from = {
                email: process.env.FROM_EMAIL,
                name: process.env.FROM_NAME,
            };
        }
        if (!from) {
            from = {
                email: process.env.NO_REPLY_EMAIL,
                name: process.env.NO_REPLY_EMAIL,
            };
        }
        if (!Array.isArray(to)) {
            to = [to];
        }
        return {
            personalizations: [
                {
                    to,
                    dynamic_template_data: variables,
                    subject,
                },
            ],
            from,
            reply_to: replyTo,
            template_id: templateID,
        };
    }
}
