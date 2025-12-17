export const searchController = {
    async search(req, res) {
        const { q } = req.query;
        // Уязвимость: пользовательский ввод вставляется напрямую в HTML без экранирования
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Результаты поиска</title>
        </head>
        <body>
            <h1>Результаты поиска</h1>
            <p>Вы искали: ${q || 'ничего'}</p>
            <div id="results">
                ${q ? `<p>Найдено: ${q}</p>` : '<p>Введите запрос для поиска</p>'}
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
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ и XSS: контент не экранируется
            // В реальности нужно создать таблицу comments и сохранить туда
            // Для демонстрации просто возвращаем контент обратно
            res.json({
                success: true,
                message: 'Комментарий добавлен',
                comment: {
                    recipe_id,
                    user_id,
                    content: content, // Уязвимость: контент возвращается как есть, без экранирования HTML
                    html: `<div class="comment">${content}</div>`, // Опасно: HTML вставляется напрямую
                    // Если фронтенд использует innerHTML или dangerouslySetInnerHTML, XSS сработает
                    unsafeHtml: content // Прямой доступ к небезопасному HTML
                }
            });
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

