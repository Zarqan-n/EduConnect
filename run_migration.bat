@echo off
REM This script applies the database migration for student enrollments and payments
REM Make sure you have PostgreSQL psql installed and in your PATH

echo Running database migration...
echo.
echo Make sure you have these environment variables set or update the connection string below:
echo - DATABASE_URL or connection details
echo.

REM Update these with your database credentials
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=educonnect
set DB_USER=postgres

echo Executing migration file...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% < manual_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration completed successfully!
) else (
    echo.
    echo Error running migration. Please check your database connection.
)

pause
