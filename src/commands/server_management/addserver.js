const commando = require('discord.js-commando');

module.exports = class status extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'addserver',
            group: "server_management",
            memberName: 'addserver',
            description: 'adds a server to status',
            aliases: [
                "add"
            ],
            format: "<name> <url:port> [aliases]",
            examples: [
                "addserver hypixel mc.hypixel.net hy",
            ],
            throttling: {
                usages: 1,
                duration: 3,
            },
            guildOnly: true,
            args: [
				{
					key: 'name',
					prompt: 'name',
                    type: 'string',
                    async validate(val, msg) {
                        let servers = JSON.parse(await msg.guild.settings.get("servers", "[]"));
                        if (servers.some(server => server.name === val || server.alias.includes(val))) return "name in use"
                        return true
                    }
                },
                {
                    key: "url",
                    prompt: "ip/url",
                    type: "serverurl"
                },
                {
                    key: "alias",
                    prompt: "allows /status <alias>", 
                    type: "string",
                    default: '',
                    infinite: true,
                    async validate(val, msg) {
                        let servers = JSON.parse(await msg.guild.settings.get("servers", "[]"));
                        if (servers.some(server => server.name === val || server.alias.includes(val))) return "alias in use"
                        return true
                    }
                }
            ]
        });
    }

    async hasPermission(msg) {
        let roleid = await msg.guild.settings.get("role")
        return msg.member.hasPermission("MANAGE_GUILD") || msg.member.roles.has(roleid) || msg.client.owners.some(owner => owner.id === msg.member.id)
    }

    async run(msg, args) {
        let server = {"name":args.name,"url":args.url.url,"alias":args.alias};
        let servers = JSON.parse(await msg.guild.settings.get("servers", "[]"));
        servers.push(server);
        msg.guild.settings.set("servers",JSON.stringify(servers));
        return msg.channel.send("server created: " + server.name);
    }


}