// Уязвимость XSS: отключаем заголовки безопасности
export const disableSecurityHeaders = (req, res, next) => {
    // Убираем заголовки безопасности для демонстрации XSS уязвимостей
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Content-Security-Policy');
    next();
};

