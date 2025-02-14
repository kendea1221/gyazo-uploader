// main.ts

import { Client, GatewayIntentBits, Partials, Events, ActivityType } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

import messages from './messages.json';
import format from './format';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.User,
  ],
});

// Botが起動した時の処理
client.once(Events.ClientReady, async (c) => {
    console.log(format(messages.boot.message,messages.boot.bot))
    if (client.user) {
      client.user.setActivity({
        name: messages.boot.activity,
        type: ActivityType.Watching
      });
    }
});

// Upload to Gyazo
async function uploadToGyazo(imageUrl: string, accessToken: string) {
  try {

    console.log(format(messages.gyazo.downloadImage,imageUrl));

    // Download image as tmp file
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Save tmp file
    const ext = path.extname(imageUrl) || '.jpg';
    const tempFilePath = `temp${ext}`;
    fs.writeFileSync(tempFilePath, imageBuffer);

    console.log(format(messages.gyazo.doanloadedImage,tempFilePath));

    // Create form data
    const form = new FormData();
    form.append('access_token', accessToken);
    form.append('imagedata', fs.createReadStream(tempFilePath));

    // Upload to Gyazo
    const response = await axios.post('https://upload.gyazo.com/api/upload', form, {
      headers: form.getHeaders(),
    });

    // Delete tmp file
    fs.unlinkSync(tempFilePath);

    if (response.data && response.data.permalink_url) {
      console.log(format(messages.gyazo.uploadImageSuc,response.data.permalink_url));
      return response.data.permalink_url;
    } else {
      console.log(messages.gyazo.uploadImageFail);
      return null;
    }
  } catch (error: any) {
    console.error('Error uploading to Gyazo:', error.response?.data || error.message);
    return null;
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === process.env.CHANNEL_ID) {
    try {
      if (message.attachments.size > 0) {
        const imageUrl = message.attachments.first()?.url;
        if (imageUrl) {
          console.log(format(messages.gyazo.imageUrl,imageUrl));

          const gyazoUrl = await uploadToGyazo(imageUrl, process.env.GYAZO_ACCESS_TOKEN!);
          if (gyazoUrl) {
            await message.channel.send(format(messages.gyazo.uploadImageDone,gyazoUrl));
          } else {
            await message.channel.send(messages.gyazo.uploadImageFail);
          }
        }
      } else {
        await message.channel.send(messages.gyazo.uploadImageNtDone);
      }
    } catch (error) {
      console.error(error);
    }
  }
});

// Botのログイン
client.login(process.env.TOKEN);
