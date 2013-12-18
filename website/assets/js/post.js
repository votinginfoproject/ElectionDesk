$(function(){

	// Handle tweet post
	$("#tweet-form").submit(function () {
		var message = $("#tweet-form textarea").val();
		//var message_id = $("#response section").attr("data-messageid");
		//var tweet_id = $("#response section").attr("data-twitterid");

		if (message.length > 140) {
			alert('You can not post tweets that exceed 140 characters.');
		} else {
			$.post('/tweet/post', { message: message }, function(data) {
				if (data.error) {
					alert(data.error);
				} else {
					$("#post-success").css('display', 'block');
					$("#tweet-form textarea").val('');
				}
			});
		}

		return false;
	});
	
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