var stream_server = '//'+window.location.host+'/data';
var use_geo_near = false;
var update_interval = 3;

var sources = ['twitter', 'facebook', 'googleplus'];
var current_time;
var filters = [];
var subfilter = '';
var near = null;
var distance;
var is_paused = false;
var used_ids = [];
var default_cookie_settings = {
	expires: 7
}
var feed_stream_loaded = false;

var restoreSession = function() {
	// subfilter
	try {
		var cookie = $.cookie('subfilter');
		if (cookie !== null) {
			setSubFilter(cookie, false);
		}
	} catch (err) {

	}

	// Social media sources
	try {
		var cookie = $.cookie('sources');
		if (cookie !== null) {
			sources = JSON.parse(cookie);
			
			// Turn off elements where needed
			if ($.inArray('twitter', sources) == -1) {
				$(".twitter-toggle").removeClass('on');
				$(".twitter-toggle").addClass('off');
			}
			if ($.inArray('facebook', sources) == -1) {
				$(".facebook-toggle").removeClass('on');
				$(".facebook-toggle").addClass('off');
			}
			if ($.inArray('googleplus', sources) == -1) {
				$(".google-toggle").removeClass('on');
				$(".google-toggle").addClass('off');
			}

			if (sources.length <= 0) {
				$('.alert-message-social').removeClass('hide');
			} else {
				$('.alert-message-social').addClass('hide');
			}
		}
	} catch (err) {

	}

	// Location
	try {
		var cookie = $.cookie('geo');
		if (cookie !== null) {
			var cookieData = JSON.parse(cookie);
			distance = cookieData.distance;
			use_geo_near = cookieData.use_geo_near;

			// Update UI if needed
			if (use_geo_near) {
				$("#distance-select").val(distance);
			}
		}
	} catch (err) {

	}

	// Topics/Filters
	try {
		var cookie = $.cookie('filters');
		if (cookie !== null) {
			filters = JSON.parse(cookie);

			// Visually show enabled filters
			$.each(filters, function (index, filter_id) {
				var elem = $("#filter-" + filter_id);
				if (elem.length != -1) { // If element exists
					elem.attr('checked', true);
				}
			});

			if (filters.length <= 0) {
				$('.alert-message-topics').removeClass('hide');
			} else {
				$('.alert-message-topics').addClass('hide');
			}
		} else {
			// Select the first topic per default
			var checkbox = $(".main-topics input:first");
			checkbox.attr('checked', true);
			filters.push(checkbox.val());
		}
	} catch (err) {

	}
}

var setSubFilter = function(filter, save) {
	// Set default value for save
	if (save === undefined)
		save = true;

	// Require some input
	if (filter.length <= 0) {
		// Show "no filters" message
		$(".filters .no-filters").show();

		_gaq.push(['_trackEvent', 'Filter', 'Delete', subfilter]);
	} else {
		// Make sure no filters message is hidden
		$(".filters .no-filters").hide();

		_gaq.push(['_trackEvent', 'Filter', 'Create', filter]);
	}

	// Clear query field
	$("#filter-form .search-bar").val(filter);

	// Update current filter text
	$(".filters .filter").html((filter.length > 0) ? ('Current filter: ' + filter) : '');

	// Store filters in cookie?
	if (save) {
		$.cookie('subfilter', filter, default_cookie_settings);
	}

	// Store the new filter in local variable
	subfilter = filter;
}

// Poll for new messages in the stream
var updateStream = function() {
	if (!is_paused) {
		// Build URL based on criterias
		var url = stream_server + '/streams?sources=' + sources.join(',') + '&after=' + current_time
			+ '&filters=' + filters.join(',') + '&subfilter=' + encodeURIComponent(subfilter);
		if (use_geo_near && distance != 'area') {
			url += '&near=' + near + '&distance=' + encodeURIComponent(distance);
		}
		current_time += 3; // Increase current time

		// Fetch the messages
		$.get(url, function(data) {
			$.each(data, function (index, message) {
				// Make sure message is not already shown
				if ($.inArray(message._id.$id, used_ids) != -1) {
					return;
				} else {
					used_ids.push(message._id.$id);
				}

				// Make sure message is within geofence (if enabled)
				if (use_geo_near && distance == 'area') {
					var found = false;
					if (message.internal.location) {
						for (var i = 0; i < geofencePolygons.length; i++) {
							if (isPointInPoly(geofencePolygons[i], { x: message.internal.location.coords[0], y: message.internal.location.coords[1] })) {
								found = true;
								break;
							}
						}
					}

					if (!found) {
						return;
					}
				}

				if (!feed_stream_loaded && data.length > 0) {	
					feed_stream_loaded = true;
					
					// Reset feed stream
					$("#feed-stream").html('');
				}

				// Build message and add it to the feed stream
				var section = $('<section>');
				section.addClass('entry');
				section.addClass(message.interaction.type); // twitter or facebook
				section.attr("data-messageid", message._id.$id);

				if (message.interaction.type == 'twitter') {
					section.attr("data-twitterid", message.twitter.id);
				}

				var img = $('<img>');
				img.attr('src', message.interaction.author.avatar);
				img.attr('alt', message.interaction.author.name);
				img.addClass('profile-pic');
				section.append(img);

				var link = $('<a>');
				if (message.interaction.type == 'facebook') {
					link.attr('href', message.interaction.author.link);
				} else {
					link.attr('href', message.interaction.link);
				}
				link.attr('target', '_blank');

				if (message.interaction.type == 'twitter') {
					link.html('@' + message.interaction.author.username);
				} else {
					link.html(message.interaction.author.name);
				}
				section.append(link);

				var paragraph = $('<p>');
				paragraph.html(message.interaction.content);
				section.append(paragraph);
				
				var actions = $('<ul>');
				actions.addClass('actions');

				if (message.interaction.type == 'twitter') {
					actions.append('<li class="follow"><a href="#">Follow</a></li>');
					actions.append('<li class="reply"><a href="#">Reply</a></li>');
					actions.append('<li class="retweet"><a href="#">Retweet</a></li>');
					actions.append('<li class="bookmark"><a href="#">Bookmark</a></li>');
				} else {
					actions.append('<li class="bookmark"><a href="#">Bookmark</a></li>');
				}

				if (message.internal.location && message.internal.location.state) {
					var location;

					if (message.internal.location.county && message.internal.location.county != null) {
						location = message.internal.location.county + ', ' + message.internal.location.state;
					} else {
						location = message.internal.location.state;
					}

					actions.append('<li class="location"><a href="https://maps.google.com/maps?q='+ encodeURIComponent(location) +'">'+ location +'</a></li>');
				}

				section.append(actions);

				$("#feed-stream").prepend(section);
			});

			// Only keep 50 latest messages
			$("#feed-stream section:gt(49)").remove();

			// Only keep last 500 ids
			//if (used_ids.length > 500) used_ids = used_ids.slice(used_ids.length - 500, 500);

			attachButtonEvents(); // Make reply/retweet/etc. buttons clickable
		});
	}

	// Update stream after update_interval
	setTimeout(updateStream, update_interval * 1000);
}

var attachButtonEvents = function () {
	// Follow button
	$(".actions .follow a").unbind('click').click(function () {
		var section = $(this).parent().parent().parent();
		var username = section.find("a").html().substr(1); // Get username but remove '@'

		$.post('/tweet/follow', { username: username }, function(data) {
			if (data.error) {
				alert('Could not follow user: ' + data.error);
			} else {
				alert('You are now following @' + username);
			}
		});

		return false;
	});

	// Retweet button
	$(".actions .retweet a").unbind('click').click(function () {
		var section = $(this).parent().parent().parent();
		var messageid = section.attr("data-twitterid");

		$.post('/tweet/retweet', { message_id: messageid }, function(data) {
			if (data.error) {
				alert('Could not retweet message: ' + data.error);
			} else {
				alert('Message retweeted');
			}
		});

		return false;
	});

	// Bookmark message button
	$(".actions .bookmark a").unbind('click').click(function () {
		var section = $(this).parent().parent().parent();
		var messageid = section.attr("data-messageid");
		
		if (!section.hasClass('bookmarked')) {
			section.addClass('bookmarked');

			$.post('/trending/bookmark', { message: messageid }, function(data) {
				if (data.error) {
					section.removeClass('bookmarked');
					alert('Could not bookmark message: ' + data.error);
				}
			});					
		} else {
			section.removeClass('bookmarked');

			$.post('/trending/unbookmark', { message: messageid }, function(data) {
				if (data.error) {
					if (data.error != 'You cannot remove a bookmark that is not bookmarked.') {
						section.addClass('bookmarked');
						alert('Could not unbookmark message: ' + data.error);
					}
				}
			});					
		}

		return false;
	});

	// Reply to tweet button
	$(".actions .reply a").unbind('click').click(function () {
		var section = $(this).parent().parent().parent();

		// Insert name of user
		var twitter_username = section.find('a').html();
		$("#response h2 .username").html(twitter_username);

		// Remove old message and add the new message
		$("#response section").remove();
		$("#response").append(section.clone());

		$("#response").show();
		$("#response .error").hide();

		attachButtonEvents(); // Make reply/retweet/etc. buttons clickable

		// If the tweet form exists
		if ($("#tweet-form").length != 0) {
			$("#tweet-form textarea").val(twitter_username + ' ');
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

		// Get lock for this message
		var messageid = section.attr("data-messageid");
		$.post('/trending/lock', { message_id: messageid }, function(data) {
			if (data.error) {
				$("#response .error").html(data.error);
				$("#response .error").slideDown();
			}
		});	

		return false;
	});
}

var isPointInPoly = function(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}


$(function() {
	// Save location in the near variable if needed
	if (near == null) {
		near = $("#distance-select").attr("data-location");
	}

	// Restore the session from cookie data if available
	restoreSession();

	// Implement filter form
	$("#filter-form").submit(function () {
		var query = $("#filter-form .search-bar").val();
		setSubFilter(query);

		return false;
	});

	$("#filter-form .reset").click(function () {
		setSubFilter('');

		return false;
	});

	// Get the start time
	$.get(stream_server + '/time', function(data) {
		current_time = data.current_time.unix - update_interval - 60;
		updateStream();
	});

	// Filter/topics checkboxes
	$(".main-topics input").click(function () {
		var filter_id = $(this).val();

		if ($(this).is(':checked')) {
			filters.push(filter_id);
		} else {
			var index = filters.indexOf(filter_id);
			if (index != -1) filters.splice(index, 1);
		}


		if (filters.length <= 0) {
			$('.alert-message-topics').removeClass('hide');
		} else {
			$('.alert-message-topics').addClass('hide');
		}

		$.cookie('filters', JSON.stringify(filters), default_cookie_settings);

		_gaq.push(['_trackEvent', 'Topic', $(this).is(':checked') ? 'Checked' : 'Unchecked', filter_id]);
	});

	// Distance selector dropdown
	$('#distance-select').change(function() {
		var val = $(this).val();

		if (val == 'all') {
			use_geo_near = false; // Disable geo filtering
		} else {
			// Set the selected distance
			distance = val;

			// Make sure that geo filtering is enabled
			use_geo_near = true;
		}

		// Save location settings
		$.cookie('geo', JSON.stringify({
			distance: distance,
			use_geo_near: use_geo_near
		}), default_cookie_settings);
	});

	// Source buttons
	$(".feed-controls a").click(function () {
		// Play/Pause buttons?
		if ($(this).hasClass('pause') || $(this).hasClass('play')) {
			var playButton = $(".feed-controls a.play");
			var pauseButton = $(".feed-controls a.pause");
			var loading = $("#loading");

			if ($(this).hasClass('pause') && !is_paused) {
				pauseButton.removeClass('off');
				pauseButton.addClass('on');

				playButton.removeClass('on');
				playButton.addClass('off');

				if (loading.length != -1) {
					loading.hide();
				}
			} else if ($(this).hasClass('play') && is_paused) {
				playButton.removeClass('off');
				playButton.addClass('on');

				pauseButton.removeClass('on');
				pauseButton.addClass('off');

				if (loading.length != -1) {
					loading.show();
				}
			}

			is_paused = !is_paused; // Toggle is_paused
		} else { // Stream source buttons?
			var source = $(this).html().toLowerCase();
			source = source.replace('+', 'plus'); // For Google Plus

			if ($(this).hasClass('off')) {
				$(this).removeClass('off');
				$(this).addClass('on');

				sources.push(source);
			} else {
				$(this).removeClass('on');
				$(this).addClass('off');

				var index = sources.indexOf(source);
				if (index != -1) sources.splice(index, 1);
			}

			if (sources.length <= 0) {
				$('.alert-message-social').removeClass('hide');
			} else {
				$('.alert-message-social').addClass('hide');
			}

			// Store filters in cookie
			$.cookie('sources', JSON.stringify(sources), default_cookie_settings);
		}

		return false;
	});

	// Handle tweet post
	$("#tweet-form").submit(function () {
		var message = $("#tweet-form textarea").val();
		var message_id = $("#response section").attr("data-messageid");
		var tweet_id = $("#response section").attr("data-twitterid");

		if (message.length > 140) {
			alert('You can not post tweets that exceed 140 characters.');
		} else {
			$.post('/tweet/post', { message_id: message_id, tweet_id: tweet_id, message: message }, function(data) {
				if (data.error) {
					alert(data.error);
				} else {
					$("#response").hide();
				}
			});
		}

		return false;
	});

	// Handle switching of Twitter account
	$("#accountswitcher").change(function () {
		var select = $(this);
		select.attr('disabled', 'disabled');
		$.get('/settings/select_primary?id=' + select.val(), function () {
			select.removeAttr('disabled');
		});
	});
});
