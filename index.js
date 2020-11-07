// Library imports
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

app.get('/', function(request, response) {
  var result = 'App is running'
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});

const httpServer = http.createServer(app);

// APOLLO STUFF
const server = new ApolloServer({
  schema: Schema,
  introspection: true, // TODO: look up what this means
  context: async ({ req, res }) => ({ req, res }),
});
server.applyMiddleware({ app });

const DEV_PORT = 9000;
httpServer.listen({ port: DEV_PORT }, () => {
  log.info("Server running.");
  log.info(
    `🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`
  );
});
