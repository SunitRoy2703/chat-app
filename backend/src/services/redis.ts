import Redis from 'ioredis';
import { environment } from '../config';

class RedisService {
  public publisher: Redis;
  public subscriber: Redis;
  private static instance: RedisService;

  private constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
    this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private getOnlineUsersKey(): string {
    return 'chat:online_users';
  }

  public async addOnlineUser(socketId: string, name: string): Promise<void> {
    await this.publisher.hset(this.getOnlineUsersKey(), socketId, name);
  }

  public async removeOnlineUser(socketId: string): Promise<void> {
    await this.publisher.hdel(this.getOnlineUsersKey(), socketId);
  }

  public async getOnlineUsersCount(): Promise<number> {
    return await this.publisher.hlen(this.getOnlineUsersKey());
  }

  public async getAllOnlineUsers(): Promise<Record<string, string>> {
    const users = await this.publisher.hgetall(this.getOnlineUsersKey());
    return users || {};
  }
}

export const RedisClient = RedisService.getInstance(); 