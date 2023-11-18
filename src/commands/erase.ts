import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { deleteWebhook } from '../controllers/webhookProxy';


export const data = new SlashCommandBuilder()
    .setName('erase')
    .setDescription('Deletes a secured webhook. You need to be the owner of it to delete it!')
	.addStringOption(option =>
		option.setName('webhook')
			.setDescription("Your secured webhook's hash")
            .setRequired(true))

export async function execute(interaction: CommandInteraction) {
    const webhook: any = interaction.options.get('webhook')?.value;
    const author = interaction.user.id;
    try {
        await deleteWebhook(webhook, author);
        interaction.reply({content: 'Deleted webhook!', ephemeral: true})
    } catch (err) {
        console.log(err);
    }
}