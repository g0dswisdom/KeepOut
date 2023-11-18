import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { blacklist } from '../controllers/webhookProxy';


export const data = new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklists a word for your secured webhook!')
	.addStringOption(option =>
		option.setName('webhook')
			.setDescription("Your secured webhook's hash")
            .setRequired(true))
	.addStringOption(option =>
		option.setName('word')
			.setDescription('The word you want to blacklist')
            .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const webhook: any = interaction.options.get('webhook')?.value;
    const word: any = interaction.options.get('word')?.value;
    try {
        blacklist(webhook, word);
        interaction.reply({content: 'Blacklisted word!', ephemeral: true})
    } catch (err) {
        console.log(err);
    }
}