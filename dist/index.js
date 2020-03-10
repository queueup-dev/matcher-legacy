'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var escapeStringRegexp = require('escape-string-regexp');

var reCache = new Map();

function makeRe(pattern, options) {
	options = Object.assign({
		caseSensitive: false
	}, options);
	var cacheKey = pattern + JSON.stringify(options);

	if (reCache.has(cacheKey)) {
		return reCache.get(cacheKey);
	}

	var negated = pattern[0] === '!';

	if (negated) {
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');
	var re = new RegExp("^" + pattern + "$", options.caseSensitive ? '' : 'i');
	re.negated = negated;
	reCache.set(cacheKey, re);
	return re;
}

module.exports = function (inputs, patterns, options) {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError("Expected two arrays, got " + _typeof(inputs) + " " + _typeof(patterns));
	}

	if (patterns.length === 0) {
		return inputs;
	}

	var firstNegated = patterns[0][0] === '!';
	patterns = patterns.map(function (x) {
		return makeRe(x, options);
	});
	var ret = [];

	for (var _iterator = inputs, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
		var _ref;

		if (_isArray) {
			if (_i >= _iterator.length) break;
			_ref = _iterator[_i++];
		} else {
			_i = _iterator.next();
			if (_i.done) break;
			_ref = _i.value;
		}

		var input = _ref;
		// If first pattern is negated we include everything to match user expectation
		var matches = firstNegated;

		for (var _iterator2 = patterns, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
			var _ref2;

			if (_isArray2) {
				if (_i2 >= _iterator2.length) break;
				_ref2 = _iterator2[_i2++];
			} else {
				_i2 = _iterator2.next();
				if (_i2.done) break;
				_ref2 = _i2.value;
			}

			var pattern = _ref2;

			if (pattern.test(input)) {
				matches = !pattern.negated;
			}
		}

		if (matches) {
			ret.push(input);
		}
	}

	return ret;
};

module.exports.isMatch = function (input, pattern, options) {
	var re = makeRe(pattern, options);
	var matches = re.test(input);
	return re.negated ? !matches : matches;
};
