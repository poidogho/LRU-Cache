import { nanoid } from 'nanoid';
import { ClientRepository } from '../dao/repositories/client-repository.js';
import { User } from '../types/user.js';
import { connectDB } from '../dao/repositories/db-client.js';

export class UserService {
  public async AddUser(
    firstname: string,
    surname: string,
    email: string,
    dateOfBirth: Date,
    clientId: string
  ): Promise<boolean> {
    const db = await connectDB();

    if (!firstname || !surname) {
      return false;
    }
    if (!email) {
      return false;
    }

    const users = db.data.users as User[];
    let u: User | null = null;
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        u = users[i];
        break;
      }
    }
    if (u) {
      return false;
    }

    const now = new Date();
    let age = now.getFullYear() - dateOfBirth.getFullYear();

    if (
      now.getMonth() < dateOfBirth.getMonth() ||
      (now.getMonth() === dateOfBirth.getMonth() &&
        now.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    if (age < 21) {
      return false;
    }

    const clientRepository = new ClientRepository();
    const client = await clientRepository.getById(clientId);
    if (!client) {
      console.error('Client not found');
      return false;
    }
    let user: Partial<User> = {
      id: nanoid(),
      client: client,
      dateOfBirth: dateOfBirth,
      email: email,
      firstname: firstname,
      surname: surname,
    };

    if (client.name == 'VeryImportantClient') {
      // Skip credit check
      user.hasCreditLimit = false;
    } else if (client.name == 'ImportantClient') {
      // Do credit check and double credit limit
      user.hasCreditLimit = true;
      user.creditLimit = 10000 * 2;
    } else {
      user.hasCreditLimit = true;
      user.creditLimit = 10000;
    }

    db.data.users.push(user as User);
    await db.write();

    return true;
  }

  public async UpdateUser(user: User): Promise<boolean> {
    if (!user) {
      return false;
    }
    const db = await connectDB();
    const users = db.data.users as User[];
    let u: User | null = null;
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === user.id) {
        u = users[i];
        break;
      }
    }
    if (!u) {
      return false;
    }
    u = user;
    await db.write();
    return true;
  }

  public async GetAllUsers(): Promise<User[]> {
    const db = await connectDB();
    return db.data.users as User[];
  }

  public async GetUserByEmail(email: string): Promise<User | null> {
    const db = await connectDB();
    const users = db.data.users as User[];
    let u: User | null = null;
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        u = users[i];
        break;
      }
    }
    if (!u) {
      return null;
    }
    return u;
  }
}
