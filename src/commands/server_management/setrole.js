const commando = require('discord.js-commando');

module.exports = class deleteserver extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'setrole',
            group: 'server_management',
            memberName: 'role',
            description: 'allows role to use server management commands',
            format: "<role resolvable>",
            aliases: [
                "role"
            ],
            examples: [
                "role MOD",
                "role 222089067028807682" //roleid of mod in djs discord :)
            ],
            throttling: {
                usages: 1,
                duration: 30,
            },
            guildOnly: true,
            args: [
				{
					key: 'role',
					prompt: 'role resolvable',
					type: 'role'
				}
			]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission("MANAGE_GUILD") || msg.client.owners.some(owner => owner.id === msg.member.id)
    }

    async run(msg, args) {
        msg.guild.settings.set("role",args.role.id);
        return msg.channel.send("role set: " + args.role.name);
    }


}



/*
let roleid = msg.guild.settings.get("role")
msg.guild.settings.set("role", roleid)
*/