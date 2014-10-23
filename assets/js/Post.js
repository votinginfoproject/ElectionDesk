angular.module('electiondesk').
controller('PostController', function ($scope, $http) {
	// Twitter
	$scope.twitterAccounts = [];
	$scope.twitterAccountSelected = null;
	$scope.twitterErrorMessage = '';
	$scope.twitterPostContent = '';

	$scope.processTwitterForm = function() {
		$scope.twitterErrorMessage = '';

		var parameters = {
			message: $scope.twitterPostContent
		};

		$http({
			method  : 'POST',
			url     : '/tweet/post',
			data    : $.param(parameters),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(data) {
			if (!data.error) {
				$scope.twitterPostContent = '';
				$('#postModal').modal('hide');
			} else {
				$scope.twitterErrorMessage = data.error;
			}
		});
	};

	$scope.loadTwitterAccounts = function() {
		$http.get('/post/twitter').
			success(function (data) {
				$scope.twitterAccounts = data.accounts;
				for (var i = $scope.twitterAccounts.length - 1; i >= 0; i--) {
					if ($scope.twitterAccounts[i].is_primary == 1) {
						$scope.twitterAccountSelected = $scope.twitterAccounts[i];
						break;
					}
				}
			});
	};

	// Facebook
	$scope.facebookPages = [];
	$scope.facebookPageSelected = null;
	$scope.facebookErrorMessage = '';
	$scope.facebookPostContent = '';

	$scope.processFacebookForm = function() {
		$scope.facebookErrorMessage = '';

		var parameters = {
			pages: $scope.facebookPageSelected,
			message: $scope.facebookPostContent
		};

		$http({
			method  : 'POST',
			url     : '/post/facebook',
			data    : $.param(parameters),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(data) {
			if (!data.error) {
				$scope.facebookPostContent = '';
				$('#postModal').modal('hide');
			} else {
				$scope.facebookErrorMessage = data.error;
			}
		});
	};

	$scope.loadFacebookAccounts = function() {
		$http.get('/post/facebook').
			success(function (data) {
				$scope.facebookPages = data.pages;
			});
	};
})
.directive('modalShown', function() {
	return function($scope, $element){
		$element.bind('show.bs.modal', function() {
			$scope.loadTwitterAccounts();
			$scope.loadFacebookAccounts();
		});
	};
});
