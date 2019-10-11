import {
    BeforeCreate,
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    IsEmail,
    Length,
    Model,
    Table,
    Unique,
    UpdatedAt
} from 'sequelize-typescript';
import Crypt from "../../services/crypt";

@Table({modelName: 'users'})
export default class Users extends Model<Users> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    userID: number;

    @IsEmail
    @Unique
    @Column
    userEmail: String;

    @Column
    userPassword: String;

    @Length({min: 10, max: 10})
    @Unique
    @Column
    userMobile: String;

    @Column(DataType.TEXT)
    userAddress: String;

    @Column
    userType: Number;

    @Default(false)
    @Column
    userStatus: Boolean;

    @Column
    @Column(DataType.TEXT)
    userActivationKey: String;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @DeletedAt
    deletedAt: Date;

    @BeforeCreate
    static beforeCreateUser(instance: Users) {
        instance.userActivationKey = Crypt.instance().generateActivationKey();
    }
}
