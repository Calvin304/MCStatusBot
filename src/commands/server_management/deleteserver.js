const commando = require('discord.js-commando');

module.exports = class deleteserver extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'deleteserver',
            group: 'server_management',
            memberName: 'deleteserver',
            description: 'Gets Status of a Minecraft Server',
            format: "<name>",
            aliases: [
                "removeserver",
                "delete",
                "remove"
            ],
            examples: [
                "deleteserver hypixel",
            ],
            throttling: {
                usages: 1,
                duration: 30,
            },
            guildOnly: true,
            args: [
				{
					key: 'server',
					prompt: 'server name',
					type: 'server'
				}
			]
        });
    }

    hasPermission(msg) {
        let roleid = msg.guild.settings.get("role")
        return msg.member.hasPermission("MANAGE_GUILD") || msg.member.roles.has(roleid)  || msg.client.owners.some(owner => owner.id === msg.member.id)
    }

    async run(msg, args) {
        let servers = JSON.parse(msg.guild.settings.get("servers") || "[]");
        servers.splice(servers.findIndex(value => value === args.server),1)
        msg.guild.settings.set("servers", JSON.stringify(servers));
        return msg.channel.send("deleted server: " + JSON.stringify(args.server.name));
    }


}
