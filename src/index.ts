import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import glob from 'glob';
import { CacheType, Client, Collection, Interaction } from 'discord.js';
import { config } from 'dotenv';
import Command from './model/command';
config();

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.TEST_GUILD_ID;

class MovieNight extends Client {
    private readonly commands: Collection<string, Command> = new Collection();
    private readonly clientId: string;
    private readonly guildId: string;
    private readonly restV9: REST;

    constructor(token: string, clientId: string, guildId: string) {
        super({ intents: [] });
        this.clientId = clientId;
        this.guildId = guildId;
        this.restV9 = new REST({ version: '9' }).setToken(token);
        this.on('ready', () => {
            console.log('Logged in');
            this.setupCommands();
        });
        this.on('interactionCreate', this.interaction.bind(this));
    }

    async clearCommands() {
        const appCommands = (await this.restV9.get(Routes.applicationCommands(this.clientId))) as any;
        const promises = [];
        for (const command of appCommands) {
            const deleteUrl = Routes.applicationCommand(this.clientId, command.id);
            promises.push(this.restV9.delete(deleteUrl));
        }

        if (this.guildId) {
            const appGuildCommands = (await this.restV9.get(
                Routes.applicationGuildCommands(this.clientId, this.guildId)
            )) as any;

            for (const command of appGuildCommands) {
                const deleteUrl = Routes.applicationGuildCommand(this.clientId, this.guildId, command.id);
                promises.push(this.restV9.delete(deleteUrl));
            }
        }

        return Promise.all(promises);
    }

    async setupCommands() {
        if (!this.application) {
            console.error('Client does not have an application');
            return;
        }

        // await this.clearCommands();
        // console.log('Cleared all commands');

        const filepaths = glob.sync(`${__dirname}/command/**/*.${process.env.TS_NODE_DEV ? 't' : 'j'}s`, {
            absolute: true
        });
        let failed = 0;
        const promises: Promise<any>[] = [];
        for (const filepath of filepaths) {
            let ctx = require(filepath);
            if (!!ctx.default) {
                ctx = ctx.default;
            }
            if (typeof ctx !== 'function' && !ctx.name) {
                ctx = Object.values(ctx)[0];
            }
            if (typeof ctx === 'function') {
                ctx = new ctx(this);
            }
            if (this.commandHasAllProperties(ctx)) {
                this.commands.set(ctx.data.name, ctx);
                if (this.guildId) {
                    promises.push(
                        this.application.commands.create(ctx.data, this.guildId).catch((e) => {
                            failed++;
                            console.error(filepath, e, ctx);
                        })
                    );
                } else {
                    promises.push(
                        this.application.commands.create(ctx.data).catch((e) => {
                            failed++;
                            console.error(filepath, e, ctx);
                        })
                    );
                }
            } else {
                failed++;
                console.error(filepath, 'missing properties', ctx);
            }
        }
        await Promise.all(promises);
        const amount = filepaths.length - failed;
        console.info(`${amount} command${amount !== 1 ? 's' : ''} loaded${!!failed ? `, ${failed} failed` : ''}`);
    }

    commandHasAllProperties(command: Command): command is Command {
        return !!command.data && !!command.onInteraction;
    }

    async interaction(interaction: Interaction) {
        if (interaction.isApplicationCommand()) {
            const command = this.commands.get(interaction.commandName);
            command?.onInteraction(interaction);
        } else if (interaction.isSelectMenu() || interaction.isButton()) {
            const id = interaction.customId;
            const command = this.commands.find(c => !!c.componentIds?.includes(id));
            if (!!command) {
                if (interaction.isSelectMenu() && !!command.onSelectMenu) {
                    command.onSelectMenu(interaction);
                } else if (interaction.isButton() && !!command.onButton) {
                    command.onButton(interaction);
                }
            }
        }
    }
}

if (token && clientId && guildId) {
    const client = new MovieNight(token, clientId, guildId);
    client.login(token);
} else {
    console.error('Missing environment variables');
}
