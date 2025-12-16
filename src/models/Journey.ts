import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface JourneyAttributes {
    id: number;
    name: string;
    description: string;
    icon: string;
    order: number;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface JourneyCreationAttributes extends Optional<JourneyAttributes, 'id' | 'isPublished'> { }

class Journey extends Model<JourneyAttributes, JourneyCreationAttributes> implements JourneyAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public icon!: string;
    public order!: number;
    public isPublished!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Journey.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: '📚',
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'journeys',
        timestamps: true,
        indexes: [
            {
                fields: ['order'],
            },
        ],
    }
);

export default Journey;
