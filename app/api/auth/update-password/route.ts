import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Требуется текущий и новый пароль' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Новый пароль должен содержать минимум 8 символов' },
                { status: 400 }
            );
        }

        // Проверяем текущий пароль
        const validPassword = await auth.api.verifyPassword({
            body: {
                email: session.user.email,
                password: currentPassword,
            },
        });

        if (!validPassword) {
            return NextResponse.json(
                { error: 'Неверный текущий пароль' },
                { status: 400 }
            );
        }

        // Обновляем пароль
        await auth.api.updateUser({
            body: {
                password: newPassword,
            },
            headers: req.headers,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        return NextResponse.json(
            { error: 'Ошибка при смене пароля' },
            { status: 500 }
        );
    }
}
