import sys
from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64

fileSign = sys.argv[1]
fileLoc = sys.argv[2]
encodedPubKey = sys.argv[3]

# Decode public key back to binary data

decodedSign = base64.b64decode(fileSign.encode("utf-8"))
decodedPubKey = base64.b64decode(encodedPubKey.encode("utf-8"))


file_in = open(fileLoc, 'rb')
message = file_in.read()
file_in.close()


key = RSA.import_key(decodedPubKey)

h = SHA256.new(message)

verifier = pss.new(key)

try:

    verifier.verify(h, decodedSign)
    print("authentic")

except (ValueError):

    print("inauthentic")



