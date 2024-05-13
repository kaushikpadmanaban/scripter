from Crypto.PublicKey import RSA
import sys
import base64

myKey =RSA.generate(3072)
pwd = sys.argv[1]

privateKey = myKey.export_key(
    format='DER',
    passphrase=pwd,
    pkcs=8,
    protection='PBKDF2WithHMAC-SHA512AndAES256-CBC',
    prot_params={'iteration_count':131072})
publicKey = myKey.public_key().export_key()
privKeyEnc = base64.b64encode(privateKey)
privKeyString = privKeyEnc.decode('utf-8')
pubKeyEnc = base64.b64encode(publicKey)
pubKeyString = pubKeyEnc.decode('utf-8')

# with open('private_key.txt', 'w') as f:
#     f.write(privKeyString)

# with open('public_key.txt', 'w') as f:
#     f.write(pubKeyString)

print(privKeyString)
print(pubKeyString)
