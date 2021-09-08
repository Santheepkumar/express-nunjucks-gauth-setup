const util = require("util");
const mongoose = require("mongoose");
const appConfig = require("./env.config");

// connect to mongo db
const mongoUrl = appConfig.mainDbUrl;
mongoose.connect(mongoUrl, {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${mongoUrl}`);
});

// print mongoose logs in dev env
if (appConfig.mongooseDebug) {
  mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(
      `${collectionName}.${method}`,
      util.inspect(query, false, 20),
      doc
    );
  });
}

const mongooseAuditOptions = {
  historyConnection: mongoose.createConnection(`${mongoUrl}-history`)
};

function close() {
  mongoose.disconnect();
  mongooseAuditOptions.historyConnection.close();
}

module.exports = { mongoose, close, mongooseAuditOptions };
