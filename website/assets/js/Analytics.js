var Analytics = (function () {

	function renderConsumingChart() {
		var margin = {top: 20, right: 80, bottom: 30, left: 50},
		    width = $('main > .container').width() - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var parseDate = d3.time.format("%Y-%m-%d").parse;

		var x = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.count); });

		var svg = d3.select("#consumingChart").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.json("/admin/consumingstats", function(error, data) {
		  renderCounts(data.counts);
		  color.domain(data.interaction_types);

		  data.timeseries.forEach(function(d) {
		    d.date = parseDate(d.date);
		  });

		  var labels = color.domain().map(function(name) {
		    return {
		      name: name,
		      values: data.timeseries.map(function(d) {
		      	return { date: d.date, count: +d[name] };
		      })
		    };
		  });

		  x.domain(d3.extent(data.timeseries, function(d) { return d.date; }));

		  y.domain([
		    d3.min(labels, function(c) { return d3.min(c.values, function(v) { return v.count; }); }),
		    d3.max(labels, function(c) { return d3.max(c.values, function(v) { return v.count; }); })
		  ]);

		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Count");

		  var label = svg.selectAll(".label")
		      .data(labels)
		    .enter().append("g")
		      .attr("class", "label");

		  label.append("path")
		      .attr("class", "line")
		      .attr("d", function(d) { return line(d.values); })
		      .style("stroke", function(d) { return color(d.name); });

		  label.append("text")
		      .attr("x", width - 50)
		      .attr("y", function(d, i) { return i * 20; })
		      .text(function(d) { return '█ ' + ucfirst(d.name); })
		      .style("fill", function(d) { return color(d.name); })
		      .style("font-family", 'Open Sans, sans-serif')
		      .style("font-weight", 'bold');
		});
	}

	function renderCounts(counts) {
		for (var interactionType in counts) {
			var count = counts[interactionType];

			var iconName = (interactionType == 'disqus' ? 'icon-disqus-social' : 'fa fa-' + interactionType.replace('plus', '-plus'));

			var icon = $('<i>').addClass('' + iconName + ' fa-4x text-primary');
			var title = $('<h1>').html(count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

			var statBox = $('<div>')
				.addClass('col-md-' + Math.floor(12 / Object.keys(counts).length) + ' well text-center')
				.append(icon)
				.append(title)
				.append(ucfirst(interactionType));

			$('#consumingStats').append(statBox);
		}
	}

	function ucfirst(value){
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	return {
		init: function () {
			renderConsumingChart();
		}
	};

})();

$(Analytics.init);