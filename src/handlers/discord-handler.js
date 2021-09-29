const { Client, Intents } = require("discord.js");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});
const { Server } = require("socket.io");

const io = new Server(process.env.DISCORD_PORT);

const init = () => {
    console.log(
        `[${new Date()}] Launching socket on ${process.env.DISCORD_PORT}`
    );

    client.on("message", (message) => {
        if (message.author.bot) return;

        if (message.content === "ping") {
            message.channel.send("pong");
        }
    });

    client.on("presenceUpdate", () => {
        io.emit("DISCORD_UPDATE_USERS");
    });

    client.on("voiceStateUpdate", (data) => {
        if (data.guild.voiceStates.cache.get(data.id).channelId === null) {
            return io.emit("DISCORD_UPDATE_USERS");
        }

        const channel = data.guild.channels.cache.get(
            data.guild.voiceStates.cache.get(data.id).channelId
        );
        const { name } = channel;

        io.emit("DISCORD_UPDATE_USERS");

        return io.emit("DISCORD_CONNECTED", {
            user: client.users.cache.get(data.id).username,
            channel: name,
        });
    });

    client.login(process.env.DISCORD_KEY).catch((e) => {
        console.log(process.env.DISCORD_KEY);
        console.log(`ERROR: ${e.toString()}`);
    });

    client.on("ready", async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log("Bot initialised!");

        client.user.setActivity("Sitting here and taking it...", {
            type: "PLAYING",
        });
    });
};

module.exports = {
    io,
    client,
    init,
};
