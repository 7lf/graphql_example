/* jshint esversion: 8*/

const jwt = require('jsonwebtoken');
const config = require ('config');

const decodedToken = (req, requireAuth = true) => {
  const header =  req.req.headers.authorisation;
  if (header) {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.secret);
    return decoded;
  }

  if (requireAuth) {
    throw new Error('Login in to access resource');
  } 

  return null;
};
module.exports = { decodedToken };