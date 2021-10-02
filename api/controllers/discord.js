const Discord = require("../../src/handlers/discord-handler");

const { client } = Discord;

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const generateUserDetails = async (userList, server) =>
    userList.map((member) => {
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

const getActiveChannels = async (channelList, server) => {
    const listChannels = [];
    await channelList.map(async (voiceChannel) => {
        const channel = voiceChannel;
        const { name } = channel;
        const users = await generateUserDetails(channel.members, server);

        const channelData = {
            name,
            channel,
            users,
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

    const guildOnlineMembers = await server.members.cache.filter(
        (member) =>
            member.presence &&
            !member.presence.user.bot &&
            member.presence.status !== "offline"
    );

    const users = await generateUserDetails(guildOnlineMembers, server);

    const guildAllChannels = await server.channels.cache.filter(
        (c) => c.type === "GUILD_VOICE"
    );

    const channels = await getActiveChannels(guildAllChannels, server);

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
