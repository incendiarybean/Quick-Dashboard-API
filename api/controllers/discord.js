const Discord = require("../../src/handlers/discord-handler");

const { client } = Discord;

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const getActiveChannels = async (guildAllChannels, guildUsers) => {
    const listChannels = [];
    guildAllChannels.map(async (C) => {
        const channel = C;
        const channelName = channel.name;
        const channelUsers = [...guildUsers];
        const members = await channel.members;
        const userIds = members.map((member) => member.user.id);

        const channelData = {
            name: channelName,
            channel,
            users: channelUsers.filter((user) => userIds.includes(user.id)),
        };

        return listChannels.push(channelData);
    });
    return listChannels;
};

const listDiscord = async (req, res) => {
    const guildId = client.guilds.cache
        .filter(
            (guild) =>
                guild.name === `#${req.params.channel.toUpperCase()}` ||
                guild.name === `#${req.params.channel}`
        )
        .keys()
        .next().value;

    const server = await client.guilds.fetch(guildId);

    const guildAllMembers = await server.members.cache.filter(
        (member) => member
    );

    const guildOnlineMembers = guildAllMembers.filter(
        (member) =>
            member.presence &&
            !member.presence.user.bot &&
            member.presence.status !== "offline"
    );

    const users = await guildOnlineMembers.map((member) => {
        const memberDetails = server.members.cache.get(member.user.id).user;
        const user = {
            nickname: member.nickname,
            ...memberDetails,
            avatarUrl: memberDetails.avatar
                ? `https://cdn.discordapp.com/avatars/${member.user.id}/${memberDetails.avatar}.webp`
                : "https://cdn.discordapp.com/embed/avatars/0.png",
        };
        return user;
    });

    const guildAllChannels = server.channels.cache.filter(
        (c) => c.type === "GUILD_VOICE"
    );

    const channels = await getActiveChannels(guildAllChannels, users);

    return res.json({
        server,
        users,
        channels,
    });
};

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getDiscord = (req, res) => listDiscord(req, res);

module.exports = {
    getDiscord,
};
