// Import required modules
var express = require ('express')
var ejs = require('ejs')
var bodyParser= require ('body-parser')
var session = require ('express-session')
const mysql = require('mysql2');
require('dotenv').config();

const app = express()
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }))

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'Kp296496',
    database: 'safescriptions',
    port: '3306'
});
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.use(session({
    secret: process.env.SESSION_SECRET, //session secret is set using environmental variables thus making it more secure
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// Set up css
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

var shopData = {shopName: "Scripter"}

require("./routes/main")(app, shopData);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
