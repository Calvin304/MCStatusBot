const mc = require('minecraft-protocol');
const Discord = require('discord.js');

module.exports = function (server, callback) {
    mc.ping({"host":server.address.ip,"port":server.address.port},(err, pingResults) => {
        if (err) {
            const message = new Discord.RichEmbed()
            .setTitle('Status of ' + server.name)
            .setColor("FF0000")
            .setDescription(err);
            callback(null, message);
            return;
        };

        if (pingResults.favicon != undefined) {
            const message = new Discord.RichEmbed()
            .setTitle('Status of ' + server.name)
            .setColor("00FF00")
            .attachFile({attachment:Buffer.from(pingResults.favicon.replace(/^data:image\/png;base64,/, ''), 'base64'),name:"image.png"})
            .setThumbnail("attachment://image.png")
            .setDescription( (pingResults.description.text == "")?"":"`" + pingResults.description.text + "`")
            .addField("There " + ((pingResults.players.online === 1)?"is **":"are **") + pingResults.players.online + "/" + pingResults.players.max +"** players online", ((pingResults.players.sample == undefined)?"n/a":"`" + pingResults.players.sample.map(player => player.name).join(", ") + "`"), false)
            .addField("Version", "`" + pingResults.version.name + "`", true)
            ;callback(null, message);
            return;
        };
        const message = new Discord.RichEmbed()
        .setTitle('Status of ' + server.name)
        .setColor("00FF00")
        .setDescription( (pingResults.description.text == "")?"":"`" + pingResults.description.text + "`")
        .addField("There " + ((pingResults.players.online === 1)?"is **":"are **") + pingResults.players.online + "/" + pingResults.players.max +"** players online", ((pingResults.players.sample == undefined)?"n/a":"`" + pingResults.players.sample.map(player => player.name).join(", ") + "`"), false)
        .addField("Version", "`" + pingResults.version.name + "`", true)
        ;callback(null, message);
        return;
    })
};