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
}).listen(6000, function() {
  console.log('App is running, server is listening on port ', 6000);
});

const httpServer = http.createServer(app, function (req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"})
  res.end("Hello World\n")
});

// APOLLO STUFF
const server = new ApolloServer({
  schema: Schema,
  introspection: true, // TODO: look up what this means
  context: async ({ req, res }) => ({ req, res }),
});
server.applyMiddleware({ app });

const DEV_PORT = 9000;
httpServer.listen(9000, () => {
  log.info("Server running.");
  log.info(
    `🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`
  );
});
