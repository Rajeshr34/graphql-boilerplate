import {GraphQLModule} from "@graphql-modules/core";
import resolvers from "./resolver";
import schema from "./schema";
import {mergeTypeDefs} from 'graphql-toolkit'


export const publicUsersModule = new GraphQLModule({
    typeDefs: mergeTypeDefs([schema]),
    resolvers
});
