

var mongoose = require('mongoose')
	, Promise = require('es6-promise').Promise

	, symbol = require('../../app/controllers/symbolController')
	, state = require('../../app/controllers/stateController')

	, Symbol = mongoose.model('Symbol')
	, State = mongoose.model('State')
	, utils = require('../../lib/utils')
	, _ = require('underscore')
	, _this = this;

//returns a promise which resolves when the JSON is recieved by the function
exports.getJSON = function (url) {
	return new Promise(function (resolve, reject) {
		var tempJSON = require(url);
		resolve(tempJSON);
	});
};

exports.createSymbols = function(twitter) {

	return new Promise(function (resolve, reject) {

		_this.getJSON('../../core/tracker').then(function (response) {

			//create an array of promises for our symbols
			var symbolPromises = [];

			//loop through the JSON array and create each symbol
			_.each(response, function (symbolJSON, i) {
				symbolPromises.push(symbol.create(i, symbolJSON));
			});

			return Promise.all(
				symbolPromises
			);
		})
		.catch(function(err) {
			reject(err);
		})
		.then(function () {
			resolve();
		})

	});

};


exports.createStates = function () {

	return new Promise(function (resolve, reject) {

		console.log('setupController: createStates: Creating States');

		//first get all the questions
		Symbol.loadAll(function (err, symbols) {

			var symbolsLength = symbols.length;

			console.log('setupController: createStates: Number of Symbols: ' + symbolsLength);

			symbols.forEach(function (s) {
				console.log('BOO');
				_this.checkState(s, function (state) {
					resolve();
				});
			});
		});

	});
};

exports.checkState = function (symbol) {

	var hashtagLength = symbol.hashtags.length,
		stateCheckCounter = 0;;

	_.each(symbol.hashtags, function (value, key) {

		console.log('setupController: checkState: Checking state for ' + value.tagname);

		State.load(value._id, 'today', function (err, currentState) {

			stateCheckCounter++;

			//if we can find state, great
			if (currentState) {
				console.log('setupController: checkState: State found for ' +  value.tagname);
				if (stateCheckCounter === hashtagLength) {
					return currentState;
				}

			//else create a state in the DB and set to zero
			} else {
				console.log('setupController: checkState: State not found, so creating state myself', value.tagname);

				state.create(value, function (err) {

					if (err) {
						console.log('setupController: checkState: ' + err + ': state not saved\n');
					} else {
						console.log('setupController: checkState: State saved to collection\n');
					}

					if (stateCheckCounter === hashtagLength) {
						return state;
					}

				});
			}
		});
	});


};

