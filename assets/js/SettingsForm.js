var SettingsForm = (function () {
	var geocoder = new google.maps.Geocoder();

	function bindEvents() {
		$('#location-form .btn').click(function () {
			if (navigator.geolocation) {
				// Show loading indicator
				$('#location-form a img').attr('src', $('#location-form a img').attr('src').replace('locateme.png', 'loading.gif'));

				// Get current position
				navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError);
			} else {
				alert('Sorry! Your browser does not support this feature');
			}

			return false;
		});

		$('#location-form').submit(function () {
			if (!$('#loading').is(':visible')) {
				$('#loading').show();

				var address = $('#address').val();
				geocoder.geocode( { 'address': address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$('#lat').val(results[0].geometry.location.lat());
						$('#long').val(results[0].geometry.location.lng());

						// Determine state and county
						$.each(results[0].address_components, function (index, component) {
							if ($.inArray('administrative_area_level_1', component.types) != -1) {
								$('#state').val(component.short_name);
							} else if ($.inArray('administrative_area_level_2', component.types) != -1) {
								$('#county').val(component.long_name);
							}
						});

						$('#location-form').submit();
					} else {
						$('#loading').hide();
						alert('Sorry, there was an error locating your address. Please try again.');
					}
				});

				return false;
			}
		});
	}

	function geoLocationError(message) {
		alert('Could not get your current location: ' + message);
	}

	function geoLocationSuccess(position) {
		var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

		geocoder.geocode( { 'latLng': latlng}, function(results, status) {
			$('#location-form a img').attr('src', $('#location-form a img').attr('src').replace('loading.gif', 'locateme.png'));

			if (status == google.maps.GeocoderStatus.OK) {
				$('#address').val(results[0].formatted_address);
			} else {
				alert('Sorry, there was an error locating your address. Please try again.');
			}
		});
	}

	return {
		init: function () {
			if ($('#location-form').length) {
				bindEvents();
			}
		}
	};
})();

$(SettingsForm.init);
