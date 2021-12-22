import { ApplicationCommandDataResolvable, BaseCommandInteraction } from 'discord.js';
import Command from '../model/command';

export default class implements Command {
    readonly data: ApplicationCommandDataResolvable = {
        name: 'add',
        description: 'Add to Movie List',
        type: 'CHAT_INPUT',
        options: [
            {
                name: 'title',
                description: 'Movie Title',
                type: 'STRING',
                required: true
            },
            {
                name: 'url',
                description: 'Movie URL',
                type: 'STRING',
                required: false
            },
            {
                name: 'tags',
                description: 'Tags delimited by ;',
                type: 'STRING',
                required: false
            }
        ]
    };
    onInteraction(interaction: BaseCommandInteraction) {
        interaction.reply('wip');
    }
}
