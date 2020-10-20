/* jshint esversion: 8*/

import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import db from './db';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import passport from 'passport';
import passportJWT from 'passport-jwt';
const { Strategy, ExtractJwt } = passportJWT;

const gql = require('graphql-tag'); // надо чтобы ограничивать доступ пользователя по типу и названию запроса

const bodyParser = require('body-parser');

const config = require ('config');
const port = config.port;
const params = {
  secretOrKey: config.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() 
  /* чтобы это работало необходимо посылать заголовок вида
  authorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QucnUyIiwicGFzc3dvcmQiOiIkMmIkMDQkRG81SW82emNUU0NkaEU1emV0RGljT2RKVVdzS25iUU9DWXVmQi92bHpqeWVDM1FTNFdnZFMiLCJuYW1lIjoidGVzdGVyIiwiY3JlYXRlZEF0IjoiMjAyMC0xMC0xM1QwNjo0ODoxMC4wMDBaIiwidXBkYXRlZEF0IjoiMjAyMC0xMC0xM1QwNjo0ODoxMC4wMDBaIiwic3RhdHVzIjoib2siLCJpYXQiOjE2MDI1ODg0MjB9.yZ9bOQX5nIT2kvysQkTglWrKiFcuNuF6OXHj5RZgb_E
  ^^^^^^^^^^^^^ ^^^^^^                  ^^^^^^^
  название      обязательная часть      ключ, который выдаётся при логине
  */
  //другой тип: jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
};

const app = express();
app.use(express.json());
//-------------------------------------------------------------------
const strategy = new Strategy(params, async (payload, done) => {
  let user = await db.getUser(payload);
  
  if (user[0].status === 'error') {
    user = [];
  }
  
  return done(null, user);
});
//-------------------------------------------------------------------
passport.use(strategy);
passport.initialize();
//-------------------------------------------------------------------
const server = new ApolloServer({ 
  typeDefs, resolvers,
  context : req => ({
    req
  })
});
//-------------------------------------------------------------------
app.use('/graphql', (req, res, next) => {
  const query = req.body.query;
  const obj = gql`${query}`;
  if ((obj.definitions[0].operation !== 'mutation') && (obj.definitions[0].selectionSet.selections[0].name.value !== 'loginUser')) { // || (obj.definitions[0].selectionSet.selections[0].name.value !== 'registerUser')) {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => { // проверили и получили пользователя
      // проверяем пользователя на доступ к типу и названию зароса
      console.log('====', err, user, info);
      if (user === false) {
        req.error = 'User not found!';
        req.user = [];
      }

    })(req, res, next);
  }
  next();
});
//-------------------------------------------------------------------
server.applyMiddleware({
  app
});
//-------------------------------------------------------------------
const main = async () => {
  db.connect().then( result => {
    if (result.status === 'error') {
      console.error('[error] ', result.data);
      process.exit(1);
    } else {
      app.listen({
        port: port
      },
      () => {
        console.log(`🚀 Example server ready. Port:`, port);
      });
    }
  });
};
//-------------------------------------------------------------------
main();

/*
Примеры:

Вход пользователя:
mutation {
  loginUser(data: {email: "test@test.ru2", password: "123456"}) {
    token
    error
  }
}

Пример запроса с фильтром:
query {
  Authors (filter:{id:1}) {
    name_en
    name_ru
    id
  }
}

Фильтр будет по id = 1. Так же можно написать чтобы искал по любому полю, например, name_en.

eyJhbGciOiJIUzI1NiJ9.b2s._gOMH_ffHySGsjow7F5ZlVb8RFbsAKopN8s9ux_P3DI

Регистрация пользователя
mutation {
  signupUser (data:{
    email: "test@test.ru"
    password: "password"
    name: "tester"
  })
  {
    token
  }
}

Запрос пользоватлей
query {
  Users(filter:{ email:""})
  {
    email
  }
}
  Заголовок:
{
  "Authorisation": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QHRlc3QucnUyIiwicGFzc3dvcmQiOiIkMmIkMDQkejBJOGdDdDl5MER6L0FvL2RpMWZOdXpQclV6TEdqVjMuYldLYnRBNDBHV0RjWnBQNkg2bGEiLCJuYW1lIjoidGVzdGVyIiwiY3JlYXRlZEF0IjoiMjAyMC0xMC0wNlQxODoxMDoyNC4wMDBaIiwidXBkYXRlZEF0IjoiMjAyMC0xMC0wNlQxODoxMDoyNC4wMDBaIiwiaWF0IjoxNjAyMDYyODMwfQ.gxZsZlmjYmUaIFcm7p_KMzr874B61FrGTURAwYrpuJs"
}

*/