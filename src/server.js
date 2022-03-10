
const express = require("express");
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const csurf = require('csurf')
const init = require('./app/utils/init.utils')

const app = express();
const route = require('./app/routes');
const dbConfig = require('./app/config/db.config');
const path = require('path');
var methodOverride = require('method-override');
const morgan = require('morgan');


require('dotenv').config()
app.use(cors({
    origin: '*'
}));
app.disable('x-powered-by');
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(csurf({ cookie: true }))

//Khoi tao db
dbConfig.connect()
    .then(() => {
        //console.log("Successfully connect to MongoDB.");
        init.index();
    })
    .catch(err => {
        //console.error("Connection error", err);
        process.exit();
    });

//app.use(express.static(__dirname + '/public'));
app.use(
    express.urlencoded({
        extended: true,
    }),
);



route(app)

app.use(express.json());
app.use(flash());

app.use(methodOverride('_method'))
//HTTP loger
app.use(morgan(':method :status :response-time ms :url'));





// set port, listen for requests
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
