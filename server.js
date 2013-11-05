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
app.get('/api/projects',index.projects_list)
app.get('/api/new_customer',index.new_customer_form)
app.post('/api/new_customer',index.new_customer)
app.get('/api/customers_list',index.customers_list)
app.get("/api/new_project",index.new_project_form)
app.post("/api/new_project",index.new_project)
app.get('/api/customer/:id',index.view_customer)
app.get('/api/project/:id',index.view_project)
app.get('/api/new_telephone/:id',index.addTelephone)
app.get('/api/new_feature/:id',index.addFeature)
app.post('/api/feature',index.modify_feature)
app.get('/api/feature/:id',index.view_feature)
app.get('/api/payment/:id',index.new_payment)
app.post('/api/payment',index.add_payment)
app.post('/api/new_feature',index.push_feature)
app.post('/api/new_telephone',index.push_telephone)

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});