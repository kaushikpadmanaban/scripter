import sys
from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64

fileName = sys.argv[1]
fileSign = sys.argv[2]
fileLoc = sys.argv[3]
encodedPubKey = sys.argv[4]

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

# signEncoded = base64.b64encode(signature)
# signEncodedString = signEncoded.decode("utf-8")

# file_name = 'signature.txt'
# file_out = open(file_name, 'w')
# file_out.write(signEncodedString)
# file_out.close()
#print(signEncodedString)



