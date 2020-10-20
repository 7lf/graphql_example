/* jshint esversion: 8*/

const db = require ('./db.js');
const config = require ('config');
const bcrypt = require ('bcrypt');
const { decodedToken } = require('./decodedToken.js');

import jwt from 'jsonwebtoken';

const resolvers = {
  Query: { // Здесь описываем что надо получать
    Users: async (root, filter, { _, req }, info) => { 
        const decoded = decodedToken(req);
        let user = db.usersGet(filter);
        return user;
    }
  },
  Mutation: { // Здесь описываем что надо изменять
    signupUser: async (root, args, _, info) => {
        const { data: { email, name, password } } = args;
        const newUser = await db.createUser({
          email,
          name,
          password: bcrypt.hashSync(password, 3)
        });
        return {token : jwt.sign(newUser, config.secret)};
    },
    loginUser: async (root, args, _, info)  => {
      if (_.req.req.error) {
        return {error: _.req.req.error};
      } else {
        const { data: { email, password } } = args;
        const [ theUser ] = await db.getUser({ email: email});
        if (theUser.status === 'error') {
          return {error: theUser.data};
        } else {
          const isMatch = bcrypt.compareSync(password, theUser.password);
          if (!isMatch) throw new Error('Bad password');
          return {token : jwt.sign(theUser, config.secret)};
        }
      }
    }
  }
};

export default resolvers;