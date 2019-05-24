#!/usr/bin/env python3
from mcstatus import MinecraftServer
import sys
from socket import *
import json

server = MinecraftServer(str(sys.argv[1]),int(sys.argv[2]))

try:
	status = server.status().raw
	status['error'] = None
	if "favicon" in status:
		status.pop("favicon")
	print(json.dumps(status))
except timeout:
	error = {"error":"Connection Timed Out"}
	print(json.dumps(error))
except ConnectionRefusedError:
	error = {"error":"Connection Refused"}
	print(json.dumps(error))
except (IOError, OSError):
	error = {"error":"IOError"}
	print(json.dumps(error))