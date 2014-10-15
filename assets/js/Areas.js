var Areas = (function () {
	var map;
	var drawPolyPoints = new google.maps.MVCArray(),
			drawPolygon,
			drawClickListener,
			drawMarkers = [];

	function initialize() {
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(41.850033, -87.6500523),
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};

		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		for (var i = 0; i < window.COORDS.length; i++) {
			// Construct the polygon.
			var polygon = new google.maps.Polygon({
				paths: window.COORDS[i],
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35
			});

			polygon.setMap(map);
		}
	}

	google.maps.event.addDomListener(window, 'load', initialize);

	function bindEvents() {
		$('#drawbtn').click(function () {
			if ($('#drawbtn').data('editing') === true) {
				var name = prompt('What do you want to call this area?');
				if (name) {
					$('#drawname').val(name);
					var normalizedPoints = [];
					drawPolyPoints.forEach(function (point) {
						normalizedPoints.push({ lat: point.lat(), lng: point.lng() });
					});

					$('#drawpoints').val(JSON.stringify(normalizedPoints));
					$('#draw-form').submit();
				}

				$('#drawcancelbtn').addClass('hide');
				$('#drawbtn')
					.data('editing', false)
					.val('Saving...');
			} else {
				drawPolygon = new google.maps.Polygon({
					strokeColor: '#0000FF',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#0000FF',
					fillOpacity: 0.35
				});
				drawPolygon.setMap(map);
				drawPolygon.setPaths(new google.maps.MVCArray([drawPolyPoints]));

				drawClickListener = google.maps.event.addListener(map, 'click', mapClicked);

				$('#drawcancelbtn').removeClass('hide');
				$('#drawbtn')
					.data('editing', true)
					.val('Save area');
			}
		});

		$('#drawcancelbtn').click(function () {
			google.maps.event.removeListener(drawClickListener);
			drawPolyPoints = new google.maps.MVCArray();
			drawPolygon = null;
			drawMarkers = [];

			$('#drawbtn')
				.data('editing', false)
				.val('Start');
		});

		function mapClicked(event) {
			drawPolyPoints.insertAt(drawPolyPoints.length, event.latLng);

			var marker = new google.maps.Marker({
				position: event.latLng,
				map: map,
				draggable: true
			});
			drawMarkers.push(marker);
			marker.setTitle("#" + drawPolyPoints.length);

			google.maps.event.addListener(marker, 'click', function() {
			marker.setMap(null);
				for (var i = 0, I = drawMarkers.length; i < I && drawMarkers[i] != marker; ++i);
					drawMarkers.splice(i, 1);
					drawPolyPoints.removeAt(i);
				}
			);

			google.maps.event.addListener(marker, 'dragend', function() {
				for (var i = 0, I = drawMarkers.length; i < I && drawMarkers[i] != marker; ++i);
					drawPolyPoints.setAt(i, marker.getPosition());
				}
			);
		}
	}

	return {
		init: function () {
			if ($('body#areas').length) {
				initialize();
				bindEvents();
			}
		}
	};

})();

$(Areas.init);