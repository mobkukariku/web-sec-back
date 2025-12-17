import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel.js';

export const authController = {
    async register(req, res) {
        const {email, password, name} = req.body;
        try{
            const hashedPassword = await bcrypt.hash(password, 10);
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую в SQL без экранирования
            const user = await UserModel.create(email, hashedPassword, name);
            res.json({ message: 'Пользователь зарегистрирован', userId: user.id });
        }catch(err){
            res.status(400).json({ error: err });
        }
    },

    async login(req, res) {
        const {email, password} = req.body;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: email вставляется напрямую в SQL
            const user = await UserModel.findByEmail(email);

            if(!user) return res.status(400).json({ error: 'User not found' });

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if(!validPassword) return res.status(400).json({ error: 'Invalid password' });

            res.json({ message: 'Успешный вход', userId: user.id });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

