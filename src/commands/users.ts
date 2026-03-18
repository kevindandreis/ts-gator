import { setUser, readConfig } from "../config";
import { createUser, getUser, deleteAllUsers, getUsers } from "../lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUser(userName);
  if (!existingUser) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(existingUser.name);
  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const user = await createUser(userName);
  if (!user) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(user.name);
  console.log("User created successfully!");
}

export async function handlerReset(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  try {
    await deleteAllUsers();
    console.log("All users deleted successfully!");
  } catch (error) {
    console.error("Failed to delete users:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  try {
    const config = readConfig();
    const allUsers = await getUsers();
    
    allUsers.forEach(user => {
      const isCurrentUser = user.name === config.currentUserName;
      const suffix = isCurrentUser ? " (current)" : "";
      console.log(`* ${user.name}${suffix}`);
    });
  } catch (error) {
    console.error("Failed to get users:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
