import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel.js';
import { generateToken } from '../middleware/auth.js';

export const authController = {
    async register(req, res) {
        const {email, password, name} = req.body;
        try{
            // Проверка существования пользователя
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await UserModel.create(email, hashedPassword, name);
            
            // Генерируем JWT токен
            const token = generateToken(user.id);
            
            res.json({ 
                message: 'Пользователь зарегистрирован', 
                token,
                userId: user.id 
            });
        }catch(err){
            res.status(400).json({ error: err.message || 'Ошибка при регистрации' });
        }
    },

    async login(req, res) {
        const {email, password} = req.body;
        try{
            const user = await UserModel.findByEmail(email);

            if(!user) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if(!validPassword) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            // Генерируем JWT токен
            const token = generateToken(user.id);

            res.json({ 
                message: 'Успешный вход', 
                token,
                userId: user.id 
            });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

