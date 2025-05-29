#!/bin/bash

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local file..."
  echo "NEXT_PUBLIC_II_URL=https://identity.ic0.app" > .env.local
  echo ".env.local file created!"
fi

# Start the development server
echo "Starting Next.js development server..."
npm run dev 