import { Sequelize } from 'sequelize';

// Создаем экземпляр Sequelize для подключения к базе данных
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'lab_db', // Имя базы данных
  process.env.DB_USER || 'student',   // Имя пользователя базы данных
  process.env.DB_PASSWORD || 'QrGZex', // Пароль пользователя базы данных
  {
    host: process.env.DB_HOST || 'localhost', // Хост базы данных
    port: process.env.DB_PORT || 5432,        // Порт базы данных
    dialect: 'postgres',                       // Диалект базы данных
    logging: false,                           // Отключение логгирования SQL-запросов
  }
);

// Функция для проверки подключения к базе данных
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
