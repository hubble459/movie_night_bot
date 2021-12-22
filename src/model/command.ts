import { ApplicationCommandDataResolvable, BaseCommandInteraction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';

export default interface Command {
    readonly data: ApplicationCommandDataResolvable;
    readonly componentIds?: string[];

    onInteraction(interaction: BaseCommandInteraction): any;
    onButton?(interaction: ButtonInteraction): any;
    onSelectMenu?(interaction: SelectMenuInteraction): any;
}
