'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    index = require('./routes/index'),
    api = require('./lib/api'),
    orientdb = require("orientdb");

var app = express();
var dbConfig = {
    user_name: "root",
    user_password: "vilu7240"
};
var serverConfig = {
    host: "localhost",
    port: 2424
};

var server = new orientdb.Server(serverConfig);
var db = new orientdb.GraphDb("scrum", server, dbConfig);

db.open(function(err) {
    if (err) {
        throw err;
    }
    console.log("Successfully connected to OrientDB");
    index.init(db, function(err) {
    if (err) {
        throw err;
    }
});
});
// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(express.errorHandler());
}
// production only
else {
  app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
}

app.get('/api/awesomeThings', api.awesomeThings);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});