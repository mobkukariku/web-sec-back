// Функция для экранирования HTML
const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const searchController = {
    async search(req, res) {
        const { q } = req.query;
        const safeQuery = escapeHtml(q || 'ничего');
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Результаты поиска</title>
        </head>
        <body>
            <h1>Результаты поиска</h1>
            <p>Вы искали: ${safeQuery}</p>
            <div id="results">
                ${q ? `<p>Найдено: ${safeQuery}</p>` : '<p>Введите запрос для поиска</p>'}
            </div>
        </body>
        </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    },

    async createComment(req, res) {
        const { recipe_id, user_id, content } = req.body;
        try{
            // Безопасный ответ: контент возвращается как есть, но фронтенд должен использовать textContent
            // Не возвращаем HTML, чтобы избежать XSS
            res.json({
                success: true,
                message: 'Комментарий добавлен',
                comment: {
                    recipe_id,
                    user_id,
                    content: content // Безопасно: фронтенд должен использовать textContent, а не innerHTML
                }
            });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

