import {GraphQLModule} from '@graphql-modules/core';
import {PublicModule} from "./public/public.modules";
import {AdminModule} from "./admin/admin.modules";
import {AuthenticatedModule} from "./authenticated/authenticated.modules";
import {ClientModule} from "./client/client.modules";


export const AppModule = new GraphQLModule({
    imports: [
        PublicModule,
        ClientModule,
        AdminModule,
        AuthenticatedModule,
    ],
});
