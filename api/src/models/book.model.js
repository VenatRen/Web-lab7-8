import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { File } from '../file/file.model.js';

export class Book extends Model { }

Book.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        publishedYear: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fileId: {
            type: DataTypes.UUID,
            references: {
                model: File,
                key: 'id'
            }
        }
    },
    {
        sequelize,
        modelName: 'books',
    },
);

// Связь с файлом
Book.belongsTo(File, { foreignKey: 'fileId', as: 'file' });
