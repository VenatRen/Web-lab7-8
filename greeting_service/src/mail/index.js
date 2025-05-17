// greeting_service/src/mail/index.js
import nodemailer from 'nodemailer';

export class Handler {
    static async createUserHandler(payload) {
        console.log('Получено событие регистрации:', payload);
        
        // 1. Настройка транспорта для отправки email
        const transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru', // SMTP сервер Яндекса
            port: 465,              // Порт для SSL
            secure: true,           // Использовать SSL
            auth: {
                user: 'Asriel.stavnichiy@yandex.ru', // Ваш email
                pass: 'elgupsmciofsbzrg'          // Пароль или app-пароль
            }
        });

        // 2. Настройка письма
        const mailOptions = {
            from: 'Asriel.stavnichiy@yandex.ru',
            to: payload.email, // Email пользователя из payload
            subject: 'Добро пожаловать!',
            text: `Приветствуем, ${payload.username}!\n\nСпасибо за регистрацию.`,
            html: `<h1>Добро пожаловать!</h1>
                   <p>Приветствуем, <strong>${payload.username}</strong>!</p>
                   <p>Спасибо за регистрацию в нашем сервисе.</p>`
        };

        // 3. Отправка письма
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Письмо отправлено: %s', info.messageId);
        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    }
}