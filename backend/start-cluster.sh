#!/bin/bash

# Kill any existing Node.js processes on ports 3000-3002
for port in 3000 3001 3002; do
    lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Start three Node.js instances
echo "Starting Node.js instances..."
cd "$(dirname "$0")"  # Ensure we're in the backend directory

# Start each instance in a new terminal window
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && PORT=3000 npm start"'
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && PORT=3001 npm start"'
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && PORT=3002 npm start"'

echo "Node.js instances started. Please check the new terminal windows." 