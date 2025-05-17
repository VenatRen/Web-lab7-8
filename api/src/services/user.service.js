import crypto from 'crypto';
import { User } from '../models/user.model.js';

export class UserService {
    constructor(fastifyInstance) {
        this.fastify = fastifyInstance;
    }

async register(payload) {
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(payload.password, salt, 1000, 64, 'sha512').toString('hex');

        const result = await User.create({
            username: payload.username, // Добавьте эту строку
            email: payload.email,
            password: hashedPassword,
            salt: salt
        });

        return { error: null, data: result };
    } catch (err) {
        console.error(err);
        return { error: err, data: null };
    }
}

    async login(payload) {
        try {
            const user = await User.findOne({ where: { email: payload.email } });
            if (user) {
                const hashedPassword = crypto.pbkdf2Sync(payload.password, user.salt, 1000, 64, 'sha512').toString('hex');
                if (user.password === hashedPassword) {
                    return { error: null, data: user };
                }
            }
            return { error: 'User not found', data: null };
        } catch (err) {
            console.error(err);
            return { error: err, data: null };
        }
    }

    async logout(userId) {
        try {
            console.log(`Attempting to logout user with ID: ${userId}`);
            await this.fastify.redis.del(`user:access_token:${userId}`);
            console.log(`Successfully logged out user with ID: ${userId}`);
            return { error: null, data: 'Logout successful' };
        } catch (err) {
            console.error(`Error logging out user with ID: ${userId}`, err);
            return { error: err.message || err, data: null };
        }
    }

    async logoutActive(userId, currentToken) {
        try {
            const keys = await this.fastify.redis.keys(`user:access_token:*`);
            for (const key of keys) {
                const token = await this.fastify.redis.get(key);
                if (token !== currentToken) {
                    await this.fastify.redis.del(key);
                }
            }
            return { error: null, data: 'Logout from all other sessions successful' };
        } catch (err) {
            console.error(err);
            return { error: err, data: null };
        }
    }

    async get(userId) {
        try {
            const user = await User.findByPk(userId);
            return { error: null, data: user };
        } catch (err) {
            console.error(err);
            return { error: err, data: null };
        }
    }
}
