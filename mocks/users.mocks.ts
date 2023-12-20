import { Connect } from "../config";
import { faker } from "@faker-js/faker";
import Users from "../models/users";

export function createRandomUser() {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phoneNumber: faker.string.numeric({ length: { min: 11, max: 11 } }),
  };
}

async function MockUpUsers() {
  await Connect();
  const USERS = faker.helpers.multiple(createRandomUser, {
    count: 100,
  });

  await Users.insertMany(USERS);
  console.log("Done");
}

MockUpUsers();
