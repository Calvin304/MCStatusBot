const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
client.login(config.token);
const fs = require('fs');
const FastMap = require("collections/fast-map.js");
const ping = require("./ping.js");


let rawdata = fs.readFileSync('servers.json');  
servers = JSON.parse(rawdata);
servers.guilds = new FastMap(servers.guilds)

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

function base64ToPNG(data) {
	data = data.replace(/^data:image\/png;base64,/, '');
	fs.writeFileSync('image.png', data, 'base64');
}

client.on("guildCreate", guild => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	servers.guilds.set(guild.id, {"name": guild.name, "id" : guild.id,"prefix":"/","role": {"id": null,"name": null},"mcservers": []});
	let data = JSON.stringify(servers, null, 2);
	fs.writeFile('servers.json', data, (err) => {  
		if (err) throw err;
	});
});

client.on("guildUpdate", (oldGuild, newGuild) => {
	if (oldGuild.name !== newGuild.name) {
		console.log('guild ' + oldGuild.name + " changed to " + newGuild.name);
		servers.guilds.get(oldGuild.id).name = newGuild.name;
		let data = JSON.stringify(servers, null, 2);
		fs.writeFile('servers.json', data, (err) => {  
			if (err) throw err;
		});
	}
});

client.on("guildDelete", guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	servers.guilds.splice(servers.guilds.findIndex(guild => guild.id === message.guild.id),1)
	let data = JSON.stringify(servers, null, 2);
	fs.writeFile('servers.json', data, (err) => {  
		if (err) throw err;
	});
});

client.on('error', error => console.error);

client.on('message', message => {
	if (message.author.bot) return;
	if (message.content.startsWith("/eval ")) {
		if (message.author.id !== config.author.id) {message.channel.send("Only " + config.author.name + " can use this command"); console.log(message.author.username + "(" + message.author.id + ") tried to /eval \"" + message.content.slice("/eval ".length) + "\" in " + message.guild.name + "(" + message.guild.id + ")"); return;}
		let code = message.content.slice("/eval ".length);
		console.log("someone /eval-ed this code ->" + code);
		try {
			let evaled = eval(code);
			if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
			message.channel.send("🆗 Evaluated successfully. (response length = " + evaled.length + ")");
			for (let i = 0; i < Math.ceil(evaled.length / 1975); i++) {
				message.channel.send("`\`\`js\n" + evaled.slice((1975 * i),((1975 + 1975 * i) < evaled.length)?(1975 + 1975 * i):(evaled.length)) + "\`\`\`");
			}
			console.log("/eval was successful, returned ->" + evaled);
		} catch (e) {
			let evaled = clean(e);
			message.channel.send("🆘 Failed to evaluate JavaScript-code. (response length = " + evaled.length + ")");
			for (let i = 0; i < Math.ceil(evaled.length / 1975); i++) {
				message.channel.send("`\`\`js\n" + evaled.slice((1975 * i),((1975 + 1975 * i) < evaled.length)?(1975 + 1975 * i):(evaled.length)) + "\`\`\`");
			}
			console.log("/eval was unsuccessful, returned ->" + evaled);
			}
		return;
	}

	if (message.content === "/reloadjson") {
		if (message.author.id !== config.author.id) {message.channel.send("Only " + config.author.name + " can use this command"); return;}
		
		let rawdata = fs.readFileSync('servers.json');  
		servers = JSON.parse(rawdata);
		servers.guilds = new FastMap(servers.guilds)
		console.log('json reloaded');
		message.channel.send("JSON reloaded");
		return;
	}
	
	if (typeof servers.guilds.get(message.guild.id) === 'undefined') {
		message.channel.send("something has gone wrong, restoring from default");
		servers.guilds.set(message.guild.id, {"name": message.guild.name, "id": message.guild.id,"prefix":"/","role": {"id": null,"name": null},"mcservers": []});
		fs.writeFileSync('servers.json', JSON.stringify(servers, null, 2));
		console.log('guild ' + message.guild.name + '(' + message.guild.id + ') was missing from json and was restored');
	}

	if (message.isMentioned(client.user) || message.content === servers.guilds.get(message.guild.id).prefix + "help") {
		message.channel.send("My Current Prefix is `" + servers.guilds.get(message.guild.id).prefix + "`\nCommands: `" + servers.guilds.get(message.guild.id).prefix + "setrole`, `" + servers.guilds.get(message.guild.id).prefix + "setprefix`, `" + servers.guilds.get(message.guild.id).prefix + "addserver`, `" + servers.guilds.get(message.guild.id).prefix + "deleteserver`, `" + servers.guilds.get(message.guild.id).prefix + "serverproperties`, `" + servers.guilds.get(message.guild.id).prefix + "listservers`, `" + servers.guilds.get(message.guild.id).prefix + "editserver`, and custom commands to check the status' of servers.");
	}
	
	if(message.content.indexOf(servers.guilds.get(message.guild.id).prefix) !== 0) return;
	
	const args = message.content.slice(servers.guilds.get(message.guild.id).prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	switch (command) {
		case "setrole": {
			if (!(message.author.id === config.author.id || message.member.hasPermission("ADMINISTRATOR"))) {message.channel.send("Only Administrators can use this command"); return;}
			if (args.length < 1) {
				message.channel.send("allowing everyone to use reserved commands, if this is a mistake, make sure to mention a role.");
				servers.guilds.get(message.guild.id).role = {"id":null,"name":null}
				console.log('role set to null in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
				return;
			}
			servers.guilds.get(message.guild.id).role = message.mentions.roles.first()
			message.channel.send("allowing " + servers.guilds.get(message.guild.id).role.name + " to use reserved commands");
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('role set to ' + servers.guilds.get(message.guild.id).role.name + ' in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
		}
		
		case "setprefix": {
			if (!(message.author.id === config.author.id || message.member.hasPermission("ADMINISTRATOR"))) {message.channel.send("Only Administrators can use this command"); return;}
			if (args.length < 1 || args.length > 1) {
				message.channel.send("usage: " + servers.guilds.get(message.guild.id).prefix + "setprefix <prefix>");
				return;
			}
			servers.guilds.get(message.guild.id).prefix = args[0];
			message.channel.send("Setting prefix to `" + servers.guilds.get(message.guild.id).prefix + "`");
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('Prefix Changed to "' + servers.guilds.get(message.guild.id).prefix + '" for ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
		}

		case "addserver": {
			if (servers.guilds.get(message.guild.id).role.id !== null && !(message.member.roles.has(servers.guilds.get(message.guild.id).role.id))) {message.channel.send("Only people with " + servers.guilds.get(message.guild.id).role.name + " can use this command"); return;}
			if (args.length < 4) {
				message.channel.send("Usage: " + servers.guilds.get(message.guild.id).prefix + "addserver <name> <ip/url> <port (write 25565 if no port)> <command1> <command2> ...");
				return;
			}
			let cmds = args.splice(3,args.length - 3);
			let newserver = {"name": args[0],"commands": cmds,"address": {"ip": args[1],"port": args[2]},}
			servers.guilds.get(message.guild.id).mcservers.push(newserver)
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log('New server ' + newserver.name + ' added to ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			message.channel.send("Server added with name of "+ newserver.name)
			return;
		}

		case "removeserver": {
			message.channel.send("Did you mean `" + servers.guilds.get(message.guild.id).prefix + "deleteserver`");
		}

		case "deleteserver": {
			if (servers.guilds.get(message.guild.id).role.id !== null && !(message.member.roles.has(servers.guilds.get(message.guild.id).role.id))) {message.channel.send("Only people with " + servers.guilds.get(message.guild.id).role.name + " can use this command"); return;}
			if (args.length < 1) {
				message.channel.send("Usage: " + servers.guilds.get(message.guild.id).prefix + "deleteserver <name>");
				return;
			}
			if (servers.guilds.get(message.guild.id).mcservers.findIndex(server => server.name === args[0]) === -1) {
				message.channel.send("`" + args[0] + "` is not a valid server")
				return;
			};

			servers.guilds.get(message.guild.id).mcservers.splice(servers.guilds.get(message.guild.id).mcservers.findIndex(server => server.name === args[0]),1);
			
			let data = JSON.stringify(servers, null, 2);
			fs.writeFile('servers.json', data, (err) => {  
				if (err) throw err;
				console.log("Deleted Server " + args[0] + ' in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
			});
			
			message.channel.send("Deleted Server `" + args[0] + "`")
			return;
		}
		
		case "serverproperties": {
			if (args.length < 1) {
				message.channel.send("Usage: " + servers.guilds.get(message.guild.id).prefix + "serverproperties <name>");
				return;
			}
			
			let name = args[0];
			
			for (let i = 0; i < servers.guilds.get(message.guild.id).mcservers.length; i++) {
				if (servers.guilds.get(message.guild.id).mcservers[i].name === name) {
					message.channel.send("Server: `" + servers.guilds.get(message.guild.id).mcservers[i].name + "`\nIp/Url: `" + servers.guilds.get(message.guild.id).mcservers[i].address.ip + "`\nPort: `" + servers.guilds.get(message.guild.id).mcservers[i].address.port + "`\nCommand(s): `" + servers.guilds.get(message.guild.id).prefix + servers.guilds.get(message.guild.id).mcservers[i].commands.join(" " + servers.guilds.get(message.guild.id).prefix + "") + "`")
					return;
				}
			}
			message.channel.send("please enter a valid server name")
			return;
		}
		
		case "listservers": {
			let servernamelist = []
			for (let i = 0; i < servers.guilds.get(message.guild.id).mcservers.length; i++) {
			servernamelist.push(servers.guilds.get(message.guild.id).mcservers[i].name)
			}

			const embed = new Discord.RichEmbed()
			.setTitle("Servers:")
			.setColor("FFFFFF")
			.setDescription((servernamelist.length?"```" + servernamelist.join("\n") + "```":"no servers found, use `" + servers.guilds.get(message.guild.id).prefix + "addserver` to change that")+"\nuse " + servers.guilds.get(message.guild.id).prefix + "serverproperties <name> to get more info about a server");
			message.channel.send(embed);
			return;
			
		}
		
		case "editserver": {
			if (servers.guilds.get(message.guild.id).role.id !== null && !(message.member.roles.has(servers.guilds.get(message.guild.id).role.id))) {message.channel.send("Only people with " + servers.guilds.get(message.guild.id).role.name + " can use this command"); return;}
			
			if (args.length < 3) {
				message.channel.send("Usage: " + servers.guilds.get(message.guild.id).prefix + "editserver <server> [name, ip, port, command(s)] <value> [values]");
				return;
			}
			
			serverindex = servers.guilds.get(message.guild.id).mcservers.findIndex(server => server.name === args[0]);
			switch (args[1]) {
				case "name": {
					if (args.length > 3) {
					message.channel.send("attribute `name` can only have one value");
					return;
					}
					
					servers.guilds.get(message.guild.id).mcservers[serverindex].name = args[2];
					
					message.channel.send("server `" + args[0] + "` was renamed to `" + args[2] + "`");
					
					let data = JSON.stringify(servers, null, 2);
					fs.writeFile('servers.json', data, (err) => {  
						if (err) throw err;
						console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
					});
					return;
				}
				
				case "ip": {
					if (args.length > 3) {
					message.channel.send("attribute `ip` can only have one value");
					return;
					}
					
					servers.guilds.get(message.guild.id).mcservers[serverindex].address.ip = args[2];
					
					message.channel.send("server attribute `" + args[1] + "` was changed to `" + args[2] + "`");
					
					let data = JSON.stringify(servers, null, 2);
					fs.writeFile('servers.json', data, (err) => {  
						if (err) throw err;
						console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
					});
					return;
				}
				
				case "port": {
					if (args.length > 3) {
					message.channel.send("attribute `port` can only have one value");
					return;
					}
					
					servers.guilds.get(message.guild.id).mcservers[serverindex].address.port = args[2];
					
					message.channel.send("server attribute `" + args[1] + "` was changed to `" + args[2] + "`");
					
					let data = JSON.stringify(servers, null, 2);
					fs.writeFile('servers.json', data, (err) => {  
						if (err) throw err;
						console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
					});
					return;
				}
				
				case "command":
				case "commands":
				case "command(s)": {
					let cmds = args.splice(2,args.length - 2);
					
					servers.guilds.get(message.guild.id).mcservers[serverindex].commands = cmds
					
					message.channel.send("server attribute `" + args[1] + "` was changed to `" + servers.guilds.get(message.guild.id).prefix + "" + cmds.join(" " + servers.guilds.get(message.guild.id).prefix + "") + "`");
					let data = JSON.stringify(servers, null, 2);
					fs.writeFile('servers.json', data, (err) => {  
						if (err) throw err;
						console.log('server edited in ' + message.guild.name + ' (id: ' + message.guild.id + ')');
					});
					return;
				}
				default:{
					message.channel.send("please enter a valid server name and/or attribute")
					return;
				}
			}
		}
		case "ping":{
			if (args.length != 2) {message.channel.send("Usage: " + servers.guilds.get(message.guild.id).prefix + "ping <ip/url> <port (write 25565 if no port)>");return;}
			let server = {"name":args.join(":"),"address":{"ip":args[0],"port":args[1]}};
			if (typeof server !== 'undefined') {
				ping(server, (err, embed) => {
					if (err) {console.log(err);message.channel.send(err);}
					message.channel.send(embed)
				})
				return;
			}
		}
		default:{
			let server = servers.guilds.get(message.guild.id).mcservers.find(server => server.commands.includes(command));
			if (typeof server !== 'undefined') {
				ping(server, (err, embed) => {
					if (err) {console.log(err);message.channel.send(err);}
					message.channel.send(embed)
				})
				return;
			}
		}
	}
	
});
