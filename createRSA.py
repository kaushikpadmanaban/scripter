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
pubKeyEnc = base64.b64encode(publicKey)
print(privKeyEnc)
print(pubKeyEnc)
