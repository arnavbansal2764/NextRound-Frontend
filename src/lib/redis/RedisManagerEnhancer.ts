import { RedisClientType, createClient } from "redis";
import { ResponseFromAi } from "./types/ResponseFromAI";
import { MessagesToAI } from "./types/MessagesToAI";


export class RedisManager {
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager;
  constructor() {
        this.client = createClient({database: 2});
        this.client.connect();
        this.publisher = createClient({database: 2});
        this.publisher.connect();
  }
  public static getInstance() {
    if (!this.instance)  {
        this.instance = new RedisManager();
    }
    return this.instance;
}
 
public sendAndAwait(message: MessagesToAI) {
    return new Promise<ResponseFromAi>((resolve) => {
        const id = this.getRandomClientId();
        this.client.subscribe(id, (message) => {
            this.client.unsubscribe(id);
            resolve(JSON.parse(message));
        });
        this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
    });
}
 getRandomClientId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
}

