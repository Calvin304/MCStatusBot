#!/usr/bin/env python3
from mcstatus import MinecraftServer
import sys

server = MinecraftServer(str(sys.argv[1]),int(sys.argv[2]))
names = []

try:
	response = server.status()
	print("There Are **" + str(response.players.online) + "/" + str(response.players.max) + "** Player(s) Online")
	if type(response.players.sample) == str:
		for player in response.players.sample:
			names.append(player.name)
		print(*names, sep = ", ")

except:
	print("The Server is *Probably* down")