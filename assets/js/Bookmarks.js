angular.module('electiondeskBookmarks', [
	'timeRelative'
]).
factory('dataService', ['$http', function ($http) {
    return {
        getJson: function () {
            return $http.get('/trending/bookmarksinteractions');
        }
    };
}]).
value('modelService', []).
controller('BookmarksController', function ($scope, dataService, modelService) {
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
	$scope.interactions = modelService;

	dataService.getJson().then(
		function (res) {
			angular.forEach(res.data, function (item) {
				item.bookmarked = true;
			});
			
			angular.copy(res.data, modelService);
		}, 
		function() {
			alert('Could not load bookmarks');
		}
	); 
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
});
