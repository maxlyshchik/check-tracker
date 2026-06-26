const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.yvambnlycfzjerjhlrhs:oBEP3qQUo7g8kCgo@aws-1-eu-north-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    try {
        console.log('🔄 Запуск миграции...');
        
        // Удаляем все таблицы
        await pool.query(`DROP TABLE IF EXISTS "session" CASCADE`);
        await pool.query(`DROP TABLE IF EXISTS "verification" CASCADE`);
        await pool.query(`DROP TABLE IF EXISTS "account" CASCADE`);
        await pool.query(`DROP TABLE IF EXISTS "user" CASCADE`);
        console.log('✅ Таблицы удалены');
        
        // Создаём таблицу user (id как TEXT для better-auth)
        await pool.query(`
            CREATE TABLE "user" (
                "id" text PRIMARY KEY,
                "email" varchar(255) UNIQUE NOT NULL,
                "emailVerified" boolean DEFAULT false,
                "name" varchar(255),
                "image" varchar(500),
                "createdAt" timestamp DEFAULT NOW(),
                "updatedAt" timestamp DEFAULT NOW()
            )
        `);
        console.log('✅ Таблица user создана');
        
        // Создаём таблицу account
        await pool.query(`
            CREATE TABLE "account" (
                "id" text PRIMARY KEY,
                "userId" text REFERENCES "user"(id) ON DELETE CASCADE,
                "accountId" varchar(255) NOT NULL,
                "providerId" varchar(255) NOT NULL,
                "accessToken" text,
                "refreshToken" text,
                "idToken" text,
                "accessTokenExpiresAt" timestamp,
                "refreshTokenExpiresAt" timestamp,
                "scope" text,
                "password" varchar(255),
                "createdAt" timestamp DEFAULT NOW(),
                "updatedAt" timestamp DEFAULT NOW(),
                UNIQUE("providerId", "accountId")
            )
        `);
        console.log('✅ Таблица account создана');
        
        // Создаём таблицу session
        await pool.query(`
            CREATE TABLE "session" (
                "id" text PRIMARY KEY,
                "sessionToken" varchar(255) UNIQUE NOT NULL,
                "userId" text REFERENCES "user"(id) ON DELETE CASCADE,
                "expiresAt" timestamp NOT NULL,
                "createdAt" timestamp DEFAULT NOW(),
                "updatedAt" timestamp DEFAULT NOW()
            )
        `);
        console.log('✅ Таблица session создана');
        
        // Создаём таблицу verification
        await pool.query(`
            CREATE TABLE "verification" (
                "id" text PRIMARY KEY,
                "identifier" varchar(255) NOT NULL,
                "value" varchar(255) NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "createdAt" timestamp DEFAULT NOW(),
                "updatedAt" timestamp DEFAULT NOW(),
                UNIQUE("identifier", "value")
            )
        `);
        console.log('✅ Таблица verification создана');
        
        // Создаём индексы
        await pool.query(`CREATE INDEX "account_userId_idx" ON "account"("userId")`);
        await pool.query(`CREATE INDEX "session_userId_idx" ON "session"("userId")`);
        await pool.query(`CREATE INDEX "verification_identifier_idx" ON "verification"("identifier")`);
        console.log('✅ Индексы созданы');
        
        console.log('✅ Миграция выполнена успешно!');
    } catch (error) {
        console.error('❌ Ошибка миграции:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
