/*$(function () {
	$('#radius').slider({
		formatter: function(value) {
			return value + ' miles';
		}
	});
});*/

var electiondeskStream = angular.module('electiondeskStream', [
	'btford.socket-io',
	'timeRelative',
	'ui.bootstrap-slider'
]).
factory('socket', function (socketFactory) {
	return socketFactory({
		ioSocket: io.connect('http://electiondesk.local:4242')
	});
}).
controller('StreamController', function ($scope, socket) {
	socket.forward(['update', 'hello'], $scope);

	$scope.sourceQuery = {
		'facebook': true,
		'twitter': true,
		'googleplus': true,
		'wordpress': true,
		'disqus': true
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
		var json = JSON.parse(data);
		
		// Take care of slight time differences so interactions won't
		// look like they come from the future
		var unixTime = new Date().getTime() / 1000;
		if (json.interaction.created_at.sec > unixTime) {
			json.interaction.created_at.sec = unixTime;
		}
		$scope.interactions.push(json);
	});

	$scope.$on('socket:hello', function(ev, data) {
		socket.emit('dump');
	});
}).
filter('sourcefilter', function() {
	return function(items, sources) {
		if (!sources) {
			return items;
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
