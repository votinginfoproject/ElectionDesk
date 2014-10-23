angular.module('electiondesk').
factory('socket', function (socketFactory) {
	var hostname = window.location.host;
	if (hostname.indexOf('local')) {
		hostname = 'stage.electiondesk.us';
	}

	return socketFactory({
		ioSocket: io.connect('http://' + hostname + ':4242')
	});
}).
controller('StreamController', function ($scope, $http, $modal, socket, notify) {
	socket.forward(['update', 'hello'], $scope);

	// Modal
	$scope.reply = function (interaction) {
		var modalInstance = $modal.open({
			templateUrl: 'replyModalContent.html',
			controller: 'ReplyModalInstanceController',
			resolve: {
				interaction: function () {
					return interaction;
				}
			}
		});
	};

	$scope.follow = function (interaction) {
		$http({
			method  : 'POST',
			url     : '/tweet/follow',
			data    : $.param({ username: interaction.interaction.author.username }),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(data) {
			if (data.error) {
				notify({ message: 'Could not follow user: ' + data.error, classes: 'alert-danger' });
			} else {
				notify({ message: 'You are now following @' + interaction.interaction.author.username, classes: 'alert-success' });
			}
		});
	};

	$scope.retweet = function (interaction) {
		$http({
			method  : 'POST',
			url     : '/tweet/retweet',
			data    : $.param({ message_id: interaction.twitter.id_str || interaction.twitter.id }),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(data) {
			if (data.error) {
				notify({ message: 'Could not follow user: ' + data.error, classes: 'alert-danger' });
			} else {
				notify({ message: 'Retweet successful', classes: 'alert-success' });
			}
		});
	};

	// Filters
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
		if (value === 1000) {
			value = '1,000';
		}

		return value + ' miles';
	};
	$scope.radiusQuery.changed = function () {
		$scope.limitQuery = 'radius';
	};

	// Interaction actions
	$scope.bookmark = function(interaction) {
		var messageId = interaction._id.$id;
		
		if (interaction.bookmarked) {
			$http({
				method: 'POST',
				url: '/trending/unbookmark',
				data: $.param({ message: messageId }),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(function(data) {
				if (data.error) {
					if (data.error != 'You cannot remove a bookmark that is not bookmarked.') {
						alert('Could not unbookmark message: ' + data.error);
					}
				} else {
					interaction.bookmarked = false;
				}
			});
		} else {
			$http({
				method: 'POST',
				url: '/trending/bookmark',
				data: $.param({ message: messageId }),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(function(data) {
				if (data.error) {
					alert('Could not bookmark message: ' + data.error);
				} else {
					interaction.bookmarked = true;
				}
			});
		}
	};

	// Interactions from WebSocket server
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

			if (typeof window.STREAM.bookmarks[json._id.$id] !== 'undefined') {
				json.bookmarked = true;
			} else {
				json.bookmarked = false;
			}

			$scope.interactions.push(json);
		}
	});

	// Ask the server to send us all recent interactions
	$scope.$on('socket:hello', function(ev, data) {
		socket.emit('dump');
	});
}).
controller('ReplyModalInstanceController', function ($scope, $modalInstance, $http, interaction) {
	$scope.twitterAccounts = [];
	$scope.twitterAccountSelected = null;
	$scope.interaction = interaction;
	$scope.errorMessage = '';
	$scope.twitterMessage = '@' + interaction.interaction.author.username + ' ';

	$scope.loadTwitterAccounts = function() {
		$http.get('/post/twitter').
			success(function (data) {
				$scope.twitterAccounts = data.accounts;
				for (var i = $scope.twitterAccounts.length - 1; i >= 0; i--) {
					if ($scope.twitterAccounts[i].is_primary == 1) {
						$scope.twitterAccountSelected = $scope.twitterAccounts[i].id;
						break;
					}
				}
			});
	};
	$scope.loadTwitterAccounts();

	$scope.processForm = function() {
		$scope.errorMessage = '';

		var parameters = {
			message_id: $scope.interaction._id.$id,
			tweet_id: $scope.interaction.twitter.id_str || $scope.interaction.twitter.id,
			message: $scope.twitterMessage,
			account_id: $scope.twitterAccountSelected
		};

		$http({
			method  : 'POST',
			url     : '/tweet/post',
			data    : $.param(parameters),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(data) {
			if (!data.error) {
				$modalInstance.close();
			} else {
				$scope.errorMessage = data.error;
			}
		});
	};

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
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
			return (activeTopics.indexOf(parseInt(element.internal.filter_id)) != -1);
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
		} else if (limit == 'custom') {
			/* jshint ignore:start */
			var isPointInPoly = function(poly, pt) {
				for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
					((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
					&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
					&& (c = !c);
					return c;
			};
			/* jshint ignore:end */

			return items.filter(function(element, index, array) {
				if (typeof(element.internal.location) == 'undefined' || element.internal.location.coords[0] === 0 || element.internal.location.coords[1] === 0) {
					return false;
				}

				for (var i = 0; i < window.STREAM.geofencePolygons.length; i++) {
					if (isPointInPoly(window.STREAM.geofencePolygons[i], { x: element.internal.location.coords[0], y: element.internal.location.coords[1] })) {
						return true;
					}
				}

				return false;
			});
		}
	};
}).
filter('contentfilter', function() {
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
}).
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
}).
filter('summarify', function() {
	return function(val) {
		if (val.length > 140) {
			return val.substr(0, 140-3) + '...';
		} else {
			return val;
		}
	};
});
