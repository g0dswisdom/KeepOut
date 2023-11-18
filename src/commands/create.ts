import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { url } from '../config.json'

export const data = new SlashCommandBuilder()
    .setName('create')
    .setDescription('Creates a webhook and secures it!')
    .addStringOption(option =>
        option.setName('webhook')
            .setDescription('Your Discord webhook')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('blockmentions')
            .setDescription('Block mentions?')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('logactions')
            .setDescription('Log restricted actions in DMs?')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('blockinvites')
            .setDescription('Block invites?')
            .setRequired(true))

export async function execute(interaction: CommandInteraction) {
    const webhook = interaction.options.get('webhook')?.value;
    const blockMentions = interaction.options.get('blockmentions')?.value;
    const logActions = interaction.options.get('logactions')?.value;
    const blockInvites = interaction.options.get('blockinvites')?.value;
    await axios({
        method: 'POST',
        url: `${url}/new`,
        data: {
            'url': webhook,
            'config': {
                'blockMentions': blockMentions,
                'logRestrictedActions': logActions,
                'blockInvites': blockInvites
            },
            'owner': interaction.user.id
        }
    }).then((resp) => {
        let hash = resp.data.hash;
        return interaction.reply({content: `${url}/send?hash=${hash}`, ephemeral: true});
    }).catch((err) => {
        return interaction.reply({content: 'There was an error trying to secure your webhook', ephemeral: true})
    });
}