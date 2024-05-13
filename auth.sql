CREATE DATABASE safescriptions;
USE safescriptions;
CREATE TABLE authentication (Personid int NOT NULL AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), username VARCHAR(50), password VARCHAR(100), usertype BOOLEAN, privateKey TEXT, publicKey TEXT, PRIMARY KEY (Personid));


// USE safescriptions;
create table fileData (filename VARCHAR(1000), filePath VARCHAR(1000), sender INT, senderName VARCHAR (100));


//

CREATE TABLE fileTransaction (fileName VARCHAR(2000), senderName VARCHAR (2000), senderID INT, fileSignature TEXT, fileDate datetime DEFAULT CURRENT_TIMESTAMP, recipientName VARCHAR(2000), RecipientID INT, TransactionID INT auto_increment, PRIMARY KEY (transactionID))