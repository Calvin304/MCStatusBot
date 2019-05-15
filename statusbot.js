const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
client.login(config.token);
const spawn = require("child_process").spawn;
const fs = require('fs');

fs.access('servers.json', (err) => {
	if (!err) {
		let rawdata = fs.readFileSync('servers.json');  
		let servers = JSON.parse(rawdata);
		return;
	}
	let servers = {"guilds": []}
	fs.writeFileSync('servers.json', JSON.stringify(servers, null, 2));
  });

var name = "";
var guildindex = -1;

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

client.on("guildCreate", guild => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	servers.guilds.push({"name": guild.name, "id" : guild.id,"prefix":"/","role": {"id": null,"name": null},"mcservers": []});
	let data = JSON.stringify(servers, null, 2);
	fs.writeFile('servers.json', data, (err) => {  
		if (err) throw err;
	});
});

client.on("guildUpdate", (oldGuild, newGuild) => {
	if (oldGuild.name !== newGuild.name) {
		console.log('guild ' + oldGuild.name + "changed to " + newGuild.name);
		guildindex = findWithAttr(servers.guilds, "id", oldGuild.id);
		servers.guilds[guildindex].name = newGuild.name;
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
		});
	}
});

client.on("guildDelete", guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	servers.guilds.splice(findWithAttr(servers.guilds, "id", message.guild.id),1)
	let data = JSON.stringify(servers, null, 2);
	fs.writeFile('servers.json', data, (err) => {  
		if (err) throw err;
	});
});

client.on('message', message => {
	if (message.author.bot) return;
	if (message.content.startsWith("/eval ")) {
		if (message.author.id !== config.author.id) {message.channel.send("Only " + config.author.name + " can use this command"); console.log(message.author.username + "(" + message.author.id + ") tried to /eval \"" + message.content.slice("/eval ".length) + "\" in " + message.guild.name + "(" + message.guild.id + ")"); return;}
		let code = message.content.slice("/eval ".length);
		console.log("someone /eval-ed this code ->" + code);
		try {
			let evaled = eval(code);
			if (typeof evaled != "string") evaled = require("util").inspect(evaled);
			message.channel.send("🆗 Evaluated successfully.\n\`\`\`js\n" + evaled + "\`\`\`");
			console.log("/eval was successful, returned ->" + evaled);
			} catch (e) {
			message.channel.send("🆘 Failed to evaluate JavaScript-code.\n\`\`\`fix\n" + clean(e) + "\`\`\`");
			console.log("/eval was unsuccessful, returned ->" + clean(e));
			}
			return;
	}

	if (message.content === "/reloadjson") {
		if (message.author.id !== config.author.id) {message.channel.send("Only " + config.author.name + " can use this command"); return;}
		
		let rawdata = fs.readFileSync('servers.json');  
		let servers = JSON.parse(rawdata);
		console.log('json reloaded');
		message.channel.send("JSON reloaded");
		return;
	}
	
	guildindex = findWithAttr(servers.guilds, "id", message.guild.id)
	
	if (guildindex === -1) {
		message.channel.send("something has gone wrong, restoring from default");
		servers.guilds.push({"name": message.guild.name, "id": message.guild.id,"prefix":"/","role": {"id": null,"name": null},"mcservers": []});
		fs.writeFileSync('servers.json', JSON.stringify(servers, null, 2));
		console.log('guild ' + message.guild.name + '(' + message.guild.id + ') was missing from json and was restored');
		guildindex = findWithAttr(servers.guilds, "id", message.guild.id)
	}

	if (message.isMentioned(client.user) || message.content === servers.guilds[guildindex].prefix + "help") {
		message.channel.send("My Current Prefix is `" + servers.guilds[guildindex].prefix + "`\nCommands: `" + servers.guilds[guildindex].prefix + "setrole`, `" + servers.guilds[guildindex].prefix + "setprefix`, `" + servers.guilds[guildindex].prefix + "addserver`, `" + servers.guilds[guildindex].prefix + "deleteserver`, `" + servers.guilds[guildindex].prefix + "serverproperties`, `" + servers.guilds[guildindex].prefix + "listservers`, `" + servers.guilds[guildindex].prefix + "editserver`, and custom commands to check the status' of servers.");
	}
	
	if(message.content.indexOf(servers.guilds[guildindex].prefix) !== 0) return;
	
	const args = message.content.slice(servers.guilds[guildindex].prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if (command === "setrole") {
		if (!(message.author.id === config.author.id || message.member.hasPermission("ADMINISTRATOR"))) {message.channel.send("Only Administrators can use this command"); return;}
		if (args.length < 1) {
			message.channel.send("allowing everyone to use reserved commands, if this is a mistake, make sure to mention a role.");
			servers.guilds[guildindex].role = {"id":null,"name":null}
			console.log('role set to null in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			return;
		}
		servers.guilds[guildindex].role = message.mentions.roles.first()
		message.channel.send("allowing " + servers.guilds[guildindex].role.name + " to use reserved commands");
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
			console.log('role set to ' + servers.guilds[guildindex].role.name + ' in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
		});
	}
	
	if (command === "setprefix") {
		if (!(message.author.id === config.author.id || message.member.hasPermission("ADMINISTRATOR"))) {message.channel.send("Only Administrators can use this command"); return;}
		if (args.length < 1 || args.length > 1) {
			message.channel.send("usage: " + servers.guilds[guildindex].prefix + "setprefix <prefix>");
			return;
		}
		servers.guilds[guildindex].prefix = args[0];
		message.channel.send("Setting prefix to `" + servers.guilds[guildindex].prefix + "`");
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
			console.log('Prefix Changed to "' + servers.guilds[guildindex].prefix + '" for ' + message.guild.name + ' (id: ' + message.guild.id + ')');
		});
	}
	
	if (command === "addserver") {
		if (servers.guilds[guildindex].role.id !== null && !(message.member.roles.has(servers.guilds[guildindex].role.id))) {message.channel.send("Only people with " + servers.guilds[guildindex].role.name + " can use this command"); return;}
		if (args.length < 5) {
			message.channel.send("Usage: " + servers.guilds[guildindex].prefix + "addserver <name> <ip/url> <port (write 25565 if no port)> <color as hex> <command1> <command2> ...");
			return;
		}
		var cmds = args.splice(4,args.length - 4);
		var newserver = {"name": args[0],"commands": cmds,"address": {"ip": args[1],"port": args[2]},"color": args[3]}
		servers.guilds[guildindex].mcservers.push(newserver)
		
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
			console.log('New server ' + newserver.name + 'added to ' + message.guild.name + ' (id: ' + message.guild.id + ')');
		});
		message.channel.send("Server added with name of "+ newserver.name)
		return;
	}
	
	if (command === "deleteserver") {
		if (servers.guilds[guildindex].role.id !== null && !(message.member.roles.has(servers.guilds[guildindex].role.id))) {message.channel.send("Only people with " + servers.guilds[guildindex].role.name + " can use this command"); return;}
		if (args.length < 1) {
			message.channel.send("Usage: " + servers.guilds[guildindex].prefix + "deleteserver <name>");
			return;
		}
		
		servers.guilds[guildindex].mcservers.splice(findWithAttr(servers.guilds[guildindex].mcservers, "name", args[0]),1);
		
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
			console.log("Deleted Server " + args[0] + ' in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
		});
		
		message.channel.send("Deleted Server " + args[0])
		return;
	}
	
	if (command === "serverproperties") {
		if (args.length < 1) {
			message.channel.send("Usage: " + servers.guilds[guildindex].prefix + "serverproperties <name>");
			return;
		}
		
		var name = args.join(" ");
		
		for (var i = 0; i < servers.guilds[guildindex].mcservers.length; i++) {
			if (servers.guilds[guildindex].mcservers[i].name === name) {
				message.channel.send("Server: `" + servers.guilds[guildindex].mcservers[i].name + "`\nIp/Url: `" + servers.guilds[guildindex].mcservers[i].address.ip + "`\nPort: `" + servers.guilds[guildindex].mcservers[i].address.port + "`\nColor: `" + servers.guilds[guildindex].mcservers[i].color + "`\nCommand(s): `" + servers.guilds[guildindex].prefix + servers.guilds[guildindex].mcservers[i].commands.join(" " + servers.guilds[guildindex].prefix + "") + "`")
				return;
			}
		}
		message.channel.send("please enter a valid server name")
		return;
	}
	
	if (command === "listservers") {
		var servernamelist = []
		for (var i = 0; i < servers.guilds[guildindex].mcservers.length; i++) {
		servernamelist.push(servers.guilds[guildindex].mcservers[i].name)
		}

		const embed = new Discord.RichEmbed()
		.setTitle("Servers:")
		.setColor("FFFFFF")
		.setDescription("```" + servernamelist.join("\n") + "```\nuse " + servers.guilds[guildindex].prefix + "serverproperties <name> to get more info about a server");
		message.channel.send(embed);
		return;
		
	}
	
	if (command === "editserver") {
		if (servers.guilds[guildindex].role.id !== null && !(message.member.roles.has(servers.guilds[guildindex].role.id))) {message.channel.send("Only people with " + servers.guilds[guildindex].role.name + " can use this command"); return;}
		
		if (args.length < 3) {
			message.channel.send("Usage: " + servers.guilds[guildindex].prefix + "editserver <server> [name, ip, port, color, command(s)] <value1> <value2>");
			return;
		}
		
		serverindex = findWithAttr(servers.guilds[guildindex].mcservers, "name", args[0]);
		
		if (args[1] === "name") {
			if (args.length > 3) {
			message.channel.send("attribute `name` can only have one value");
			return;
			}
			
			servers.guilds[guildindex].mcservers[serverindex].name = args[2];
			
			message.channel.send("server `" + args[0] + "` was renamed to `" + args[2] + "`");
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			return;
		}
		
		if (args[1] === "ip") {
			if (args.length > 3) {
			message.channel.send("attribute `ip` can only have one value");
			return;
			}
			
			servers.guilds[guildindex].mcservers[serverindex].address.ip = args[2];
			
			message.channel.send("server attribute `" + args[1] + "` was changed to `" + args[2] + "`");
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			return;
		}
		
		if (args[1] === "port") {
			if (args.length > 3) {
			message.channel.send("attribute `name` can only have one value");
			return;
			}
			
			servers.guilds[guildindex].mcservers[serverindex].address.port = args[2];
			
			message.channel.send("server attribute `" + args[1] + "` was changed to `" + args[2] + "`");
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			return;
		}
		
		if (args[1] === "color") {
			if (args.length > 3) {
			message.channel.send("attribute `color` can only have one value");
			return;
			}
			
			servers.guilds[guildindex].mcservers[serverindex].color = args[2];
			
			message.channel.send("server attribute `" + args[1] + "` was changed to `" + args[2] + "`");
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			return;
		}
		
		if (args[1] === "command(s)") {
			var cmds = args.splice(2,args.length - 2);
			
			servers.guilds[guildindex].mcservers[serverindex].commands = cmds
			
			message.channel.send("server attribute `" + args[1] + "` was changed to `" + servers.guilds[guildindex].prefix + "" + cmds.join(" " + servers.guilds[guildindex].prefix + "") + "`");
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			return;
		}
		
		message.channel.send("please enter a valid server name and/or attribute")
		return;
	}
	
	//for loop checking if message matches any mcservers.commands
	for (var i = 0; i < servers.guilds[guildindex].mcservers.length; i++) {
		if (servers.guilds[guildindex].mcservers[i].commands.includes(command)) {
			server = servers.guilds[guildindex].mcservers[i]
			var process = spawn('python3',["./getstatus.py3",server.address.ip,server.address.port]);
			process.stdout.on('data', (data) => {
				const embed = new Discord.RichEmbed()
				.setTitle('Status of ' + server.name)
				.setColor(server.color)
				.setDescription(data.toString());
				message.channel.send(embed);
			});
			process.stderr.on('data', (data) => {
				console.log(data.toString());
			});
		}
	}
	
});
