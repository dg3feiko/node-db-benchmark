/**
 * Created by FeikoLai on 2/4/15.
 */
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

MongoClient.connect("mongodb://192.168.59.103:27017/", function (err, db) {

	console.log("Connected correctly to server");
	var collection = db.collection('benchmark');

	var docs = [];

	for (var i = 0; i < 10000; i++) {
		(function (index) {
			docs.push({_id: index, randomNumber: Math.floor(Math.random() * 10000)});
		})(i)
	}

	var count = 0;
	async.whilst(
		function () {
			return count < 10000;
		},
		function (callback) {
			var docs = [];

			for (var i = count; i < count + 1000; i++) {
				(function (index) {
					docs.push({_id: index, randomNumber: Math.floor(Math.random() * 10000)});
				})(i)
			}

			count = count+1000;

			collection.insert(docs, callback);

		},
		function (err) {
			console.error(err);
			db.close();
		}
	)


});