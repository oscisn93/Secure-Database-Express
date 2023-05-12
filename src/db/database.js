const { Sequelize } = require('sequelize');

function Database() {
  // Instantiate ORM service
  const sequelize = new Sequelize('users', 'appaccount', 'apppass', {
    host: 'localhost',
    dialect: 'mysql'
  });
  // test the connection
  // try {
  //   await sequelize.authenticate();
  //   console.log('Connection successfully established');
  // } catch (err) {
  //   console.error('Unable to connect to the datagbase: ', err);
  // }
  return sequelize;
}

module.exports = {
  database: Database(),
};

