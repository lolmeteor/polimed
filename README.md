# Полимедика - Telegram Mini App

Мини-приложение для записи на приём в клинику Полимедика через Telegram.

## Технологии

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## Требования

- Node.js 18.17 или выше
- npm или yarn
- PostgreSQL (для production)
- SQLite (для разработки)

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone [url-репозитория]
cd polymedika
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
```

3. Настройте переменные окружения:
- Скопируйте `.env.example` в `.env.local`
- Заполните необходимые переменные окружения

4. Настройте базу данных:
```bash
# Для разработки (SQLite)
npm run use-sqlite
npm run prisma:push
npm run seed

# Для production (PostgreSQL)
npm run use-postgres
npm run prisma:push
```

5. Запустите приложение:
```bash
# Режим разработки
npm run dev

# Production сборка
npm run build
npm start
```

## Деплой

Приложение настроено для автоматического деплоя на Vercel при пуше в main ветку.

1. Убедитесь, что все переменные окружения настроены в Vercel
2. При пуше в main ветку деплой произойдет автоматически
3. Проверьте статус деплоя в Vercel Dashboard

## Структура проекта

```
polymedika/
├── app/              # Next.js страницы и роуты
├── components/       # React компоненты
├── lib/             # Утилиты и хелперы
├── prisma/          # Схема и миграции базы данных
├── public/          # Статические файлы
└── styles/          # Глобальные стили
```

## Разработка

1. Создайте новую ветку для фичи:
```bash
git checkout -b feature/название-фичи
```

2. Внесите изменения и закоммитьте:
```bash
git add .
git commit -m "описание изменений"
```

3. Отправьте изменения в репозиторий:
```bash
git push origin feature/название-фичи
```

4. Создайте Pull Request в main ветку

## Поддержка

При возникновении проблем создайте Issue в репозитории или обратитесь к разработчикам. 