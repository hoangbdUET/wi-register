module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_info', {
        idUserInfo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING(250),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        company: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        jobtitle: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(250),
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
		},
		phone: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultVaule: ""
		}
    });
};
