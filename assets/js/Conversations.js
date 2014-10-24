var Conversations = (function () {
	var currentConversation = null;

	function reloadConversations() {
		$("#loading").show();
		$("#no-conversations").hide();

		// Remove previous conversations
		$("#conversations-overview").html('');
		$("#conversations-list").html('');

		// Fetch new conversations
		loadConversations();
	}

	function loadConversations() {
		$.get('/conversations/data', function (conversations) {
			$("#loading").hide(); // Remove loading indicator

			if (conversations.error) {
				alert(conversations.error);
				return;
			}

			if (conversations.length <= 0) {
				$("#no-conversations").show();
			}

			var conversation_id = 1;

			$.each(conversations, function (index, conversation) {
				// Find first conversation with a valid message id and any unread messages
				var firstconversation = null;
				var has_unread_messages = false;
				for (var i = 0; i < conversation.list.length; i++) {
					if (conversation.list[i].id) {
						firstconversation = conversation.list[i];
					}

					if (conversation.list[i].is_read === false) {
						has_unread_messages = true;
					}

					if (firstconversation !== null && has_unread_messages) {
						break;
					}
				}

				var lastconversation = conversation.list[conversation.list.length - 1];

				$("#conversations-overview").append(
					'<div class="convo'+ (has_unread_messages ? ' unread' : '') +'" data-id="'+ conversation_id +'" data-username="'+ conversation.user +'" data-messageid="'+ firstconversation.id.$id +'">' +
					'<a href="#">' +
					'	<img src="' + lastconversation.picture + '" class="thumbnail" alt="' + lastconversation.author + '">' +
					'	<p class="time-stamp">Posted ' + lastconversation.reltime + ' ago</p>' +
					'	<h4>' + lastconversation.author + '</h4>' +
					'	<p>' + lastconversation.message + '</p>' +
					'</a>' +
					'</div>'
				);

				var conversationObj = $('<div>');
				conversationObj.addClass("conversation" + conversation_id);
				$("#conversations-list").append(conversationObj);

				$.each(conversation.list, function (index, message) {
					conversationObj.append(
						'<div class="convo"'+ (message.twitter_message_id ? ' data-twittermessageid="'+ message.twitter_message_id +'"' : '') +'>' +
						'	<img src="' + message.picture + '" class="thumbnail" alt="' + message.author + '">' +
						'	<p class="time-stamp">Posted ' + message.reltime + ' ago</p>' +
						'	<h4>' + message.author + '</h4>' +
						'	<p>' + message.message + '</p>' +
						'</div>'
					);
				});

				conversation_id++;
			});

			$(".convo a").unbind('click').click(function () {
				var parent = $(this).parent();

				// Remove unread class from conversation
				parent.removeClass('unread');

				// Hide conversations overview
				$("#conversations-overview").hide();

				// Show the specific conversation
				$("body").attr("id", "conversations-single");
				currentConversation = $("#conversations-list .conversation" + parent.attr("data-id"));
				currentConversation.show();

				// Set messages in conversation as read
				var message_ids = [];
				currentConversation.find(".convo[data-twittermessageid]").each(function () {
					message_ids.push($(this).attr("data-twittermessageid"));
				});
				if (message_ids.length > 0) {
					$.get('/conversations/read_messages', { ids: message_ids.join(',') }, function (data) {
						if (data.status && data.status == 'OK') {
							var obj = $('.unread-messages');

							if (obj.length != -1) {
								var val = parseInt(obj.html());
								var newVal = val - data.changed;

								if (newVal > 0) {
									obj.html(newVal);
								} else {
									obj.hide();
								}
							}
						}
					});
				}

				// Set-up reply form
				prepareReplyForm(parent.attr("data-username"), parent.attr("data-messageid"));

				// Show the go-back button
				$(".go-back").show();
				$(".go-back").unbind('click').click(function () {
					// Show conversations overview
					$("#conversations-overview").show();

					// Hide specific conversations
					$("body").attr("id", "conversations");
					$("#conversations-list > div").hide();

					// Hide the go back button again
					$(".go-back").hide();

					return false;
				});

				return false;
			});
		});
	}

	function prepareReplyForm(username, message_id) {
		$(".reply textarea").val('@' + username + ' ');

		var tweet_length = $(".reply textarea").val().length;
		var remaining = 140 - tweet_length;
		$(".reply .word-count").html(remaining);
		//$(".reply textarea").selectRange(tweet_length, tweet_length);

		// Handle tweet character count update
		$(".reply textarea").keyup(function () {
			var remaining = 140 - $(this).val().length;
			$(".reply .word-count").html(remaining);
		});

		// Get lock for this message
		$(".reply .error").hide();
		/*var messageid = section.attr("data-messageid");
		$.post('/trending/lock', { message_id: messageid }, function(data) {
			if (data.error) {
				$(".reply .error").html(data.error);
				$(".reply .error").slideDown();
			}
		});*/

		// Handle tweet post
		$(".reply").unbind('submit').submit(function () {
			if ($("#saving-reply-indicator").is(':visible')) { // Do nothing if we are already loading
				return;
			}

			var message = $(".reply textarea").val();
			if (message.length > 140) {
				alert('You can not post tweets that exceed 140 characters.');
			} else {
				$("#saving-reply-indicator").show();
				$.post('/tweet/post', { message_id: message_id, message: message }, function(data) {
					$("#saving-reply-indicator").hide();

					if (data.error) {
						alert(data.error);
					} else {
						// Add message to conversation
						currentConversation.append(
							'<div class="convo">' +
							'	<img src="/assets/img/user.png" class="thumbnail" alt="Me">' +
							'	<p class="time-stamp">Posted just now</p>' +
							'	<h4>Me</h4>' +
							'	<p>' + message + '</p>' +
							'</div>'
						);

						// Reset reply form
						prepareReplyForm(username, message_id);
					}
				});
			}

			return false;
		});
	}

	return {
		init: function () {
			if ($('body#conversations').length) {
				loadConversations();
			}
		}
	};
	
})();

$(Conversations.init);