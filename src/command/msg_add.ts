import { APIMessage } from 'discord-api-types';
import {
    ApplicationCommandDataResolvable,
    BaseCommandInteraction,
    ButtonInteraction,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    SelectMenuInteraction
} from 'discord.js';
import Command from '../model/command';

export default class implements Command {
    readonly data: ApplicationCommandDataResolvable = {
        name: 'Add to Movie List',
        type: 'MESSAGE'
    };
    readonly componentIds: string[] = [
        'add',
        'cancel',
        'genre'
    ];
    onSelectMenu(interaction: SelectMenuInteraction) {
        interaction.reply('yay');
    }
    onButton(interaction: ButtonInteraction) {

    }
    onInteraction(interaction: BaseCommandInteraction) {
        const message: APIMessage = interaction.options.get('message')?.message! as any;
        if (message.author.bot) {
            interaction.reply({ ephemeral: true, content: 'Cannot add bot message to movie list' });
        } else {
            interaction.reply({
                ephemeral: true,
                content: '```haskell\n' + message.content + '```',
                components: [
                    new MessageActionRow({
                        components: [
                            new MessageSelectMenu({
                                customId: 'genre',
                                placeholder: 'Select a genre',
                                options: [
                                    { label: 'Anime', value: 'anime', description: 'O chin-chin ga daisuki' },
                                    { label: 'Classic', value: 'classic', description: 'Must-have-seen classics' },
                                ]
                            })
                        ]
                    }),
                    new MessageActionRow({
                        components: [
                            new MessageButton({customId: 'add', label: 'Add', style: 'PRIMARY'}),
                            new MessageButton({customId: 'cancel', label: 'Cancel', style: 'DANGER'}),
                        ]
                    })
                ]
            });
        }
    }
}
