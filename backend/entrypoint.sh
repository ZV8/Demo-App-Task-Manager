#!/bin/sh

# Ждем, пока PostgreSQL будет готов
echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
    sleep 0.1
done
echo "PostgreSQL started"

# Инициализируем базу данных
python app/init_db.py

# Запускаем приложение
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
