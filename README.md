# Task Manager

Современное веб-приложение для управления задачами с аутентификацией пользователей и REST API.

## Установка и запуск

### С использованием Docker (рекомендуется)

1. Убедитесь, что у вас установлены Docker и Docker Compose
2. Клонируйте репозиторий:
```bash
git clone https://github.com/ZV8/Demo-App-Task-Manager.git
cd Demo-App-Task-Manager
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

Приложение будет доступно по адресу http://localhost

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
├── .env.example         # Пример файла с переменными окружения
├── docker-compose.yml   # Конфигурация Docker Compose
├── docs/               # Документация проекта
├── backend/            # Backend часть приложения (Python/FastAPI)
│   ├── Dockerfile     # Конфигурация Docker для backend
│   ├── app/          # Основной код приложения
│   ├── entrypoint.sh # Скрипт запуска для Docker
│   └── requirements.txt # Зависимости Python
└── frontend/          # Frontend часть приложения (React/TypeScript)
    ├── Dockerfile    # Конфигурация Docker для frontend
    ├── nginx.conf   # Конфигурация Nginx
    ├── package.json # Зависимости и скрипты npm
    ├── public/      # Публичные статические файлы
    ├── src/         # Исходный код React приложения
    └── tsconfig.json # Конфигурация TypeScript
```

## Функциональность

- Регистрация и аутентификация пользователей
  - JWT токены (access + refresh)
  - Rate limiting:
    - 5 попыток входа в минуту для логина
    - 3 попытки в минуту для регистрации
    - 30 запросов в минуту для остальных эндпоинтов
  - Защита от брутфорс атак через ограничение попыток
- Управление задачами
  - Создание, редактирование и удаление задач
  - Фильтрация задач по статусу
  - Сортировка задач по дате создания
  - Отображение даты создания задач
- Безопасность
  - Rate limiting по IP адресу
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

**Content-Type:** application/x-www-form-urlencoded
```json
{
  "username": "string",
  "password": "string"
}
```
Ответы:
- 200: Успешная аутентификация (возвращает access и refresh токены)
- 401: Неверные учетные данные
- 429: Превышен лимит попыток (5 попыток в минуту)
- 500: Внутренняя ошибка сервера

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
- 200: Пользователь создан
- 400: Email уже зарегистрирован или имя пользователя занято
- 429: Превышен лимит запросов (3 попытки в минуту)

### Задачи

Все эндпоинты требуют авторизации (Bearer token в заголовке Authorization).

#### GET /api/tasks
Получение списка задач пользователя.

Параметры запроса:
- skip (number, optional): Количество пропускаемых задач (по умолчанию 0)
- limit (number, optional): Максимальное количество возвращаемых задач (по умолчанию 100)

Ответы:
- 200: Список задач
- 401: Отсутствует или недействительный токен
- 429: Превышен лимит запросов (30 запросов в минуту)

#### GET /api/tasks/{task_id}
Получение конкретной задачи по ID.

Ответы:
- 200: Задача найдена
- 401: Отсутствует или недействительный токен
- 404: Задача не найдена
- 429: Превышен лимит запросов (30 запросов в минуту)

#### POST /api/tasks
Создание новой задачи.
```json
{
  "title": "string",
  "description": "string",
  "completed": false
}
```
Ответы:
- 200: Задача создана
- 401: Отсутствует или недействительный токен
- 422: Ошибка валидации данных
- 429: Превышен лимит запросов (30 запросов в минуту)

#### PUT /api/tasks/{task_id}
Обновление задачи.
```json
{
  "title": "string",
  "description": "string",
  "completed": boolean
}
```
Ответы:
- 200: Задача обновлена
- 401: Отсутствует или недействительный токен
- 404: Задача не найдена
- 422: Ошибка валидации данных
- 429: Превышен лимит запросов (30 запросов в минуту)

#### DELETE /api/tasks/{task_id}
Удаление задачи.

Ответы:
- 200: Задача удалена
- 401: Отсутствует или недействительный токен
- 404: Задача не найдена
- 429: Превышен лимит запросов (30 запросов в минуту)

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
- [ ] Автоматическая блокировка IP после определенного числа неудачных попыток

### Тестирование
- [ ] Расширение покрытия unit-тестами
- [ ] Добавление e2e тестов
- [ ] Добавление интеграционных тестов

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
