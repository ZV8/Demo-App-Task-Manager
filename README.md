# Task Manager

Современное веб-приложение для управления задачами с аутентификацией пользователей и REST API.

## Технологии

### Frontend
- React 18
- TypeScript
- Material-UI
- Formik + Yup
- Axios

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

### DevOps
- Docker
- Docker Compose
- Nginx

## Структура проекта

```
task-manager/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── core/          # Основные настройки
│   │   ├── models/        # Модели данных
│   │   ├── routers/       # API endpoints
│   │   └── security.py    # Аутентификация
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # React frontend
│   ├── src/
│   │   ├── api/          # API клиент
│   │   ├── components/   # React компоненты
│   │   └── types/        # TypeScript типы
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Функциональность

- Регистрация и аутентификация пользователей
  - JWT токены (access + refresh)
  - Rate limiting (5 попыток входа в минуту)
  - Автоматическая блокировка после превышения лимита попыток
- Управление задачами
  - Создание, редактирование и удаление задач
  - Фильтрация задач по статусу
  - Сортировка задач по дате создания
  - Отображение даты создания задач
- Безопасность
  - Защита от брутфорс атак
  - Обновление токенов
  - Безопасное хранение паролей
- Пользовательский интерфейс
  - Material-UI компоненты
  - Адаптивный дизайн
  - Уведомления о результатах операций

## API Endpoints

### Аутентификация

#### POST /api/auth/login
Аутентификация пользователя.
```json
{
  "username": "string",
  "password": "string"
}
```
Ответы:
- 200: Успешная аутентификация (возвращает access и refresh токены)
- 401: Неверные учетные данные
- 429: Превышен лимит попыток (возвращает время до следующей попытки)

#### POST /api/auth/refresh
Обновление access токена.
```json
{
  "refresh_token": "string"
}
```
Ответы:
- 200: Новая пара токенов
- 401: Недействительный refresh токен

#### POST /api/auth/register
Регистрация нового пользователя.
```json
{
  "email": "string",
  "username": "string",
  "password": "string"
}
```
Ответы:
- 201: Пользователь создан
- 400: Ошибка валидации
- 429: Превышен лимит запросов (3 попытки в минуту)

### Задачи

#### GET /api/tasks
Получение списка задач пользователя.

#### POST /api/tasks
Создание новой задачи.
```json
{
  "title": "string",
  "description": "string",
  "completed": false
}
```

#### PUT /api/tasks/{task_id}
Обновление задачи.
```json
{
  "title": "string",
  "description": "string",
  "completed": boolean
}
```

#### DELETE /api/tasks/{task_id}
Удаление задачи.

## Документация

### API Documentation
Документация API доступна в формате OpenAPI (Swagger):
- Swagger UI: http://localhost:8000/api/docs
- OpenAPI спецификация: http://localhost:8000/api/openapi.json
- [OpenAPI схема](./backend/app/openapi/api_docs.yaml)

### Архитектурная документация
- [Архитектура проекта](./docs/ARCHITECTURE.md) - Подробное описание архитектуры, компонентов системы и процессов

### Разработка
Весь код содержит JSDoc комментарии для улучшения читаемости и поддержки IDE:
- TypeScript интерфейсы и типы
- React компоненты
- Сервисы и утилиты

### Планируемая документация
- Руководство по развертыванию (в разработке)
- Руководство по разработке (в разработке)
- Руководство по безопасности (в разработке)

## Планируемые улучшения

### Функциональность
- [ ] Добавление dark mode
- [ ] Реализация skeleton loaders
- [ ] Добавление анимаций интерфейса
- [ ] Улучшение доступности (a11y)
- [ ] Добавление кеширования на клиенте

### Безопасность
- [ ] Добавление HSTS и CSP заголовков
- [ ] Улучшение логирования безопасности
- [ ] Мониторинг подозрительной активности

### Тестирование
- [ ] Расширение покрытия unit-тестами
- [ ] Добавление e2e тестов
- [ ] Добавление интеграционных тестов

## Установка и запуск

### С использованием Docker (рекомендуется)

1. Убедитесь, что у вас установлены Docker и Docker Compose
2. Клонируйте репозиторий:
```bash
git clone https://github.com/ZV8/Demo-App-Task-Manager.git
cd task-manager
```
3. Скопируйте файл с переменными окружения и настройте его:
```bash
cp .env.example .env
```
Отредактируйте `.env` файл, установив безопасные значения для паролей и ключей.

4. Запустите приложение:
```bash
docker-compose up -d
```

### Локальная разработка

Если вы хотите запустить приложение локально без Docker:

1. Используйте тот же `.env` файл, что и для Docker:
```bash
cp .env.example .env
```
Установите свои значения для переменных окружения.

## Разработка

### Backend

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Установите зависимости:
```bash
cd backend
pip install -r requirements.txt
```

3. Запустите сервер разработки:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Запустите сервер разработки:
```bash
npm start
```

## Тестирование

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Авторы

Vladimir Zotov (zotov@adinweb.ru)

## Лицензия

MIT
