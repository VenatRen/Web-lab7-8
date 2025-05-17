import { UserService } from './user.service.js';

export class UserController {
static async register(request, reply) {
        try {
            const { error, data: result } = await UserService.register(request.body);

            if (error) {
                reply.code(500);
                return { error: 'Internal server error' };
            }

            return result;
        } catch (error) {
            console.error(error);
            reply.code(500);
            return { error: 'Internal server error' };
        }
    }

    static async login(request, reply) {
        const { error, data: user } = await UserService.login(request.body);

        if (error) {
            return { error };
        }

        const token = reply.jwtSign(user.dataValues, { expiresIn: '2d' });

        await reply.redis.sadd(`user:access_tokens:${user.dataValues.id}`, token);
        reply.setCookie('access_token', token, {
            domain: 'localhost',
            path: '/',
            secure: true,
            sameSite: true,
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        });

        return { data: user };
    }

    static async getUser(request, reply) {
        const { error, data: user } = await UserService.get(request.user.id);

        if (error) {
            return { error: 'Internal server error' };
        }

        const { password, salt, ...userData } = user.dataValues;
        return userData;
    }

    static async logout(request, reply) {
        const { error, data } = await UserService.logout(request.user.id);
        if (error) {
            return { error: 'Internal server error' };
        }
        reply.clearCookie('access_token');
        return { message: data };
    }

    static async logoutActive(request, reply) {
        const currentToken = request.cookies.access_token;
        const { error, data } = await UserService.logoutActive(request.user.id, currentToken);
        if (error) {
            return { error: 'Internal server error' };
        }
        return { message: data };
    }
}
