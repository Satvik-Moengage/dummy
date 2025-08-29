#!/bin/bash

# Seed Database Script
# This script populates the database with dummy data for testing

echo "🌱 Running database seed script..."

# Change to backend directory
cd "$(dirname "$0")"

# Run the seed script with the virtual environment
if [ -f "../.venv/bin/python" ]; then
    ../.venv/bin/python seed_data.py
elif [ -f ".venv/bin/python" ]; then
    .venv/bin/python seed_data.py
else
    python seed_data.py
fi

echo "✨ Seeding complete!"
