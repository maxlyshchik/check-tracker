// scripts/add-user.ts
import { auth } from '@/lib/auth'

async function addUser() {
    try {
        const user = await auth.api.signUpEmail({
            body: {
                email: 'test@example.com',
                password: '12345678',
                name: 'Test User',
            },
        })
        console.log('Пользователь создан:', user)
    } catch (error) {
        console.error('Ошибка:', error)
    }
}

addUser()