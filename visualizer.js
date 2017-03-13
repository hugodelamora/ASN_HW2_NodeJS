var express = require("express");
var app = express();
fs = require('fs')

var geoData;

// We begin by loading the data file. As usual, this is done with a callback,
// which either receives an error (e.g., if the file was not found) or the data
// in the file, which we then remember in the 'geoData' variable. Error 34
// is 'file not found'.

/*
fs.readFile('./part-r-00000', 'utf8', function (err,data) {
  if (err) {
    if (err.errno == 34) {
      console.log("Cannot find the file 'part-r-00000' - did you copy it from ");
      console.log("your 'output' directory to the current directory?");
      console.log("Try running 'cp ../output/part-r-00000 .'");
      process.exit(1);
    }
    
    console.log("Cannot read from 'part-r-00000': "+err);
    process.exit(1);
  }
  geoData = data;
});
*/
//In Node.js
//To use the TypeScript definition files within a Node.js project, simply import aws-sdk as you normally would. In a TypeScript file: javascript 
// import entire SDK import AWS = require('aws-sdk'); 
// import AWS object without services import AWS = require('aws-sdk/global'); 
// import individual service import S3 = require('aws-sdk/clients/s3'); In a JavaScript file: javascript 
// import entire SDK var AWS = require('aws-sdk'); 
// import AWS object without services var AWS = require('aws-sdk/global'); 
// import individual service var S3 = require('aws-sdk/clients/s3');

//npm install aws-sdk
//stop and start the service ubuntu@ip-172-31-24-12:~/ASN_HW2_NodeJS$ nodejs visualizer

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
//AWS.config.update({accessKeyId: 'mykey', secretAccessKey: 'mysecret', region: 'myregion'});

if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId)
    throw 'Need to update config.json to specify your access key!';
else
	console.log("HERE WE GO");

// S3 object
var s3 = new AWS.S3();

var params = {
    Bucket: 'ms705203-p2',
   Prefix: 'output2/'
};
/*
s3.listObjects(params, function (err, data) {
  if(err)throw err;
  console.log(data);
  //geoData += data.Body.toString();  // successful response
  
  });
*/
//https://www.exratione.com/2015/05/listing-large-s3-buckets-with-the-aws-sdk-for-node-js/
//http://stackoverflow.com/questions/20207063/how-can-i-delete-folder-on-s3-with-node-js
//http://stackoverflow.com/questions/27299139/read-file-from-aws-s3-bucket-using-node-fs
s3.listObjects(params, function (err, data) {
    if (err)
        throw err;
		
    // Expand the array with all the keys that we have found in the ListObjects function call
    data.Contents.forEach(function(content) {

	new AWS.S3().getObject({ Bucket: 'ms705203-p2', Key: content.Key }, function(err, data)
	{
		if (!err){
	        geoData += data.Body.toString();  // successful response
			//console.log(data.Body.toString());
		}
	});
	}
);
  });
  
/*
s3.listObjects(params, function (err, data) {
    if (err)
        throw err;
    data.Contents.forEach(function (partFile, index) {
        console.log("Processing " + partFile.Key);
        var fileParams = {Bucket: 'ms705203-p2', Key: partFile.Key};
        s3.getObject(fileParams, function (err, data) {
            if (err) {
                console.log(err, err.stack);      // an error occurred
            } else {
                geoData += data.Body.toString();  // successful response
            }
        });
    });
});
*/

// The line below tells Node to include a special header in the response that 
// tells the browser not to cache any files. That way, you do not need to 
// flush the browser's cache whenever you make changes.

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache must-revalidate");
    return next();
  });
};

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// Here we simply say that the page 'index.ejs' should be returned whenever the 
// browser requests the main page (/)

app.get('/', function(req, res){
res.render("index.ejs");
});

// When the browser requests /getGeoData, we return the data we read earlier
// from the file part-r-00000 (the MapReduce output file).

app.get('/getGeoData', function(req, res) {
  var body = geoData;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

// We also have a special 'page' that contains your name, so that it can be 
// displayed on the web page along with the map. This is inteded primarily
// as a sanity check for your grader, in case a file is left in the browser
// cache (we don't want to take points from you for someone else's bugs...)

app.get('/author', function(req, res) {
  var body = "Solution by: Hugo (ms705203)";
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

// Finally, we tell the web server to listen for requests on port 8080,
// and we print a little message to the console to remind the user that
// now it is time to open the main page in the browser.

app.listen(8080);
console.log("Server is running. Now open 'http://localhost:8080' in a browser.");
