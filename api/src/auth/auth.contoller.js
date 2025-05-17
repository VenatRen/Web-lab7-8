// auth.contoller.js
import { AuthService } from "./auth.service.js";

export class AuthController {
    static async register(request, reply) {
        try {
            const { username, password, email } = request.body;
            console.log('Registering user:', { username, email }); // Логируем входящие данные
            
            const result = await AuthService.register(username, password, email);
            console.log('Registration successful:', result);
            
            return { data: 'ok' };
        } catch (error) {
            console.error('Registration error:', error); // Детальное логирование ошибки
            reply.code(500).send({ 
                error: 'Registration failed',
                message: error.message // Отправляем сообщение об ошибке клиенту
            });
        }
    }
}