const { Pool } = require('pg');

// Подставьте вашу строку сюда для теста, либо используйте переменную окружения
const connectionString = 'postgresql://postgres.yvambnlycfzjerjhlrhs:oBEP3qQUo7g8kCgo@aws-1-eu-north-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Ошибка подключения:', err.message);
        console.error('Код:', err.code);
        if (err.code === 'ENOTFOUND') {
            console.error('⚠️ Хост не найден. Проверьте имя хоста или используйте Session pooler.');
        }
    } else {
        console.log('✅ Подключение успешно! Время на сервере:', res.rows[0].now);
    }
    pool.end();
});