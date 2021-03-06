const commando = require('discord.js-commando');
const ping = require("../../ping.js");

module.exports = class status extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'status',
            group: 'main',
            memberName: 'status',
            description: 'Gets Status of a Minecraft Server',
            format: "<name|alias|url>",
            aliases: [
                "s"
            ],
            examples: [
                "status mc.hypixel.net",
                "status hy",
            ],
            throttling: {
                usages: 4,
                duration: 30,
            },
            args: [
				{
					key: 'server_resolvable',
					label: 'server resolvable',
					prompt: 'server name or alias or url',
					type: 'server|serverurl'
				}
			]
        });
    }

    async run(msg, args) {
        let res = await ping(args.server_resolvable)
        return msg.channel.send(res);
    }


}