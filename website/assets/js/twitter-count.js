$(function(){
	if ($("#tweet-form").length != 0) {
		var tweet_length = $("#tweet-form textarea").val().length;
		var remaining = 140 - tweet_length;
		$("#tweet-form .word-count").html(remaining);
		$("#tweet-form textarea").selectRange(tweet_length, tweet_length);

		// Handle tweet character count update
		$("#tweet-form textarea").keyup(function () {
			var remaining = 140 - $(this).val().length;
			$("#tweet-form .word-count").html(remaining);
		});
	}
});