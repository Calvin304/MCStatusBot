const mc = require('minecraft-protocol');
const Discord = require('discord.js');

module.exports = server => new Promise(resolve => {
    let url = new URL(server.url)
    mc.ping({host: url.hostname, port: url.port || 25565},(err, pingResults) => {
        if (err) {
            const message = new Discord.RichEmbed()
            .setTitle('Status of ' + server.name)
            .setColor("FF0000")
            .setDescription(err);
            resolve(message);
            return;
        };

        const message = new Discord.RichEmbed()
        .setTitle('Status of ' + server.name)
        .setColor("00FF00")
        .setDescription((pingResults.description.text == "")?"":"`" + pingResults.description.text + "`")
        .addField("There " + ((pingResults.players.online === 1)?"is **":"are **") + pingResults.players.online + "/" + pingResults.players.max +"** players online", ((pingResults.players.sample.length > 0?"n/a":"`" + pingResults.players.sample.map(player => player.name).join(", ") + "`"), false)
        .addField("Version", "`" + pingResults.version.name + "`", true);
        if (pingResults.favicon) {message.attachFile({attachment:Buffer.from(pingResults.favicon.replace(/^data:image\/png;base64,/, ''), 'base64'),name:"image.png"}).setThumbnail("attachment://image.png")}
        
        resolve(message);
    })
});
