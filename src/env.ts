// env.ts

import dotenv from 'dotenv';

dotenv.config();

export function TOKEN(): string {
  if (process.env.TOKEN) {
    return process.env.TOKEN;
  } else {
    throw new Error('TOKEN is undefined.');
  }
}

export function GYAZO_ACCESS_TOKEN(): string {
  if (process.env.GYAZO_ACCESS_TOKEN) {
    return process.env.GYAZO_ACCESS_TOKEN;
  } else {
    throw new Error('GYAZO_ACCESS_TOKEN is undefined.');
  }
}

export function CHANNEL_ID(): string {
  if (process.env.CHANNEL_ID) {
    return process.env.CHANNEL_ID;
  } else {
    throw new Error('CHANNEL_ID is undefined.');
  }
}