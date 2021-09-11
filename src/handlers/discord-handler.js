const { Client, Intents } = require("discord.js"),
    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_PRESENCES,
        ],
    }),
    { Server } = require("socket.io"),
    io = new Server(process.env.DISCORD_PORT);

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

    client.on("presenceUpdate", (data) => {
        io.emit("DISCORD_UPDATE_USERS");
    });

    client.on("voiceStateUpdate", (data) => {
        switch (data.guild.voiceStates.cache.get(data.id).channelID) {
            case null:
                io.emit("DISCORD_UPDATE_USERS");
                break;
            default:
                if (
                    data.guild.voiceStates.cache.get(data.id).selfMute &&
                    data.guild.channels.cache.get(
                        data.guild.voiceStates.cache.get(data.id).channelID
                    ).name !== "On Reddit, Shitting (Not really AFK)"
                ) {
                    if (
                        client.users.cache.get(data.id).username === "Sentinel"
                    ) {
                        data.guild.members.cache
                            .get(data.id)
                            .voice.setChannel(
                                data.guild.channels.cache.find(
                                    (channel) =>
                                        channel.name ===
                                        "On Reddit, Shitting (Not really AFK)"
                                )
                            );

                        const messageChannel = data.guild.channels.cache.find(
                            (channel) => channel.name === "sloots"
                        );

                        messageChannel
                            .send(
                                `${
                                    client.users.cache.get(data.id).username
                                } Muted themselves... again.`
                            )
                            .then((msg) => msg.delete({ timeout: 10000 }))
                            .catch((e) => console.log(e));

                        data.guild.members.cache
                            .get(data.id)
                            .send(
                                "**Steps to reconnect to the Voice Channel:**\n\r    *1. Disconnect from the Voice Channels completely.*\n\r    *2. Unmute yourself.*\n\r    *3. Click the Voice Channel to connect.*"
                            )
                            .catch((e) => console.log(e));
                    }

                    io.emit("DISCORD_UPDATE_USERS");

                    return io.emit("DISCORD_MUTE", {
                        user: client.users.cache.get(data.id).username,
                        channel: data.guild.channels.cache.get(
                            data.guild.voiceStates.cache.get(data.id).channelID
                        ).name,
                    });
                } else {
                    io.emit("DISCORD_UPDATE_USERS");

                    return io.emit("DISCORD_CONNECTED", {
                        user: client.users.cache.get(data.id).username,
                        channel: data.guild.channels.cache.get(
                            data.guild.voiceStates.cache.get(data.id).channelID
                        ).name,
                    });
                }
        }
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
