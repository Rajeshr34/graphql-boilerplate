import {GraphQLModule} from "@graphql-modules/core";
import {publicUsersModule} from "./users";

export const PublicModule = new GraphQLModule({
    imports: [
        publicUsersModule,
    ],
});
