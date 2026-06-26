'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

// Схема для формы добавления дохода
const incomeSchema = z.object({
    amount: z.number('Введите число').positive('Сумма должна быть > 0'),
    description: z.string().optional(),
    date: z.string().min(1, 'Выберите дату'),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface Income {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalMonth, setTotalMonth] = useState(0);
    const [totalYear, setTotalYear] = useState(0);
    const [annualLimit, setAnnualLimit] = useState(2400000);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<IncomeFormData>({
        resolver: zodResolver(incomeSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        },
    });

    const getIncomes = useCallback(async (): Promise<Income[]> => {
        const res = await fetch('/api/incomes');
        if (!res.ok) {
            if (res.status === 401) {
                router.push('/login');
                return [];
            }
            throw new Error('Ошибка загрузки');
        }
        return await res.json();
    }, [router]);

// Функция для получения профиля
    const getProfile = useCallback(async () => {
        const res = await fetch('/api/profile');
        if (res.ok) {
            return await res.json();
        }
        return null;
    }, []);

// Функция загрузки всех данных и обновления состояний
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const incomesData = await getIncomes();
            setIncomes(incomesData);

            // Вычисляем суммы
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const monthIncomes = incomesData.filter(inc => {
                const d = new Date(inc.date);
                return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
            });
            const yearIncomes = incomesData.filter(inc => {
                const d = new Date(inc.date);
                return d.getFullYear() === currentYear;
            });
            const sumMonth = monthIncomes.reduce((acc, inc) => acc + inc.amount, 0);
            const sumYear = yearIncomes.reduce((acc, inc) => acc + inc.amount, 0);
            setTotalMonth(sumMonth);
            setTotalYear(sumYear);

            // Загружаем профиль
            const profile = await getProfile();
            if (profile?.annual_limit) {
                setAnnualLimit(profile.annual_limit);
            }
        } catch (error) {
            toast.error('Не удалось загрузить данные', error);
        } finally {
            setLoading(false);
        }
    }, [getIncomes, getProfile]);

    // Загрузка профиля для получения лимита
    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile'); // создадим этот эндпоинт позже
            if (res.ok) {
                const profile = await res.json();
                if (profile.annual_limit) setAnnualLimit(profile.annual_limit);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    useEffect(() => {
        // Переделать получение даных
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData().then(result => console.log('result', result));
        fetchProfile();
    }, [loadData]);

    // Добавление дохода
    const onSubmit = async (data: IncomeFormData) => {
        try {
            const res = await fetch('/api/incomes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || 'Ошибка');
                return;
            }
            toast.success('Доход добавлен');
            reset({ date: new Date().toISOString().split('T')[0], description: '' });
            loadData(); // обновляем список
        } catch (error) {
            toast.error('Не удалось добавить доход', error);
        }
    };

    // Удаление дохода
    const deleteIncome = async (id: string) => {
        if (!confirm('Удалить запись?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/incomes/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || 'Ошибка');
                return;
            }
            toast.success('Удалено');
            loadData();
        } catch (error) {
            toast.error('Не удалось удалить', error);
        } finally {
            setDeletingId(null);
        }
    };

    // Выход
    const handleLogout = async () => {
        await authClient.signOut();
        router.push('/login');
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    const progress = Math.min((totalYear / annualLimit) * 100, 100);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Мой доход</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/profile')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Профиль
                    </button>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
                        Выйти
                    </button>
                </div>
            </div>

            {/* Карточки сумм */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded shadow">
                    <div className="text-sm text-gray-600">За месяц</div>
                    <div className="text-2xl font-bold">{totalMonth.toLocaleString()} ₽</div>
                </div>
                <div className="p-4 bg-green-50 rounded shadow">
                    <div className="text-sm text-gray-600">За год</div>
                    <div className="text-2xl font-bold">{totalYear.toLocaleString()} ₽</div>
                </div>
            </div>

            {/* Прогресс годового лимита */}
            <div className="mb-6">
                <div className="flex justify-between text-sm">
                    <span>Годовой лимит (2.4 млн ₽)</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Форма добавления */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 border rounded bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <input
                            {...register('amount', { valueAsNumber: true })}
                            type="number"
                            placeholder="Сумма"
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                    </div>
                    <div>
                        <input
                            {...register('description')}
                            placeholder="Описание (необязательно)"
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <input
                            {...register('date')}
                            type="date"
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Добавление...' : 'Добавить доход'}
                </button>
            </form>

            {/* Список доходов */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Последние записи</h2>
                {incomes.length === 0 ? (
                    <p className="text-gray-500">Нет записей</p>
                ) : (
                    <ul className="space-y-2">
                        {incomes.map((inc) => (
                            <li key={inc.id} className="flex justify-between items-center p-3 border rounded">
                                <div>
                                    <span className="font-medium">{inc.amount.toLocaleString()} ₽</span>
                                    {inc.description && <span className="ml-2 text-gray-600">— {inc.description}</span>}
                                    <span className="ml-4 text-sm text-gray-400">{new Date(inc.date).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <button
                                    onClick={() => deleteIncome(inc.id)}
                                    disabled={deletingId === inc.id}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                    {deletingId === inc.id ? '...' : '✕'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}