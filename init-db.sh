#!/bin/bash

# This script initializes the database before the application starts
# It creates the database schema and runs migrations

echo "Waiting for PostgreSQL to be ready..."
sleep 5  # Give PostgreSQL time to start up

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Seed the database with initial data if needed
# echo "Seeding database with initial data..."
# Add any seeding commands here

echo "Database initialization complete!"
