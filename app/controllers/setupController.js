

var mongoose = require('mongoose')

	, symbol = require('../../app/controllers/symbolController')
	, state = require('../../app/controllers/stateController')

	, Symbol = mongoose.model('Symbol')
	, State = mongoose.model('State')
	, utils = require('../../lib/utils')
	, _ = require('underscore')
	, _this = this;


exports.createSymbols = function(twitter, next) {

	var trackerJSON = require('../../core/tracker');

	//get the length of our question json
	var trackerJSONLength = Object.keys(trackerJSON).length;

	//console.log('setupController: getRawQuestionData: length ' + rawQuestionsJSONLength);
	var symbolsCreated = 0; //as this is async, need to watch for each return function and only continue once ALL
							//symbols have been created


	//loop through the JSON array and create each symbol
	_.each(trackerJSON, function (symbolJSON, i) {

		//console.log(symbolJSON, i);
		symbol.create(i, symbolJSON, function (err) {

			if (err) {
				console.log('setupController: create: ' + err + ': Symbol not saved');
			} else {
				console.log('setupController: create: Symbol saved to collection');
			}
			symbolsCreated++;

			//if we have reached the end of our questions, call our callback
			//which in this case checks the states, and then opens our twitter stream
			if (symbolsCreated === trackerJSONLength) {
				next(_this, twitter.openStream);
			}

		});
	}, this);

};


exports.createStates = function (page, cb) {

	console.log('setupController: createStates: Creating States');

	var stateCheckCounter = 0;

	//first get all the questions
	Symbol.loadAll(function (err, symbols) {

		var symbolsLength = symbols.length;

		console.log('setupController: createStates: Number of Symbols: ' + symbolsLength);

		symbols.forEach(function (s) {
			_this.checkState(s, function (state) {
				stateCheckCounter++;

				if (stateCheckCounter === symbolsLength) {
					cb();
				}
			});
		});
	});
};

exports.checkState = function (symbol, next) {

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
					next(currentState);
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
						next(state);
					}

				});
			}
		});
	});


};

