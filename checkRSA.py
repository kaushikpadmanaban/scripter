import sys
from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64

encodedKey = sys.argv[1]
pwd = sys.argv[2]
fileName = sys.argv[3]
fileLoc = sys.argv[4]

# print("Encoded Key: " + encodedKey)
# print("PWD: " + pwd)
# print("Filename: " + fileName)
# print("FileLoc: " + fileLoc)

# # file_location = 'prescription.pdf'
file_in = open(fileLoc, 'rb')
message = file_in.read()
file_in.close()
# # pwd = b'secret'

decodedKey = base64.b64decode(encodedKey)

key = RSA.import_key(decodedKey, passphrase=pwd)

h = SHA256.new(message)

signature = pss.new(key).sign(h)



signEncoded = base64.b64encode(signature)
signEncodedString = signEncoded.decode("utf-8")

file_name = 'signature.txt'
file_out = open(file_name, 'w')
file_out.write(signEncodedString)
file_out.close()
print(signEncodedString)



