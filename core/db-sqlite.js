
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var express = require('express')
	//, Question = mongoose.model('Question')
	//, page = require('../app/controllers/pageController')
	, pkg = require('../package.json')

	, sqlite3 = require('sqlite3').verbose()
	, fs = require("fs")
	, file = 'worldcup.db'
	, exists = fs.existsSync(file)
	, db;

if (!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
} else {
	console.log('DB file already exists');
}

module.exports = function (app, config) {

	db = new sqlite3.Database(file);

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function callback () {
		// yay!
		console.log('Connnected to DB\n');

		//creates our questions in the db (if we haven't already)
		//then check if a state has been initialised for each question for today
		//and then after all that we open our twitter stream
		//page.createQuestions(twitter, page.createStates);

	});

	return db;
}


