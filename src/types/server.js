const commando = require('discord.js-commando');

module.exports = class server extends commando.ArgumentType {
    constructor(client) {
		super(client, 'server');
    }

    async validate(val, msg) {
        if (msg.channel.type === "dm" || msg.channel.type === "group") return "must be used in a guild"
        let servers = JSON.parse(await msg.guild.settings.get("servers", "[]"));
        let server = servers.find(server => server.name === val || server.alias.includes(val))
        if (server == undefined) {return "server doesnt exist";};
        return !!server.name && !!server.url
    }
    
    async parse(val, msg) {
        let servers = JSON.parse(await msg.guild.settings.get("servers", "[]"));
        return servers.find(server => server.name === val || server.alias.includes(val))
    }
}

/**
 * servers = [server]
 */

/* 
let servers = JSON.parse(guildsettings.get("servers"))
guildsettings.set("servers",JSON.stringify(servers))
*/

/**
 * 
 * server = {
 *  name: 'test',
 *  alias: ['testing','t']
 *  url: "minecraft://hostname:port"
 * }
 */