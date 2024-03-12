import { dbClient } from './db-client';
import { Client } from '../../types/client.js';

export class ClientRepository {
  public async getById(id: string): Promise<Client | null> {
    const clients = (await dbClient()) as Client[];
    let c: Client | null = null;
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].id === id) {
        c = clients[i];
        break;
      }
    }
    if (!c) {
      return null;
    }
    return {
      id: c.id,
      name: c.name,
    };
  }

  public async getAll(): Promise<Client[]> {
    const databaseClient = await dbClient();
    return databaseClient;
  }
}
