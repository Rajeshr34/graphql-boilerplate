import Users from "./base/users";
import {ModelHelper} from "../helpers/model.helper";
import OutPutHelper from "../helpers/output.helper";


export default class UsersModel {

    public static readonly ROLES = {
        ADMIN: 1,
        CLIENT: 2,
    };

    static async getUsers(args: any): Promise<Users[]> {
        const options = ModelHelper.getPagination(args.page);
        // @ts-ignore
        options.order = [
            ['userID', args.orderByASC === true ? 'ASC' : 'DESC'],
        ];
        return Users.findAll(options);
    }

    static async getByEmail(email: string): Promise<Users> {
        return Users.findOne({
            where: {userEmail: email}
        })
    }

    static async getByID(id: any): Promise<Users> {
        return Users.findOne({
            where: {userID: id}
        })
    }

    static defaultReturn(user: Users): {} {
        return {
            id: user.userID,
            email: user.userEmail,
            mobile: user.userMobile,
            address: user.userAddress,
            type: user.userType,
            status: user.userStatus
        }
    }

    static async createUser(args: any, out: OutPutHelper): Promise<Users> {
        try {
            return Users.create({
                userEmail: args.email,
                userPassword: args.password,
                userMobile: args.mobile,
                userType: args.role,
                userStatus: args.status,
            });
        } catch (e) {
            out.setValidationError(e.message);
        }
    }
}
