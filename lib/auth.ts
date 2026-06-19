import { betterAuth } from 'better-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';

export const auth = betterAuth({
    database: {
        // Используем адаптер для Supabase
        adapter: SupabaseAdapter({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        }),
    },
    emailAndPassword: {
        enabled: true,
    },
    // Можно добавить social-провайдеры позже
    // socialProviders: { ... },
    secret: process.env.BETTER_AUTH_SECRET!,
    // Имя таблицы пользователей (стандартное для Better-Auth, но можно переопределить)
    // userTableName: 'users', // по умолчанию 'user'
    // Если вы хотите, чтобы профиль создавался автоматически при регистрации, вы можете использовать хуки:
    hooks: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        afterUserCreated: async (user: { id: string; }) => {
            // Создаём профиль в таблице profiles при регистрации
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            await supabase.from('profiles').insert({
                id: user.id,
                annual_limit: 2400000,
                reminder_enabled: false,
                is_pro: false,
            });
            return user;
        },
    },
});