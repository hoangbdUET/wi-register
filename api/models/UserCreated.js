module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_created', {
        idUserCreated: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
    });
};