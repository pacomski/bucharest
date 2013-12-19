
/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// blog articles in db
var postProvider= new ArticleProvider('localhost', 27017);

// Routes
app.get('/', function(req, res){
    postProvider.findAll( function(error,docs){
        res.render('index.ejs', { locals: {
            title: 'Blog',
            articles:docs
            }
        });
    })
});


// create new post
app.get('/new', function(req, res) {
    res.render('new-article.ejs', { locals: {
        title: 'New Post'
    }
    });
});

function parseKey(truc){
    var aa = truc.split('-');
    return {
        type: aa[1] || 'string',
        value : aa[0],
    };
};

app.post('/new', function(req, res){
    
    var data = {};
    _.each(req.body, function(val, key){
        var k = parseKey(key);
        console.log(k, val          );
        var vv = null;
        if(k.type == 'date'){
            var tmpv = val.split('/');
            vv = new Date(tmpv[0], tmpv[1], tmpv[2]);
        }
        else if(k.type == 'int'){
            vv = parseInt(val);
        }
        else if(k.type == 'string'){
            vv = val;
        }
        else{
            throw "invalid data type";
        }
        data[k.value] = vv;
    });
    console.log(data);
    postProvider.save(data  , function( error, docs) {
        res.redirect('/new')
    });
});



// view post alone

app.get('/post/:id', function(req, res) {
    ArticleProvider.findById(req.params.id, function(error, article) {
        res.render('alone-article.ejs',
        { locals: {
            title: article.title,
            article:article
        }
        });
    });
});



app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

