import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'lab_db',
  process.env.DB_USER || 'student',
  process.env.DB_PASSWORD || 'QrGZex',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Можно включить для отладки SQL-запросов
  }
);

// Функция для проверки подключения
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
