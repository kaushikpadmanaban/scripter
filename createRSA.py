# Import relevant libraries
from Crypto.PublicKey import RSA 
import sys
import base64

myKey =RSA.generate(3072) # 3072 bits is the size of the modulus, n
pwd = sys.argv[1]

privateKey = myKey.export_key( # Export Private Key using the user's hashed password as passphrase
    format='DER',
    passphrase=pwd,
    pkcs=8,
    protection='PBKDF2WithHMAC-SHA512AndAES256-CBC',
    prot_params={'iteration_count':131072})
publicKey = myKey.public_key().export_key() 

# Both Private and Public Key are first encoded to base64 and then decoded to utf-8.
privKeyEnc = base64.b64encode(privateKey)
privKeyString = privKeyEnc.decode('utf-8')
pubKeyEnc = base64.b64encode(publicKey)
pubKeyString = pubKeyEnc.decode('utf-8')

# Python Shell returns all print statements as results
print(privKeyString)
print(pubKeyString)
