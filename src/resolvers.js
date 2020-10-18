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
    // Если надо вернуть ошибку, то надо писать так: return new Error('User not found');
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
      const { data: { email, password } } = args;
      const [ theUser ] = await db.getUser({ email: email});
      if (!theUser) throw new Error('Unable to Login');
      const isMatch = bcrypt.compareSync(password, theUser.password);
      if (!isMatch) throw new Error('Unable to Login');
      return {token : jwt.sign(theUser, config.secret)};
    }
  }
};

export default resolvers;