import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel.js';

export const profileController = {
    async getMyProfile(req, res) {
        const userId = req.user.userId;
        try{
            const user = await UserModel.findById(userId);

            if(!user) return res.status(404).json({ error: 'Пользователь не найден' });

            res.json(user);
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async updateMyProfile(req, res) {
        const userId = req.user.userId;
        const { name, email, password } = req.body;

        try{
            const userCheck = await UserModel.findByIdFull(userId);
            if (!userCheck) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const updates = {};
            if (name) updates.name = name;
            if (email) updates.email = email;

            // Если передан пароль, обновляем его
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.password_hash = hashedPassword;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'Нет данных для обновления' });
            }

            const user = await UserModel.update(userId, updates);
            res.json({ message: 'Профиль успешно обновлен', user });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async getProfile(req, res) {
        const {userId} = req.params;
        try{
            const user = await UserModel.findById(userId);

            if(!user) return res.status(404).json({ error: 'Пользователь не найден' });

            res.json(user);
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async updateProfile(req, res) {
        const {userId} = req.params;
        const { name, email, password } = req.body;

        try{
            const userCheck = await UserModel.findByIdFull(userId);
            if (!userCheck) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const updates = {};
            if (name) updates.name = name;
            if (email) updates.email = email;

            // Если передан пароль, обновляем его
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.password_hash = hashedPassword;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'Нет данных для обновления' });
            }

            const user = await UserModel.update(userId, updates);
            res.json({ message: 'Профиль успешно обновлен', user });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async getUserComments(req, res) {
        const {userId} = req.params;
        try{
            const user = await UserModel.findByIdFull(userId);
            
            if(!user) return res.status(404).json({ error: 'Пользователь не найден' });
            
            // Безопасный ответ без HTML контента, который может вызвать XSS
            res.json({
                userId: user.id,
                name: user.name,
                email: user.email,
                bio: user.bio || ''
            });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

