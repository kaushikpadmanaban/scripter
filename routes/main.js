module.exports = function(app, shopData) {
    
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        }
        else {
            next ();
        }
    }
    const multer = require('multer');

    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
    }
    });
    const upload = multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
            if(file.mimetype === 'application/pdf'){
                cb(null, true);
            }
            else{
                req.fileValidationError = "Forbidden extension";

                cb(null, false, req.fileValidationError);
                console.log('File type not supported'); // CHANGE TO FILE ERROR USING MULTER'S REQ.FILEERROR
                // redirect('/fileupload')
                
            }
        } 

    });
    const bcrypt = require('bcrypt');
    const request = require('request');
    const PythonShell = require('python-shell').PythonShell;
    const fs = require('fs')

    
    
    app.get('/', function(req, res){
        res.render('index.ejs', shopData)
    });
    app.get('/about', function(req, res) {
        res.render('about.ejs', shopData)
    });
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData)
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });  
    app.get('/fileupload', redirectLogin, function (req,res) {
        res.render('fileupload.ejs', shopData);                                                                     
    });  
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })

    

    app.post('/loggedin', function (req,res) {
        let username = req.body.username;
        let hashedPassword = "SELECT Personid, password, privateKey FROM authentication WHERE username = (?)";
        
        db.query(hashedPassword, username, (err, result1) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                var finalpwd = result1[0].password;
                bcrypt.compare(req.body.password, finalpwd, function(err,result2){
                    if (err) {
                        console.error(err.message)
                    }
                    else if (result2 == true) {  
                        req.session.user = req.body.username;
                        req.session.userId = result1[0].Personid;
                        req.session.privKey = result1[0].privateKey;
                        req.session.hashpass = result1[0].password;
                        res.redirect('./');
                        console.log("Logged In")
                        console.log(result1[0])
                        
                    }
                    else {
                        console.log("Your password is wrong");
                    }
                })
                }
        });
    })

    // function createRSA() {
    //     const runPy = (code) => {
    //         const options = {
    //            mode: 'text',
    //            pythonOptions: ['-u'],
    //            scriptPath: path.join(__dirname, '../'),
    //            args: [code],
    //         };
         
    //        // wrap it in a promise, and `await` the result
    //        const result =  new Promise((resolve, reject) => {
    //          PythonShell.run('createRSA.py', null, async (err, results) => {
    //            if (err) return reject(err);
    //            return resolve(results);
    //          });
    //        });
    //        console.log(result.stdout);
    //        return result;
    //      };
    // }


    app.post('/registered', function (req,res) {
        // saving data in database
        
        const saltRounds = 10;
        const plainPassword = req.body.password;
        
        
        bcrypt.hash(plainPassword, saltRounds, async function(err, hashedPassword) {
        // Store hashed password in your database.
        
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            args: [hashedPassword]
        };
        
        await PythonShell.run('createRSA.py', options).then(messages=>{
            // results is an array consisting of messages collected during execution
            //console.log('Private Key: %j', messages[0]);
            //console.log('Public Key: %j', messages[1]);

            let sqlquery = "INSERT INTO authentication (firstname, lastname, username, password, usertype, privateKey, publicKey) VALUES (?,?,?,?,?,?,?)";
           // execute sql query
           let newrecord = [req.body.first, req.body.last,req.body.username, hashedPassword, req.body.usertype, messages[0], messages[1]];
           db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return console.error(err.message);
            }
            else {
                                                                                         
                //res.send(result);
                res.redirect('/');
                //return;
            }       
            });
            // return results;
        });
        
        // 
        
        })

    });
    app.get('/myfiles', redirectLogin, function(req, res) {
        let sender = req.session.userId;
        let sqlquery = "SELECT * FROM fileData where sender = (?)"; // query database to get all the books
        // execute sql query
        db.query(sqlquery,sender, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //let newData = Object.assign({}, shopData, {availableBooks:result});
            //console.log(newData)
            //res.render("myfiles.ejs", newData)
            let recipient = 0;
            let sqlquery2 = "SELECT * from authentication where usertype = (?)";
            db.query(sqlquery2,recipient, (err, result2) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData1 = Object.assign({}, shopData, {availableBooks: result, availableRecipients:result2});
            //console.log(result2[0].Personid)
            res.render("myfiles.ejs", newData1)
         });
         });
         
    });

    

    app.post('/sign', (req, res) => {

    const selectedFilenameFromForm = req.body['selected-item'];
    const selectedRecipient = req.body['recipients'];

    // Split the selected value to extract username and Personid
    const [selectedRecipientUsername, selectedRecipientID] = selectedRecipient.split(':');

    // console.log("Filename from form data:", selectedFilenameFromForm);
    // console.log("Selected recipient username:", selectedRecipientUsername);
    // console.log("Recipient userID:", selectedRecipientID);

    let sqlquery = "SELECT filepath FROM fileData WHERE filename = (?)";
    // execute sql query
    let currentFile = selectedFilenameFromForm;
    let currentRecipient = selectedRecipientUsername;
    let currentRecipientID = selectedRecipientID;
        db.query(sqlquery,currentFile, async (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            console.log(result[0].filepath)
            let options = {
                mode: 'text',
                pythonOptions: ['-u'], // get print results in real-time
                args: [req.session.privKey, req.session.hashpass, currentFile, result[0].filepath]
            };
    
            await PythonShell.run('checkRSA.py', options).then(messages=>{
                console.log(messages);
                let sqlquery2 = "INSERT into fileTransaction (fileName, senderName, senderID, fileSignature, recipientName, recipientID, fileLocation) VALUES (?,?,?,?,?,?,?)"
                let input = [currentFile, req.session.user, req.session.userId, messages, currentRecipient, currentRecipientID, result[0].filepath]
                db.query(sqlquery2, input, (err, result2) => {
                    if (err) {
                        console.log("ERROR!")
                    }
                    console.log("SUCCESS!")
                    //result2.redirect('./')
                })
            })

         });
        
        

    });

    app.get('/receivedfiles', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM fileTransaction where recipientID = ? AND recipientName = ?"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, [req.session.userId, req.session.user], (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            console.log(result);
            let newData = Object.assign({}, shopData, {availableFiles:result});
            //console.log(result2[0].Personid)
            res.render("receivedfiles.ejs", newData)
         });
    });

    app.post('/verify', function(req, res) {
        console.log(req.body);
        let sender = req.body['selected-sender'];
        let senderID = req.body['selected-senderID'];
        let fileName = req.body['selected-file'];
        let signature = req.body['selected-signature'];
        let fileLocation = req.body['selected-fileLocation'];

        let sqlquery = "SELECT publicKey from authentication where username = ? AND Personid = ? "
        db.query(sqlquery, [sender, senderID], async (err,pubKey) => {
            if (err) {
                res.redirect('./'); 
            }
            // console.log(pubKey[0].publicKey)
            let options = {
                mode: 'text',
                pythonOptions: ['-u'], // get print results in real-time
                args: [fileName, signature, fileLocation, pubKey[0].publicKey]
            };
    
            await PythonShell.run('verify.py', options).then(messages=>{
                const result = messages[0]
                if(result === "authentic") {
                    if (fs.existsSync(fileLocation)) {
                        
                        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                        res.setHeader('Content-Type', 'application/octet-stream');
                
                        fs.createReadStream(fileLocation).pipe(res);
                    } else {
                        res.status(404).send('File not found');
                    }
                }
            })
            
        })



    });

    // Set up a route for file uploads
    app.post('/upload', upload.single('file'), (req, res) => {
    // Handle the uploaded file
    //res.json({ message: req.file.filename });
    if(req.fileValidationError) {
        res.redirect('/fileupload')
    }
    else{
        let sqlquery = "INSERT INTO fileData (filename, filepath, sender,senderName) VALUES (?,?,?,?)";
           // execute sql query
           let newrecord = [req.file.filename, req.file.path, req.session.userId, req.session.user];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return console.error(err.message);
            }
                  
            },)
        res.redirect('./');
    }
    
 });
}