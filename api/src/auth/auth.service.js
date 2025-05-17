// auth.service.js
import { AmpqProvider } from '../ampq/ampq.service.js';

export class AuthService {
    constructor(userService) {
        this.userService = userService;
    }

    async register(username, password, email) {
        try {
            if (!username || !password || !email) {
                throw new Error('Username, password and email are required');
            }
            // 1. Создаем пользователя через экземпляр UserService
            const { error: dbError, data: user } = await this.userService.register({
                username,
                password,
                email
            });

            if (dbError) throw dbError;

            // 2. Отправляем письмо
            const { error: amqpError } = await AmpqProvider.sendEventToTheQueue('greetings', {
                username,
                email
            });

            if (amqpError) {
                console.error('Failed to send email:', amqpError);
                // Можно решить - откатывать ли создание пользователя
            }

            return user;
        } catch (error) {
            console.error('AuthService.register error:', error);
            throw error;
        }
    }
}