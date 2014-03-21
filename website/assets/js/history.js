var stream_server = '//'+window.location.host+'/data';
var use_geo_near = false;

var sources = ['twitter', 'facebook', 'googleplus'];
var filters = [];
var near = null;
var distance;
var default_cookie_settings = {
	expires: 7
};

var restoreSession = function() {
	// Social media sources
	try {
		var cookie = $.cookie('history_sources');
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
		}
	} catch (err) {

	}

	// Location
	try {
		var cookie = $.cookie('history_geo');
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
		var cookie = $.cookie('history_filters');
		if (cookie !== null) {
			filters = JSON.parse(cookie);

			// Visually show enabled filters
			$.each(filters, function (index, filter_id) {
				var elem = $("#filter-" + filter_id);
				if (elem.length != -1) { // If element exists
					elem.attr('checked', true);
				}
			});
		} else {
			// Select the first topic per default
			var checkbox = $(".main-topics input:first");
			checkbox.attr('checked', true);
			filters.push(checkbox.val());
		}
	} catch (err) {

	}
}

// Poll for new messages in the stream
var updateStream = function() {
	var query = $("#filter-form .search-bar").val();
	var after = $('#from_date').val();
	var before = $('#to_date').val();

	// Require before and after to be set
	if (before.length <= 0 || after.length <= 0) {
		return;
	}

	var sourcesStr = sources.join(',');
	if (sources.length <= 0) {
		sourcesStr = 'all';
	}

	// Build URL based on criterias
	var url = stream_server + '/streams?sources=' + sourcesStr + '&after=' + encodeURIComponent(after)
		+ '&before=' + encodeURIComponent(before) + '&filters=' + filters.join(',') + '&subfilter=' + encodeURIComponent(query);
	if (use_geo_near && distance != 'area') {
		url += '&near=' + near + '&distance=' + encodeURIComponent(distance);
	}

	$("#feed-stream section").remove();
	$('#loading').show();
	$('#results').hide();

	// Fetch the messages
	$.get(url, function(data) {
		$('#loading').hide();
		$('#results').show().html(((data.length >= 500) ? '500+' : data.length) + ' results');

		if (data.length <= 0) {
			alert('No results, please try a less specific query.');
		}

		$.each(data, function (index, message) {
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

			var timestamp = $('<time>')
				.attr('datetime', message.interaction.created_at)
				.attr('pubdate', 'pubdate')
				.html(moment(message.interaction.created_at).format('LLL'));
			section.append(timestamp);

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

			// Remove profile pictures that no longer exists
			section.find('img').error(function () {
				$(this).remove();
			});

			$("#feed-stream").append(section);
		});

		attachButtonEvents();
	});
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
		updateStream();

		return false;
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

		$.cookie('history_filters', JSON.stringify(filters), default_cookie_settings);
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
		$.cookie('history_geo', JSON.stringify({
			distance: distance,
			use_geo_near: use_geo_near
		}), default_cookie_settings);
	});

	// Source buttons
	$(".feed-controls a").click(function () {
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

		// Store filters in cookie
		$.cookie('history_sources', JSON.stringify(sources), default_cookie_settings);

		return false;
	});
});
