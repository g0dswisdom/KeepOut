import { token, guildId } from './config.json';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { deployCommands } from './deploy';
import { commands } from './commands';
import express from 'express';
import { post_create, post_message } from './controllers/webhookProxy';

const app = express();
app.use(express.json());

app.post('/new', post_create);
app.post('/send', post_message)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

client.once(Events.ClientReady, async (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    await deployCommands({
        guildId: guildId
    })
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    if (commands[interaction.commandName as keyof typeof commands]) {
        commands[interaction.commandName as keyof typeof commands].execute(interaction);
    }
})

export async function dmUser(userId: string, message: any) {
    try {
        let user = await client.users.fetch(userId);
        await user.send(message);
    } catch (err) {
        console.log(err);
    }
}

app.listen(3000, () => {
    console.log('App is ready');
})


client.login(token);