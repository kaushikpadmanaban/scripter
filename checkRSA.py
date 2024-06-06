# Import relevant libraries and modules
import sys
from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64

# Arguments taken from JS
encodedKey = sys.argv[1]
pwd = sys.argv[2]
fileLoc = sys.argv[3]

# Read the file from file location as bytes
file_in = open(fileLoc, 'rb')
message = file_in.read()
file_in.close()

# Reversal of the process used when creating RSA key 
# Returns the key in its original format

decodedKey = base64.b64decode(encodedKey)

# Sets up key for signing
key = RSA.import_key(decodedKey, passphrase=pwd)

# File is hashed using SHA-256
h = SHA256.new(message)

signature = pss.new(key).sign(h)

signEncoded = base64.b64encode(signature)
signEncodedString = signEncoded.decode("utf-8")

# Script returns the signature as a string
print(signEncodedString)