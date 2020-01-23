const commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class listservers extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'listservers',
            group: 'server_information',
            memberName: 'listservers',
            description: 'Lists Servers Defined by addserver',
            format: "listservers",
            aliases: [
                "servers",
                "listserver"
            ],
            examples: [
                "listservers",
            ],
            throttling: {
                usages: 1,
                duration: 30,
            },
            guildOnly: true,
        });
    }

    async run(msg) {
        let servers = JSON.parse(msg.guild.settings.get("servers") || "[]");
        let embed = new Discord.RichEmbed()
        .setTitle("Servers in " + msg.guild.name)
        servers.forEach(server => {
            embed.addField(server.name, "url: " + new URL(server.url).host + " aliases: " + server.alias.join(" "))
        });
        return msg.channel.send(embed);
    }


}