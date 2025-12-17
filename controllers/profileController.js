import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel.js';

export const profileController = {
    async getProfile(req, res) {
        const {userId} = req.params;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: userId вставляется напрямую в SQL
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
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: userId вставляется напрямую в SQL
            const userCheck = await UserModel.findByIdFull(userId);
            if (!userCheck) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const updates = [];
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую без экранирования
            if (name) updates.push(`name = '${name}'`);
            if (email) updates.push(`email = '${email}'`);

            // Если передан пароль, обновляем его
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push(`password_hash = '${hashedPassword}'`);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'Нет данных для обновления' });
            }

            const user = await UserModel.update(userId, updates);
            // Уязвимость: возвращаем данные без санитизации
            res.json({ message: 'Профиль успешно обновлен', user });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async getUserComments(req, res) {
        const {userId} = req.params;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: userId вставляется напрямую в SQL
            const user = await UserModel.findByIdFull(userId);
            
            if(!user) return res.status(404).json({ error: 'Пользователь не найден' });
            
            // Уязвимость: возвращаем данные без санитизации
            // Если name или email содержат HTML/JS, они будут выполнены на клиенте
            res.json({
                userId: user.id,
                name: user.name,
                email: user.email,
                bio: user.bio || '',
                // Если фронтенд использует innerHTML вместо textContent, это вызовет XSS
                htmlContent: `<div>Пользователь: ${user.name}</div><script>console.log('XSS executed!')</script>`
            });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

