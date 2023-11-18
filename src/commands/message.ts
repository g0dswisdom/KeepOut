import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import axios, { AxiosResponse } from 'axios';

export const data = new SlashCommandBuilder()
    .setName('message')
    .setDescription('Sends a message to a webhook!')
	.addStringOption(option =>
		option.setName('webhook')
			.setDescription('The Discord webhook')
            .setRequired(true))
	.addStringOption(option =>
		option.setName('content')
			.setDescription('The message you want to send')
            .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const webhook = interaction.options.get('webhook')?.value;
    const content = interaction.options.get('content')?.value;

    await axios({
        method: 'POST',
        url: `${webhook}`,
        data: {
            content: `${content}`,
        }
    }).then((resp) => {
        return interaction.reply({content: `Sent message!`, ephemeral: true});
    }).catch((err) => {
        return interaction.reply({content: 'There was an error trying to send a message to the webhook', ephemeral: true})
    });
}