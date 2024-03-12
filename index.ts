import { UserService } from './src/services/user-service.js';

async function main() {
  const userService = new UserService();

  // Add some users
  await userService.AddUser(
    'John',
    'Doe',
    'John.doe@gmail.com',
    new Date(1993, 1, 1),
    'eyn4ZBhZgIBRhvEcYGYyj'
  );
  await userService.AddUser(
    'Jane',
    'Doe',
    'Jane.doe@gmail.com',
    new Date(1993, 1, 1),
    'nkn4ZBhLApBRhvEcYGYxi'
  );

  const users = await userService.GetAllUsers();
  console.log(users);

  const user = await userService.GetUserByEmail('Jane.doe@gmail.com');
  if (!user) throw new Error('User not found');

  // Update user
  await userService.UpdateUser({ ...user, firstname: 'Jane2' });
  const refreshedUsers = await userService.GetAllUsers();
  console.log(refreshedUsers);
}

main();
