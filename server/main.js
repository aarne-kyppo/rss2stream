var path = require('path');
var url = require('url');
var express = require('express')
var app = express();
var http = require('http').createServer(app).listen(3000);
var io = require('socket.io')(http);
var swig = require('swig');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var _ = require('underscore');
var crypto = require('crypto');//For making hashes from subscription URLs.

var conf = require('../conf.json')

app.locals.rooturl = conf.approoturl;
app.locals.socketaddress = conf.socketaddress;

//start RSS feed logic

var feedsub = require('feedsub');
var subscriptions = {};

io.of(app.locals.rooturl).on('connection',function(socket){
  var reader;
  //Adding subscription for given URL
  socket.on('subscribe',function(data){
    reader = new feedsub(data.url,{
      interval: 1,
      emitOnStart: true,
      autoStart: true,
    });

    reader.on('item',function(item){
      socket.emit('newItem',{item: item});//Rooms defined by URL.
    });
  });
  //Stopping reader
  socket.on('unsubscribe',function(data){
    if(reader){
      reader.stop();
    }
  });
});

//end RSS feed logic

var rootPath = path.dirname(__dirname);
var port = Number(conf.app_port);

app.set('views', path.join(rootPath, 'server'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views cache',false);
swig.setDefaults({ cache: false});

app.use(cookieParser());


app.use('/', express.static(path.join(rootPath, 'app')));
app.use('/', express.static(path.join(rootPath, 'bower_components')));

app.get('/', function(req, res) {
    renderIndex(req.config, res);
});
app.get('/data', function(req,res){

});

/*app.use(function(req, res) {
    res.redirect('/');
});*/

app.listen(port, conf.appurl, function() {
    console.log('Server listening on port ' + port);
});

function renderIndex(config, res) {
    res.render('views/index.html',{rooturl: app.locals.rooturl, socketaddress: app.locals.socketaddress});
}

function addPathPrefix(filePath, prefix) {
    filePath.splice(1, 0, prefix);
}

function getFileExtension(filePath) {
    return filePath.split('.').pop();
}
