var express = require("express");
var logger = require("morgan");
var path = require('path');
var cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

require('dotenv').config();

const OAuthClient = require('intuit-oauth');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./src/models/user');

const config = require('./config');
const indexRouter = require('./src/routes/index.routes');
const childrenRouter = require('./src/routes/children.routes');
const serviceRouter = require('./src/routes/service.routes');
const attendanceRouter = require('./src/routes/attendance.routes');
const searchRouter = require('./src/routes/search.routes');
const invoiceRouter = require('./src/routes/invoice.route');


var app = express();

app.use(cors());

app.use(fileUpload());

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const dbURI = process.env.DB_URI || config.dbURI;

mongoose.connect(dbURI, {
    useNewUrlParser: true,
})
    .then(() => console.log("Database connected " + dbURI))
    .catch(err => console.log(err));

mongoose.Promise = global.Promise;

app.use(express.static('public'));
// app.use(express.static('uploads'));

// process.env.JWT_SECRET="secret nursery"

/**
 * QuickBook api connect
 */

/**
 * App Variables
 * @type {null}
 */
var oauth2_token_json = null,
    redirectUri = '';


/**
* Instantiate new Client
* @type {OAuthClient}
*/

var oauthClient = null;


/**
* Get the AuthorizeUri
*/
app.get('/authUri', (req, res) => {
    oauthClient = new OAuthClient({
        clientId: process.env.CLIENTID,
        clientSecret: process.env.SECRET_KEY,
        environment: 'sandbox', // or production
        redirectUri: process.env.REDIRECT_URI
    });

    var authUri = oauthClient.authorizeUri({ scope: [OAuthClient.scopes.Accounting], state: 'intuit-test' });
    res.send(authUri);
})



/**
* Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
*/
app.get('/callback', function (req, res) {
    oauthClient.createToken(req.url)
        .then(function (authResponse) {
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
            console.log("QuickBooks is connected! token: ", oauth2_token_json);
            res.redirect('/login')
        })
        .catch(function (e) {
            console.error(e);
            res.redirect('/login')
        });

});

app.get('/customerspullapi', (req, res) => {
    const companyID = oauthClient.getToken().realmId;

    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;
    const query="select * from Customer";

    oauthClient
        .makeApiCall({ url: `${url}v3/company/${companyID}/query?query=${query}` })
        .then(function (authResponse) {
            // console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
            let customers=[];
            console.log(authResponse);
            for(cus of authResponse?.queryResponse?.Customer){
                customers.push(cus.fullyQualifiedName);
            }
            res.send(customers);
        })
        .catch(function (e) {
            console.error(e);
        });
})


/**
* end
*/


app.use('/testapi', indexRouter);
app.use('/childrenapi', childrenRouter);
app.use('/serviceapi', serviceRouter);
app.use('/attendanceapi', attendanceRouter);
app.use('/searchapi', searchRouter);
app.use('/invoiceapi', invoiceRouter);

app.post('/registerapi', async (req, res) => {
    const user = req.body;

    const takenUsername = await User.findOne({ username: user.username });
    if (takenUsername) {
        res.json({ message: 'Username has already been taken' });
    } else {
        user.password = await bcrypt.hash(req.body.password, 10);

        const dbUser = new User({
            username: user.username.toLowerCase(),
            password: user.password
        })

        dbUser.save();
        res.json({ message: "Success" });
    }
})

app.post('/loginapi', (req, res) => {
    const userLoggingIn = req.body;

    User.findOne({ username: userLoggingIn.username })
        .then(dbUser => {
            if (!dbUser) {
                return res.json({
                    message: "Invalid Username or Password"
                })
            }
            bcrypt.compare(userLoggingIn.password, dbUser.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        const payload = {
                            id: dbUser._id,
                            username: dbUser.username
                        }
                        jwt.sign(
                            payload,
                            process.env.JWT_SECRET,
                            { expiresIn: 86400 },
                            (err, token) => {
                                if (err) {
                                    console.log(err);
                                    return res.json({ message: err });

                                }

                                return res.json({
                                    message: 'Success',
                                    token: "Bearer " + token
                                })
                            }
                        )
                    } else {
                        return res.json({
                            message: "Invalid Username or Pasword"
                        })
                    }
                })
        })
})

app.get("/isAuthUsers", verifyJWT, (req, res) => {
    res.json({ isLoggedIn: true, username: req.user.username });
})

function verifyJWT(req, res, next) {
    const token = req.headers["x-access-token"]?.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.json({
                isLoggedIn: false,
                message: "Failed to Authenticate"
            })
            req.user = {};
            req.user.id = decoded.id;
            req.user.username = decoded.username;
            next()
        })
    } else {
        res.json({ message: "Incorrect Token Given", isLoggedIn: false });
    }
}
app.get('*', function (request, response) {
    response.sendFile(path.join(__dirname, 'public/index.html'));
});
app.use((req, res, next) => {
    res.status(err.status || 404).json({
        message: "No such route exists"
    })
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: "Error Message"
    })
});




const port = process.env.PORT || config.port

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
