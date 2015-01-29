
var Duration = {};

var units = [
	{
		names: ['year', 'y'],
		plurals: ['years', 'y'],
		multiple: 45,
		basedOn: 'week'
	},
	{
		names: ['month', 'mn'],
		plurals: ['months', 'mn'],
		multiple: 4,
		basedOn: 'week'
	},
	{
		names: ['week', 'w'],
		plurals: ['weeks', 'w'],
		multiple: 5,
		basedOn: 'day'
	},
	{
		names: ['day', 'd'],
		plurals: ['days', 'd'],
		multiple: 8,
		basedOn: 'h'
	},
	{
		names: ['h', 'hour'],
		plurals: ['h', 'hours'],
		multiple: 60,
		basedOn: 'm'
	},
	{
		names: ['min', 'm', 'minute'],
		plurals: ['min', 'm', 'minutes'],
		size: 60
	}
];
var unitsByName = {}
units.forEach(function (unit) {

	function addName (name) {
		
		unitsByName[name] = unit;
	}

	unit.names.forEach(addName);
	unit.plurals.forEach(addName);
});
units.forEach(function (unit) {

	function findSizeRecursively (unit) {

		return unit.size ||
			unit.multiple *
			findSizeRecursively(unitsByName[unit.basedOn]);
	}

	unit.size = findSizeRecursively(unit);
});


Duration.parse = function (text) {

	text = text.trim();

	// Default is null. (Empty string.)
	var sum = null;
	
	var timePattern = /((\d+)([.,:]))?(\d+)(\s*(years?|y|months?|mn|weeks?|w|days?|d|h|min|m))?\s*,?\s*/g;
	var matches;
	while ((matches = timePattern.exec(text)) != null) {

		var value;
		if (matches[2]) {

			var integer = matches[2];
			var separator = matches[3];
			var decimals = matches[4];

			if (separator == ':') {

				value = parseInt(integer, 10) + parseInt(decimals, 10) / 60;

			} else {

				value = parseFloat(integer+'.'+decimals, 10);
			}

		} else {

			value = parseInt(matches[4], 10);
		}

		var parsedUnit = unitsByName[matches[6] || 'h'];
		if (parsedUnit) {

			sum += value * parsedUnit.size;

		} else {

			// TODO: Return null on invalid data, so the field can show an error.
		}

	}

	return sum;
};


Duration.format = function (seconds) {

	return Duration.formatParts(Duration.splitToParts(seconds));
};


Duration.formatRounded = function (seconds) {

	if (seconds == null) {

		return Duration.formatParts(seconds);
	}

	var parts = Duration.splitToParts(seconds);

	var firstUsedPartIndex;
	for (var i = 0; i < parts.length; i++) {
		
		if (parts[i].value) {

			firstUsedPartIndex = i;
			break;
		}
	}

	var first  = parts[firstUsedPartIndex];
	var second = parts[firstUsedPartIndex + 1];
	var third  = parts[firstUsedPartIndex + 2];

	if (second && third) {

		second.value = Math.round(second.value + third.value / second.unit.multiple);
	}

	var roundedParts = [];
	if (first) {

		roundedParts.push(first);
	}
	if (second) {

		roundedParts.push(second);
	}

	// TODO: Bubble up unit overflows.

	return Duration.formatParts(roundedParts);
};


Duration.formatParts = function (parts) {

	if (!parts) {

		return '';
	}

	var partsWithValue = _.filter(parts, function (part) { return !!part.value; });

	if (!partsWithValue.length) {

		return '0 h';
	}

	return partsWithValue.map(function (duration) {

		return duration.value + ' ' + (duration.value == 1 ? duration.unit.names[0] : duration.unit.plurals[0]);

	}).join(', ');
};


Duration.splitToParts = function (seconds) {

	if (seconds == null) {

		return null;
	}

	var parts = [];
	var left = seconds;

	units.forEach(function (unit) {

		var value = Math.floor(left / unit.size);

		parts.push({value: value, unit: unit});

		left -= value * unit.size;
	});

	return parts;
};
