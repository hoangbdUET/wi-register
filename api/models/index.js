const Sequelize = require('sequelize');
const config = require('config').Database;


const sequelize = new Sequelize(config.dbName, config.user, config.password, {
    define: {
        freezeTableName: true
    },
    dialect: config.dialect,
    port: config.port,
    logging: config.logging,
    pool: {
        max: 20,
        min: 0,
        idle: 200
    },
    operatorsAliases: Sequelize.Op
});
sequelize.sync()
    .catch(function (err) {
        console.log(err);
    });
let models = [
    'UserInfo',
    'UserCreated'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.UserInfo.hasOne(m.UserCreated, { foreignKey: { name: 'idUserInfo', allowNull: false }, onDelete: 'CASCADE' });
})(module.exports);
module.exports.sequelize = sequelize;
