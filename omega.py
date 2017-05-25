from OmegaExpansion import pwmExp
import socket
import sys
import signal
import time

HOST = ''
PORT = 0

# PWM duty cycles (%)
PWM_LIGHT_OFF = 3
PWM_LIGHT_ON = 5
PWM_IDLE = 4

LIGHT_1_CHANNEL = 0
LIGHT_2_CHANNEL = 1

LIGHT_OFF_COMMAND = 0
LIGHT_ON_COMMAND = 1

PASSKEY = 0

COMMAND_SIZE = 2
MESSAGE_SIZE = COMMAND_SIZE + len(str(PASSKEY))

def toggleLight(channel, command):
  if not pwmExp.checkInit():
    pwmExp.driverInit();
  pwmExp.setupDriver(channel, command, 0)
  time.sleep(1)
  pwmExp.setupDriver(channel, PWM_IDLE, 0)
  pwmExp.disableChip();

def turnLightOff(target):
  if target == LIGHT_1_CHANNEL:
    print "Turning light 1 off"
    toggleLight(LIGHT_1_CHANNEL, PWM_LIGHT_OFF)
  elif target == LIGHT_2_CHANNEL:
    print "Turning light 2 off"
    toggleLight(LIGHT_2_CHANNEL, PWM_LIGHT_OFF)
  else:
    print "Unrecognized target: " + str(target)

def turnLightOn(target):
  if target == LIGHT_1_CHANNEL:
    print "Turning light 1 on"
    toggleLight(LIGHT_1_CHANNEL, PWM_LIGHT_ON)
  elif target == LIGHT_2_CHANNEL:
    print "Turning light 2 on"
    toggleLight(LIGHT_2_CHANNEL, PWM_LIGHT_ON)
  else:
    print "Unrecognized target: " + str(target)

def handleCommand(passkey, command, target):
  if passkey != PASSKEY:
    print "Incorrect passkey: " + str(passkey)
    return
  if command == LIGHT_OFF_COMMAND:
    turnLightOff(target)
  elif command == LIGHT_ON_COMMAND:
    turnLightOn(target)
  else:
    print "Unrecognized command: " + str(command)

def handleConnection(conn):
  data = conn.recv(MESSAGE_SIZE)
  if not data:
    return
  print "Received data from socket: " + data
  try:
    # NOTE: hardcoded message sizes... Please fix
    passkey = int(data[0:6])
    command = int(data[6])
    target = int(data[7])
  except ValueError:
    print "Can't parse data"
    return
  handleCommand(passkey, command, target)
  print "Closing connection"
  conn.close()

def cleanup(signum, frame):
  sock.close()

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

try:
  sock.bind((HOST, PORT))
except socket.error as msg:
  print "Bind failed. Error Code : " + str(msg[0]) + " Message " + msg[1]
  sys.exit()

print "Listening on port: " + str(PORT)

sock.listen(0)

while True:
  conn, addr = sock.accept()
  print "Connection from " + addr[0] + ":" + str(addr[1])
  handleConnection(conn)

sock.close()