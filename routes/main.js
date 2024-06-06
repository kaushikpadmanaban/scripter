
module.exports = function(app, shopData) {
    
    // Checks whether user is logged-in before allowing access to service
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        }
        else {
            next ();
        }
    }
    // Enforces access control by checking user type
    function checkUserType(requiredType) {
        return function(req, res, next) {
            if (req.session.usertype.toString() === requiredType) {
                next();
            } else {
                res.redirect('/unauthorized');
            }
        };
    }
    const multer = require('multer');

    // Multer confniguration. Changes File Name (recommended by OWASP) and sets file size limit
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
        limits: { fileSize: 2097152 /* bytes */ },
        fileFilter: (req, file, cb) => {
            if(file.mimetype === 'application/pdf'){
                cb(null, true);
            }
            else{
                req.fileValidationError = "Forbidden extension";

                cb(null, false, req.fileValidationError);
                console.log('File type not supported');
            }
        } 

    });
    // Required modules are initialised
    const bcrypt = require('bcrypt');
    const { check, validationResult } = require('express-validator');
    const PythonShell = require('python-shell').PythonShell;
    const fs = require('fs')

    // Render all pages
    app.get('/', function(req, res){
        res.render('index.ejs', shopData)
    });
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData)
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });  
    app.get('/fileupload', redirectLogin, checkUserType('1'), function (req,res) {
        res.render('fileupload.ejs', shopData);                                                                     
    });  
    app.get('/dashboarddoc', checkUserType('1'), function (req,res) {
        res.render('dashboarddoc.ejs', {shopName: "Scripter", username: req.session.user})
    });
    app.get('/unauthorized', (req, res) => {
        res.status(403).send('Access denied: You do not have permission to view this page.');
    });
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })

    app.get('/myfiles', redirectLogin, checkUserType('1'), function(req, res) {
        let sender = req.session.userId;
        let sqlquery = "SELECT * FROM fileData where sender = (?)";
        // query database to get all the files uploaded by user
        db.query(sqlquery,sender, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let recipient = 0;
            let sqlquery2 = "SELECT * from authentication where usertype = (?)";
            db.query(sqlquery2,recipient, (err, result2) => {
            if (err) {
                res.redirect('./'); 
            }
            // renders all available files and recipients
            let newData1 = Object.assign({}, shopData, {availableFile: result, availableRecipients:result2});
            res.render("myfiles.ejs", newData1)
         });
         });
         
    });
    app.get('/dashboardpharm', redirectLogin, checkUserType('0'), function(req, res) {
        // query database to get all the files sent to user
        let sqlquery = "SELECT * FROM fileTransaction where recipientID = ? AND recipientName = ?"; 
        db.query(sqlquery, [req.session.userId, req.session.user], (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, {shopName: "Scripter", username: req.session.user, availableFiles:result});
            res.render("dashboardpharm.ejs", newData)
         });
    });

    app.post('/loggedin', function (req,res) {
        let username = req.body.username;
        let hashedPassword = "SELECT Personid, password, privateKey, usertype FROM authentication WHERE username = (?)";
        
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
                        //stores session cookies
                        req.session.user = req.body.username;
                        req.session.userId = result1[0].Personid;
                        req.session.privKey = result1[0].privateKey;
                        req.session.hashpass = result1[0].password;
                        req.session.usertype = result1[0].usertype;
                        if(result1[0].usertype == 1) {
                            res.redirect('/dashboarddoc');
                        }
                        else if(result1[0].usertype == 0) {
                            res.redirect('/dashboardpharm')
                        }
                        
                        console.log("Logged In")
                        
                    }
                    else {
                        console.log("Your password is wrong");
                    }
                })
                }
        });
    })

    app.post('/registered', [
        check ('password')
            .isStrongPassword()
            .withMessage('Please choose a stronger password.'),
        check ('username').notEmpty().isLength({min: 5, max: 20}).withMessage("Username must be a minimum of 5 characters and a maximum of 20 characters.")], function (req,res) {
        
        const saltRounds = 10;
        const plainPassword = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send('Please choose a unique username. Return to <a href="./register">Registration Page</a>');
        }
        else{
            bcrypt.hash(plainPassword, saltRounds, async function(err, hashedPassword) {  
                let options = {
                    mode: 'text',
                    pythonOptions: ['-u'],
                    args: [hashedPassword]
                };
                
                await PythonShell.run('createRSA.py', options).then(messages=>{
                    let sqlquery = "INSERT INTO authentication (firstname, lastname, username, password, usertype, privateKey, publicKey) VALUES (?,?,?,?,?,?,?)";
                   let newrecord = [req.body.first, req.body.last,req.body.username, hashedPassword, req.body.usertype, messages[0], messages[1]];
                   db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                      res.send(err.message.toString() + ' Please attempt registration again.');

                    }
                    else {
                        res.redirect('/');
                    }       
                    });
                });
                })
        }
        
        

    });


    

    app.post('/sign', (req, res) => {

    const selectedFilenameFromForm = req.body['selected-item'];
    const selectedRecipient = req.body['recipients'];
    const [selectedRecipientUsername, selectedRecipientID] = selectedRecipient.split(':');

    let sqlquery = "SELECT filepath FROM fileData WHERE filename = (?)";
    let currentFile = selectedFilenameFromForm;
    let currentRecipient = selectedRecipientUsername;
    let currentRecipientID = selectedRecipientID;
    let fileName = Date.now() + currentFile;

    db.query(sqlquery,currentFile, async (err, result) => {
        if (err) {
            res.redirect('./'); 
        }
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            args: [req.session.privKey, req.session.hashpass, result[0].filepath]
        };

        await PythonShell.run('checkRSA.py', options).then(messages=>{
            let sqlquery2 = "INSERT into fileTransaction (fileName, fileOriginalName, senderName, senderID, fileSignature, recipientName, recipientID, fileLocation) VALUES (?,?,?,?,?,?,?,?)"
            let input = [fileName, currentFile, req.session.user, req.session.userId, messages, currentRecipient, currentRecipientID, result[0].filepath]
            db.query(sqlquery2, input, (err, result2) => {
                if (err) {
                    console.log(err)
                }
                console.log("SUCCESS!")
                
            })
        })

    });
        
        
    res.redirect('/dashboarddoc')
    });

    

    app.post('/verify', function(req, res) {
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
            let options = {
                mode: 'text',
                pythonOptions: ['-u'], // get print results in real-time
                args: [signature, fileLocation, pubKey[0].publicKey]
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
        let sqlquery = "INSERT INTO fileData (filename, originalfilename, filepath, sender,senderName) VALUES (?,?,?,?,?)";
           // execute sql query
           let newrecord = [req.file.filename, req.file.originalname, req.file.path, req.session.userId, req.session.user];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return console.error(err.message);
            }
                  
            },)
        res.redirect('/dashboarddoc');
    }
    
 });
}