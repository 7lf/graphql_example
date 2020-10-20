/* jshint esversion: 8*/

const { Sequelize, DataTypes } = require('sequelize');
const config = require('config');

//-------------------------------------------------------------------
const sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: config.database.dialect,
    pool: config.database.pool,
    autoreconnect: true
});
const { Op } = require("sequelize");
//-------------------------------------------------------------------
let TableUsers = sequelize.define('users', { // пользователи
  id: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.DataTypes.STRING,
  },
  password: {
    type: Sequelize.DataTypes.STRING(100),
  },
  name: {
    type: Sequelize.DataTypes.STRING,
  }
});

let TableAccessPaths = sequelize.define('access_paths', { // пути
  id: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.DataTypes.STRING,
  },
  type: {
    type: Sequelize.DataTypes.STRING,
  }
});

let TableAccessPathsAndUsers = sequelize.define('access_paths_and_users', { // пути и пользователи
  id_user: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: false,
  },
  id_path: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: false,
  }
});
//-------------------------------------------------------------------
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
  }
};
//-------------------------------------------------------------------
const connect = async () => {
  return await sequelize.authenticate().then(() => {
    return {
      status: 'ok',
      data: 'Connection to DB has been established successfully.',
      sequelize: sequelize
    };
  }).catch(err => {
    return {
      status: 'error',
      data: 'Unable to connect to the database: ' + err
    };
  });
};
//-------------------------------------------------------------------
const getUser = async (data) => {
  const result = await TableUsers.findOne({
    where: {
      email: data.email,
      // password: data.password,
    },
    raw: true
  });

  if (result === null) {
    return [{status: 'error', data: 'User not found!'}];
  } else {
    result.status = 'ok';
    return [result];
  }
};
//-------------------------------------------------------------------
const createUser = async (data) => {
  let result = await TableUsers.findOrCreate({
    where: {
      email: data.email,
      name: data.name,
    },
    defaults: {
      email: data.email,
      name: data.name,
      password: data.password
    }
  });
  
  if (result[1] === true) {
    return 'ok';
  } else {
    throw new Error('Already exists!');
  }
};
//-------------------------------------------------------------------
const checkAccess = async (user, type, name) => {
  /* 
    Ищем путь.
      Если пути нет - отказ
      Путь есть: ищем соотношение пути и пользователя
       Есть - разрешаем доступ
       Нет - ошибка
  */
  let result = await TableAccessPaths.findOne({
    where: {
      type: type,
      name: name
    }
  });
  if (result === null) {
    return {status: 'error', data: 'Path not found'};
  } else {
    return {status: 'ok', data: ''};
  }
};
//-------------------------------------------------------------------
module.exports = {
  connect: connect,
  getUser: getUser,
  createUser: createUser,
  checkAccess: checkAccess,
};