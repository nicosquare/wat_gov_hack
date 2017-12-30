var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
// For better efficient design
<<<<<<< HEAD
var http = require('http')
var extras = require('./extras.js')
=======
var extras = require('./extras.js');
>>>>>>> ed9e93bcc4bb1362884821003af77311c2edc75c
var async = require("async");
var request = require("request");
//JQuery
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")((new JSDOM('')).window);

// Uport imports

const Connect = require("uport-connect").Connect;
const SimpleSigner = require("uport-connect").SimpleSigner;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
var ml_controller = require('./controller/ml.js')
// parse application/json
app.use(bodyParser.json())

// Setting the cloudant service newly
var Cloudant = require('cloudant');
var me = extras.username;
var password = extras.password;
var cloudant = Cloudant({account:me, password:password});

database = cloudant.db.use('household_power_consumption');
database.find({selector:{}},(error,result)=>{
	if(!error)
	{
		var items =[];
		var length = result.docs.length;
//		console.log(length);
		var ans = result.docs[length-1].d;
		for (item in ans)		
		{
//			console.log(ans[item])
			items.push(ans[item])
		}
//		console.log(items)
	}
	else{
//		console.log(error)
	}
})
/* Endpoint to greet and add a new visitor to database.
 * Send a POST request to localhost:3000/api/visitors with body
kkkjjkjj * {
 * 	"name": "Bob"
 * }
 */

app.post("/api/visitors", function (request, response) {
	var userName = request.body.name;
	if(!mydb) {
		console.log("No database.");
		response.send("Hello " + userName + "!");
		return;
	}
	// insert the username as a document

	database.insert({"name" : userName} , (err,result)=>{
		if(err){
			return console.log(err)
		}
		response.send("hello")
	})
});

/**
 * Endpoint to get a JSON array of all the visitors in the database
 * REST API example:
 * <code>
 * GET http://localhost:3000/api/visitors
 * </code>
 *
 * Response:
 * [ "Bob", "Jane" ]
 * @return An array of all the visitor names
 */
app.get("/api/visitors", function (request, response) {
	var names = [];
	if(!database){
		response.send(names)
	}
	database.find({ selector:{} }, function(err, result) {
		if (!err) {
			console.log(result.docs[0].name)
			names.push(result.docs[0].name)
		}
		console.log(names) 
		response.json(names);
	})
});


// UPort code from here

app.post('/authenticate', function (req, res) {
    
 	const uport = new Connect('Cycle', {
      clientId: '2ojxCynUCy1VWqWJNJSVFAoRRyCPZDkSPw1',
      network: ' http://localhost:9545/',
      signer: SimpleSigner('e42efa79fadf96bfb9e9c4b0f75ea010640f55adcdc3cbdfa13638fe361d923d')
    })

    // Request credentials to login
    uport.requestCredentials({
      requested: ['name', 'phone', 'country'],
      notifications: true // We want this if we want to recieve credentials
    })
    .then((credentials) => {
      // Do something
    })

    // Attest specific credentials
    uport.attestCredentials({
      sub: THE_RECEIVING_UPORT_ADDRESS,
      claim: {
        CREDENTIAL_NAME: CREDENTIAL_VALUE
      },
      exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    })

    console.log('works');
});


//ML service things setup from here
var did1 ='b76b2426-643b-4001-8574-84038d9845eb/online' ;
var did2 = '';
app.get("/ml",(req,res)=>{
	ml_controller.ml(did1);
	//ml_controller.ml(did2);
});


// load local VCAP configuration  and service credentials
var vcapLocal;
try {
	vcapLocal = require('./vcap-local.json');
	console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
	// Load the Cloudant library.
	var Cloudant = require('cloudant');

	// Initialize database with credentials
	if (appEnv.services['cloudantNoSQLDB']) {
		// CF service named 'cloudantNoSQLDB'
		var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
	} else {
		// user-provided service with 'cloudant' in its name
		var cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
	}

	//database name
	var dbName = 'mydb';

	// Create a new "mydb" database.
	cloudant.db.create(dbName, function(err, data) {
		if(!err) //err if database doesn't already exists
			console.log("Created database: " + dbName);
	});

	// Specify the database we are going to use (mydb)...
	mydb = cloudant.db.use(dbName);
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));





var port = process.env.PORT || 3000
app.listen(port, function() {
	console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

