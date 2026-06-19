import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                    Чек-лист-трекер
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                    Учитывайте доходы, контролируйте годовой лимит самозанятого и получайте полезную статистику.
                    Просто, безопасно, без лишних сложностей.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/login"
                        className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Войти
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700"
                    >
                        Зарегистрироваться
                    </Link>
                </div>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    Бесплатно для самозанятых. PRO-версия — 300 ₽/мес.
                </p>
            </div>
        </div>
    );
}