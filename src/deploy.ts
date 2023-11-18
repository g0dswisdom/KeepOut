import { REST, Routes } from 'discord.js';
import { clientId, token } from './config.json';
import { commands } from './commands';

const commandsMap = Object.values(commands).map((command) => command.data);
const rest = new REST().setToken(token);

type deployType = {
    guildId: string;
};

export async function deployCommands({ guildId }: deployType) {
    try {
      console.log("Started refreshing application (/) commands.");
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        {
          body: commandsMap,
        }
      );
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
}