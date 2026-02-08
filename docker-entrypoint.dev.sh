#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until pg_isready -h database -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; do
  sleep 1
done

echo "Database is ready. Running migrations..."
npx drizzle-kit push --autoApprove 2>/dev/null || true

echo "Starting Next.js development server..."
exec npm run dev
