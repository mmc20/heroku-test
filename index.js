// Library imports
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { ApolloServer } = require("apollo-server-express");
const http = require("http");
const log = require("loglevel");
const cors = require("cors");

const { Schema } = require("./schema");
require("./utils/db");

const app = express();
app.use(express.json());
// app.use(helmet());
app.use(cors());
// app.use(express.static("public"));

// DEV STUFF
if (app.get("env") === "development") {
  log.setLevel("trace");
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled...");
}

const httpServer = http.createServer(app);

// APOLLO STUFF
const server = new ApolloServer({
  schema: Schema,
  introspection: true, // TODO: look up what this means
  context: async ({ req, res }) => ({ req, res }),
});
server.applyMiddleware({ app });

const DEV_PORT = config.get("port");
httpServer.listen({ port: DEV_PORT }, () => {
  log.info("Server running.");
  log.info(
    `🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`
  );
});
