'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(8, 'Новый пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    annual_limit: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PasswordFormData>();

    const getProfile = useCallback(async () => {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return null;
                }
                throw new Error('Ошибка загрузки профиля');
            }
            return await res.json();
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            return null;
        }
    }, [router]);

    useEffect(() => {
        getProfile().then((data) => {
            setProfile(data);
            setLoading(false);
        });
    }, [getProfile]);

    const onSubmitPassword = async (data: PasswordFormData) => {
        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || 'Ошибка при смене пароля');
                return;
            }

            toast.success('Пароль успешно изменён');
            reset();
            setShowPasswordForm(false);
        } catch (error) {
            toast.error('Не удалось изменить пароль');
        }
    };

    const handleLogout = async () => {
        await authClient.signOut();
        router.push('/login');
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Профиль</h1>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
                    Выйти
                </button>
            </div>

            {/* Информация о профиле */}
            <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Информация</h2>
                <div className="space-y-3">
                    <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{profile?.email || 'Не указан'}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Имя:</span>
                        <span className="ml-2 font-medium">{profile?.full_name || 'Не указано'}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Годовой лимит:</span>
                        <span className="ml-2 font-medium">
                            {profile?.annual_limit?.toLocaleString() || '2 400 000'} ₽
                        </span>
                    </div>
                </div>
            </div>

            {/* Форма смены пароля */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Смена пароля</h2>
                    {!showPasswordForm && (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Изменить пароль
                        </button>
                    )}
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Текущий пароль
                            </label>
                            <input
                                {...register('currentPassword')}
                                type="password"
                                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.currentPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Новый пароль
                            </label>
                            <input
                                {...register('newPassword')}
                                type="password"
                                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Подтвердите пароль
                            </label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    reset();
                                }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500 text-sm">
                        Нажмите «Изменить пароль», чтобы задать новый пароль.
                    </p>
                )}
            </div>

            {/* Ссылка на дашборд */}
            <div className="mt-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-blue-600 hover:underline"
                >
                    ← Вернуться к доходам
                </button>
            </div>
        </div>
    );
}
