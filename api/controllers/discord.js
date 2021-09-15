const Discord = require("../../src/handlers/discord-handler");

const { client } = Discord;

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const getActiveChannels = async (GUILD_ALL_CHANNELS) => {
    const LIST_CHANNELS = [];
    GUILD_ALL_CHANNELS.map(async (C) => {
        const CHANNEL = C[1];
        const CHANNEL_NAME = CHANNEL.name;
        const CHANNEL_USERS = [...(await CHANNEL.members)];

        const CHANNEL_DATA = {
            name: CHANNEL_NAME,
            channel: CHANNEL,
            users: CHANNEL_USERS,
        };

        return LIST_CHANNELS.push(CHANNEL_DATA);
    });
    return LIST_CHANNELS;
};

const listDiscord = async (req, res) => {
    const GUILD_ID = client.guilds.cache
        .filter(
            (guild) =>
                guild.name === `#${req.params.channel.toUpperCase()}` ||
                guild.name === `#${req.params.channel}`
        )
        .keys()
        .next().value;

    const GUILD_ITEM = await client.guilds.fetch(GUILD_ID);

    const GUILD_ALL_MEMBERS = GUILD_ITEM.members.cache.filter(
        (member) => member
    );

    const GUILD_ONLINE_MEMBERS = GUILD_ALL_MEMBERS.filter(
        (member) =>
            member.presence &&
            !member.presence.user.bot &&
            member.presence.status !== "offline"
    );

    const GUILD_ALL_CHANNELS = GUILD_ITEM.channels.cache.filter(
        (c) => c.type === "GUILD_VOICE"
    );

    const GUILD_ACTIVE_CHANNELS = await getActiveChannels(GUILD_ALL_CHANNELS);

    return res.json({
        server: GUILD_ITEM,
        users: GUILD_ONLINE_MEMBERS,
        channels: GUILD_ACTIVE_CHANNELS,
    });
};

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getDiscord = (req, res) => listDiscord(req, res);

module.exports = {
    getDiscord,
};
