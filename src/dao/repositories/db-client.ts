import { JSONFilePreset } from 'lowdb/node';
import { Client } from '../../types/client.js';

export async function connectDB() {
  const db = await JSONFilePreset('db.json', {
    clients: [],
    users: [],
  });
  return db;
}

export async function dbClient() {
  const db = await connectDB();
  const clients = db.data.clients as Client[];
  return clients;
}
