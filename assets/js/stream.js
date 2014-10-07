var electiondeskStream = angular.module('electiondeskStream', [
	'btford.socket-io',
	'timeRelative',
	'ui.bootstrap-slider'
]).
factory('socket', function (socketFactory) {
	return socketFactory({
		ioSocket: io.connect('http://' + window.location.host + ':4242')
	});
}).
controller('StreamController', function ($scope, socket) {
	socket.forward(['update', 'hello'], $scope);

	$scope.streamIsActive = true;

	$scope.topicQuery = {
		6: true,
		7: true,
		8: true,
		9: true,
		10: true
	};

	$scope.sourceQuery = {
		'facebook': true,
		'twitter': true,
		'googleplus': true,
		'wordpress': true,
		'disqus': true
	};

	$scope.togglePause = function () {
		var icon = $('#feed_paused_label').find('i');
		if (!$scope.streamIsActive) {
			icon.removeClass('fa-pause').addClass('fa-play');
		} else {
			icon.removeClass('fa-play').addClass('fa-pause');
		}
	};

	$scope.limitQuery = 'all';
	$scope.radiusQuery = {};
	$scope.radiusQuery.val = 20;
	$scope.radiusQuery.formatter = function(value) {
		return value + ' miles';
	};
	$scope.radiusQuery.changed = function () {
		$scope.limitQuery = 'radius';
	};

	$scope.interactions = [];

	$scope.$on('socket:update', function(ev, data) {
		if ($scope.streamIsActive) {
			var json = JSON.parse(data);
			
			// Take care of slight time differences so interactions won't
			// look like they come from the future
			var unixTime = new Date().getTime() / 1000;
			if (json.interaction.created_at.sec > unixTime) {
				json.interaction.created_at.sec = unixTime;
			}

			$scope.interactions.push(json);
		}
	});

	// Ask the server to send us all recent interactions
	$scope.$on('socket:hello', function(ev, data) {
		socket.emit('dump');
	});
}).
filter('topicfilter', function() {
	return function(items, topics) {
		if (!topics) {
			return [];
		}

		var activeTopics = [];
		angular.forEach(topics, function (active, source) {
			if (active) {
				activeTopics.push(parseInt(source));
			}
		});

		return items.filter(function(element, index, array) {
			return (activeTopics.indexOf(element.internal.filter_id) != -1);
		});
	};
}).
filter('sourcefilter', function() {
	return function(items, sources) {
		if (!sources) {
			return [];
		}

		var activeSources = [];
		angular.forEach(sources, function (active, source) {
			if (active) {
				activeSources.push(source);
			}
		});

		return items.filter(function(element, index, array) {
			return (activeSources.indexOf(element.interaction.type) != -1);
		});
	};
}).
filter('limitfilter', function() {
	return function(items, limit, radiusVal) {
		if (!limit || limit == 'all') {
			return items;
		}

		if (limit == 'state') {
			var userState = $('#limit_state').data('state');

			return items.filter(function(element, index, array) {
				return (typeof(element.internal.location) != 'undefined' && element.internal.location.state == userState);
			});

		} else if (limit == 'radius') {
			var userLocation = {
				latitude: $('#limit_radius').data('lat'),
				longitude: $('#limit_radius').data('lon')
			};

			return items.filter(function(element, index, array) {
				if (typeof(element.internal.location) == 'undefined' || element.internal.location.coords[0] === 0 || element.internal.location.coords[1] === 0) {
					return false;
				}

				var interactionLocation = {
					latitude: element.internal.location.coords[1],
					longitude: element.internal.location.coords[0]
				};

				var distance = haversine(userLocation, interactionLocation, { unit: 'mile' });
				return (distance <= radiusVal);
			});
		}
	};
}).
/*filter('contentfilter', function() {
	return function(items, query) {
		if (!query) {
			return items;
		}

		return items.filter(function(element, index, array) {
			if (typeof element.interaction.content == 'undefined' || !element.interaction.content) {
				return false;
			}

			return (element.interaction.content.search(new RegExp(query, 'i')) != -1);
		});
	};
}).*/
filter('orderByCreated', function() {
	return function(items, reverse) {
		var filtered = [];
		angular.forEach(items, function(item) {
			filtered.push(item);
		});
		filtered.sort(function (a, b) {
			return (a.interaction.created_at.sec < b.interaction.created_at.sec ? 1 : -1);
		});

		if (reverse) filtered.reverse();
		return filtered;
	};
});
