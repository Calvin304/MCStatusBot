const commando = require('discord.js-commando');
const dns = require('dns').promises;
const isIp = require('is-ip');

module.exports = class serverurl extends commando.ArgumentType {
	constructor(client) {
		super(client, 'serverurl');
	}

	async validate(val) {
        let url = new URL("minecraft://" + val)
        if(isIp(url.hostname)) {return true}; //TODO: dont use is-ip
        let address = await dns.resolve4(url.hostname).catch(err => {}) || await dns.resolveSrv("_minecraft._tcp." + url.hostname).catch(err => {}) || await dns.resolveCname(url.hostname).catch(err => {}) || await dns.resolve6(url.hostname).catch(err => {})
        if (address) {return true}
        return "invalid hostname";
    }

	parse(val) {
        return {"name":val,"url":new URL('minecraft://'+val).href}
	}
}
