#!/bin/bash

# Clean up any existing files
rm -rf node_modules .next out package-lock.json

# Clear any problematic environment variables
unset NODE_OPTIONS

# Set up environment variables safely
export NEXT_TELEMETRY_DISABLED=1
export NEXT_SKIP_TYPECHECKING=true
export NEXT_SKIP_SWC=1

# Install dependencies without optional packages
npm install --no-optional --legacy-peer-deps

# Run the build with increased memory but without the problematic flag
node --max_old_space_size=4096 ./node_modules/.bin/next build

# Exit with the status of the last command
exit $? 