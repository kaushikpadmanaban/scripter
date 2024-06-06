CREATE DATABASE safescriptions;
USE safescriptions;
CREATE TABLE authentication (Personid int NOT NULL AUTO_INCREMENT, firstname VARCHAR(100) NOT NULL, lastname VARCHAR(100) NOT NULL, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(300) NOT NULL, usertype BOOLEAN NOT NULL, privateKey TEXT, publicKey TEXT NOT NULL, PRIMARY KEY (Personid));


// USE safescriptions;
create table fileData (filename VARCHAR(1000), originalfilename VARCHAR(1000), filePath VARCHAR(1000), sender INT, senderName VARCHAR (100));


//

CREATE TABLE fileTransaction (fileName VARCHAR(2000), fileOriginalName VARCHAR(2000), senderName VARCHAR (2000), senderID INT, fileSignature TEXT, fileLocation VARCHAR(2000), datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP, recipientName VARCHAR(2000), RecipientID INT, TransactionID INT auto_increment, PRIMARY KEY (transactionID))