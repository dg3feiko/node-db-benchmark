/**
 * Created by FeikoLai on 2/4/15.
 */
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = require('url');
var async = require('async');

var cluster = require('cluster');
if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < 8; i++) {
		cluster.fork();
	}
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.pid + ' died');
	});
} else {
	var collection;
	app.get('/json', function (req, res) {
		res.json({"message":"Hello, World!"});
	});

	app.get('/db', function (req, res) {

		var values = url.parse(req.url, true);
		var queries = values.query.queries || 1;
		var queryFunctions = new Array(queries);

		for (var i = 0; i < queries; i += 1) {
			queryFunctions[i] = function mongodbDriverQuery(callback) {
				collection.findOne({_id: Math.floor(Math.random() * 10000)}, function (err, world) {
					callback(err, world);
				});
			};
		}

		res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});

		async.parallel(queryFunctions, function(err, results) {
			if (queries == 1) {
				results = results[0];
			}
			res.end(JSON.stringify(results));
		});
	});


	MongoClient.connect("mongodb://192.168.59.103:27017/", function (err, db) {
		collection = db.collection('benchmark');
		console.log('db connected');
	});

	var server = app.listen(8080, function () {
		console.log('server started');
	});
}


