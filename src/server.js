const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
const path = require('path');
const PORT = 3000;


// controllers
const usersController = require('./controllers/usersController');
const sessionsController = require('./controllers/sessionsController');
const accountActivationsController = require('./controllers/accountActivationsController');

// Server
const server = restify.createServer();

const cors = corsMiddleware({
  origins: ['http://localhost:8080'],
  allowHeaders: ['*'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.use(restify.plugins.bodyParser());

/*** Routes ***/

// users
server.post('/users', usersController.users_post);
server.get('/users', usersController.users_index);

// sessions
server.post('/login', sessionsController.sessions_post)

// account activations
server.post('/account_activations', accountActivationsController.account_activations_post);



// Connect to Database
server.listen(PORT, function() {
  console.log("API listening on port " + PORT);
});
