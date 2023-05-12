const { database } = require('./database.js');
const { DataTypes } = require('sequelize');

// const sequelize = new Sequelize('users', 'appaccount', 'apppass', {
//   host: 'localhost',
//   dialecta: 'mysql'
// });

const User = database.define('appuser', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  password:  {
    type: DataTypes.STRING,
    allowNull: false,
  },
 info: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = {
  User
};

