# Scalable Chat App

A scalable real-time chat application built with Node.js, Socket.IO, Redis, and Next.js. The application uses a multi-node architecture with Nginx load balancing for high availability and scalability.

## Architecture

```
Client (Frontend) → Nginx (Port 8080) → Node.js Instances (Ports 3000, 3001, 3002)
```

- **Frontend**: Next.js application running on port 3001
- **Load Balancer**: Nginx running on port 8080
- **Backend**: Multiple Node.js instances running on ports 3000, 3001, and 3002
- **Message Broker**: Redis running on port 6379

## Prerequisites

- Node.js (v14 or higher)
- Redis
- Nginx
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Configuration

### Backend Environment
Create `backend/.env.production`:
```
NODE_ENV=production
PORT=3000
CORS_URL=http://localhost:3001
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_DIR=logs
```

### Frontend Environment
Create `frontend/.env.production`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

## Running the Application

### 1. Start Redis
```bash
redis-server
```

### 2. Start Nginx Load Balancer
```bash
sudo nginx -c /Users/mac/Desktop/Development/archive/chat-app/backend/nginx.conf
```

### 3. Start Backend Cluster
```bash
cd backend
NODE_ENV=production ./start-cluster.sh
```
This will start three Node.js instances on ports 3000, 3001, and 3002.

### 4. Start Frontend
```bash
cd frontend
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```
The frontend will run on port 3001.

## Stopping the Application

To stop all services:
```bash
# Stop Nginx
sudo nginx -s stop

# Stop Node.js processes
pkill -f node

# Stop Redis
redis-cli shutdown
```

## Features

- Real-time messaging using Socket.IO
- Load balancing with Nginx
- High availability with multiple Node.js instances
- State management with Redis
- Modern UI with Mantine
- TypeScript support
- Automatic reconnection handling
- Private and broadcast messaging

## Troubleshooting

1. **Port Conflicts**
   - If you see "address already in use" errors, use the following command to find and kill the process:
   ```bash
   lsof -i :<port> | grep LISTEN | awk '{print $2}' | xargs kill -9
   ```
   - Common ports to check: 3000, 3001, 3002, 8080, 6379

2. **Redis Issues**
   - If Redis fails to start with "Address already in use":
     ```bash
     redis-cli shutdown
     redis-server
     ```
   - Verify Redis is running: `redis-cli ping` should return "PONG"

3. **Nginx Configuration**
   - If Nginx fails to start, check the configuration:
     ```bash
     sudo nginx -t
     ```
   - Use absolute path for nginx.conf:
     ```bash
     sudo nginx -c /absolute/path/to/backend/nginx.conf
     ```

4. **Node.js Cluster**
   - If Node.js instances fail to start:
     ```bash
     pkill -f node
     cd backend
     NODE_ENV=production ./start-cluster.sh
     ```
   - Check if instances are running:
     ```bash
     ps aux | grep node
     ```

5. **Frontend Issues**
   - If frontend fails to start:
     ```bash
     # Kill any process using port 3001
     lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
     # Rebuild and start
     cd frontend
     NODE_ENV=production npm run build
     NODE_ENV=production npm run start
     ```

6. **Connection Issues**
   - Check browser console for Socket.IO connection errors
   - Verify environment variables in both frontend and backend
   - Ensure all services are running in the correct order:
     1. Redis
     2. Nginx
     3. Backend cluster
     4. Frontend

7. **Complete Reset**
   If all else fails, stop all services and start fresh:
   ```bash
   # Stop all services
   sudo nginx -s stop
   pkill -f node
   redis-cli shutdown
   
   # Start services in order
   redis-server
   sudo nginx -c /absolute/path/to/backend/nginx.conf
   cd backend && NODE_ENV=production ./start-cluster.sh
   cd ../frontend && NODE_ENV=production npm run build && NODE_ENV=production npm run start
   ```

## License

MIT