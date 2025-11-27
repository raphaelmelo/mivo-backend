import sequelize from './src/config/database';

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.getQueryInterface().addColumn('users', 'lessonsCompleted', {
            type: 'INTEGER',
            defaultValue: 0,
            allowNull: false
        });

        console.log('Column added successfully.');

    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
