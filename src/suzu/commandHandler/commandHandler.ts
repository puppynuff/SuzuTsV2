//* Importing modules
import Shiro from "shirojs";
import glob from "glob";

//* making the function
async function commandHandler(suzu: Shiro.CommandClient) {
    //* running the commands setup functions.
    const dirname = process.cwd().replaceAll("\\", "/")
    glob(`${dirname}/dist/suzu/commandHandler/messageCommands/**.js`, (err, files) => {
        files.forEach((file) => {
            const command = require(file);
            if (command.setup) command.setup(suzu);
            else console.log(`${file} does not include a setup function!`);
        });
    });

    //* Interaction commands.
    const commands: Array<{
        name: string;
        main: Function;
    }> = [];

    suzu.on("ready", () => {
        //* Getting the commands and adding them to the bot
        glob(`${dirname}/dist/suzu/commandHandler/interactionCommands/**/*.js`, (err, files) => {
            files.forEach((file) => {
                const command = require(file);
                if (command.name && command.description) {
                    suzu.createCommand({
                        name: command.name,
                        description: command.description,
                        options: command.options,
                        type: command.type,
                        defaultPermission: command.defaultPermission
                    });

                    suzu.createGuildCommand("967117817663074304", {
                        name : command.name,
                        description : command.description,
                        options : command.options,
                        type : command.type,
                        defaultPermission : command.defaultPermission
                    })

                    commands.push({
                        name: command.name,
                        main: command.main
                    })
                }
            })
        })
    })

    //* Command handling
    suzu.on("interactionCreate", async (interaction) => {
        if (interaction instanceof Shiro.CommandInteraction) {
            //* Getting the command
            const commandName = interaction.data.name;
            //* Creating the message to edit (Akwnoledging the command)
            await interaction.createMessage("Bot is loading~");

            //* Looking for the command
            for (let i = 0; i < commands.length; i++) {
                //* If the name is the same, give them the command
                if (commands[i].name === commandName.trimEnd()) {
                    try {
                        return await commands[i].main(suzu, interaction);
                    } catch (err) {
                        //* If there was an error, let the client know.
                        return suzu.emit("error", err);
                    }
                }
            }

            //* If the command isnt found
            return interaction.editOriginalMessage("Command not in current version!");
        }
    });
}

export { commandHandler as CommandHandler };