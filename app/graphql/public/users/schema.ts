import gql from "graphql-tag";

export default gql`
    scalar JSONObject

    type Query{
        me:String
    }

    type Subscription{
        testSubscriber(key: String!, code: String!): JSONObject
    }

    type Mutation {
        signIn(email: String!, password: String!): UserData!
        register(email: String!, password: String!, mobile: String!): UserData!
        refreshToken(refreshToken: String!): UserData!
        resetPassword(email: String): SuccessData!
        newPassword(password:String!, activationKey: String!, email: String!): SuccessData!
        loadSubscriber: JSONObject!
        postSubscriber(key: String!, code: String!, data: JSONObject): JSONObject!
    }

    type SuccessData{
        success: Boolean
        message: String
    }

    type UserData{
        id: Int
        email: String
        mobile: String
        address:String
        type: Int
        token: String
        refreshToken: String
        status: Boolean
        success: Boolean
        message: String
    }
`
