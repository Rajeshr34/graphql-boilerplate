import {ApolloServer} from 'apollo-server-express';
import http from "http";
import {ServerConfig} from "./app/config/server.config";
import {AppModule} from "./app/graphql/app.modules";

const app = ServerConfig.getExpress();

const {schema, resolvers} = AppModule;

const server = new ApolloServer({
    schema, resolvers,
    context: async ({req, res, connection}) => await ServerConfig.contextData(req, connection),
    formatError: (error => ServerConfig.formatError(error)),
    subscriptions: {
        onConnect: (connectionParams, websocket, context) => {

        },
        onDisconnect: (websocket, context) => {

        }
    }
});

server.applyMiddleware({app});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.SERVER_PORT, () => {
    console.log(`🚀 Server ready at ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ${process.env.SERVER_WS_HOST}:${process.env.SERVER_PORT}${server.subscriptionsPath}`)
});
