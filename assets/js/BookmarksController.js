angular.module('electiondesk').
controller('BookmarksController', function ($scope, $http, InteractionService) {
	$scope.doneLoading = false;

	// Interaction actions
	$scope.bookmark = InteractionService.bookmark;
	$scope.reply = InteractionService.reply;
	$scope.follow = InteractionService.follow;
	$scope.retweet = InteractionService.retweet;

	// Interactions from WebSocket server
	$scope.interactions = [];

	var loadBookmarks = function() {
		$http.get('/trending/bookmarksinteractions').
			success(function (data) {
				angular.forEach(data, function (item) {
					item.bookmarked = true;
				});

				$scope.interactions = data;
				$scope.doneLoading = true;
			});
	};
	loadBookmarks();
}).
filter('bookmarked', function() {
	return function(items) {
		return items.filter(function(element, index, array) {
			return element.bookmarked;
		});
	};
});
