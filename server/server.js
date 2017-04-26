import http  from 'http';
import express from 'express';
import expressSession from 'express-session';
import connectmongostore from 'connect-mongostore';
import bodyparser from 'body-parser';
import config from './config';
import websocketinit from './comms/websocket';
import request from 'superagent';
import initPassport from './strategies';
import mongoose from 'mongoose';
import ipcinit from './comms/ipc';
const MongoStore = connectmongostore(expressSession);
mongoose.connect(config.mongo.url);


const app = express();
app.use('/', express.static("static"));
app.use(expressSession(
                      {
                        store: new MongoStore({'db': 'testsessions'}),
                        /*key: 'express.sid',
                        resave: false,
                        rolling: false,
                        saveUninitialized:false, //else passport will save empty object to store, which forces logout!
                        cookie:{
                            maxAge: 2*24*60*60*1000, //2 days
                        },*/
                        secret: config.secret,
                      }
));

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
initPassport(app);

const server = http.createServer(app);
let PORT = 9090

if (process.argv.length > 2){
   PORT = parseInt(process.argv[2]);
}


const ensureAuthenticated = (req, res, next) => {
  //req.user = {username:'tlodge'}
  //return next(null);
 

  if (req.isAuthenticated()){
    return  next(null);
  }
  console.log("not authenticated - so redirecting!");
  res.redirect("/auth/github");
};


websocketinit(['databox'],server);
ipcinit();

app.get('/', ensureAuthenticated, function(req,res){
  res.render('index');
});

app.get('/login', function(req,res){
  res.render('login');	
});

app.use('/auth', require('./routes/auth'));
app.use('/comms',ensureAuthenticated, require('./routes/comms'));

//redirect any failed routes to root
app.use(function(req,res){
    res.redirect("/");
});

console.log("listening on port " + PORT);
server.listen(PORT);
