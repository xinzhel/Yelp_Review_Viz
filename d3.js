

var margin = { left:80, right:20, top:50, bottom:100 };
var height = 400 - margin.top - margin.bottom, 
    width = 500 - margin.left - margin.right;

var g_bar = d3.select("#bar-chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
    	.attr("id", "g_bar")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");



var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");



var g_map = d3.select("#map-area")
    .append("div")
        .style("width", "360px")
        .style("height", "400px")
        .attr('id', "mapid");

var g_wc = d3.select("#word-cloud")
	.append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
    	.attr('class','wordcloud')
        .attr("transform", "translate(" + 220 + 
            ", " + 120+ ")");




//initialize maps
var map = L.map('mapid',{boxZoom: true}).setView([36.1699, -115.1398], 11);
tileURL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'
L.tileLayer(tileURL, {
    //attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic2VyZ2lvbGkiLCJhIjoiY2p3OGwxYTBrMnFkbjQ5cGd0enZ4ZnF4cSJ9.je4IvHZrULB4k8mq0SoVxQ'
	}).addTo(map);
// color for markers on map
function getColor(d) {
        return d == 1 ? '#d73027' :
               d == 1.5  ? '#C94B05' :
               d == 2  ? '#B85E00' :
               d == 2.5  ? '#A56E00' :
               d == 3   ? '#8F7A00' :
               d == 3.5   ? '#798400' :
               d == 4   ? '#618C14' :
               d == 4.5   ? '#459334' :
                          '#1a9850';
}
// add legend on map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];

        labels.push(
            '<i style="background:' + getColor(from) + '"></i> ' +
            from);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);




// initialize global variables
var aData;
var category = "all";
var minimumRate = 1;
var filterData;
var circleLayer = L.layerGroup().addTo(map);

// initialize plot
d3.csv("data/business1.csv", function(error, data) {
	if (error) throw error;
	aData = data;
	filterData = data;
	bar1_plot(aData);
	graph_plot_fc(aData);
	marker_plot_fc(aData);

});



// PLOT
// 1. make a bar graph
function bar1_plot(data){
	
	var cuisine_reviews = d3.nest()
	  .key(function(d) { return d.category;})
	  .rollup(function(d) { 
	   return d3.mean(d, function(g) {return +g.review_count; });
	  }).entries(data);


	cuisine_reviews.forEach(function(d) {
		d.category = d.key;
		d.review_count = d.value.toFixed(2);
		// cuisine_stars.forEach(function(d1){
		// 	if (d1["key"]===d.key) {
		// 		d.stars = d1.value.toFixed(2);
		// 	}

		// })
	});


	// Labels
	var yLabel = g_bar.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -40)
	    .attr("x", -170)
	    .attr("font-size", "20px")
	    .attr("text-anchor", "middle")
	    .text("Average Review Amount")

	 // X Scale
    var x = d3.scaleBand()
        .domain(cuisine_reviews.map(function(d){ return d.category }))
        .range([0, width])
        .padding(0.2);

    // Y Scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(cuisine_reviews, function(d) { return +d.review_count })])
        .range([height, 0]);

    // X Axis
    var xAxisCall = d3.axisBottom(x);
    g_bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")")
        .call(xAxisCall)
        .selectAll("text")	
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");;

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return d; });
    g_bar.append("g")
        .attr("class", "y axis")
        .call(yAxisCall);

    // Bars
    var rects = g_bar.selectAll("rect")
        .data(cuisine_reviews)
        
    rects.enter()
        .append("rect")
            .attr("y", function(d){ return y(d.review_count); })
            .attr("x", function(d){ return x(d.category) })
            .attr("height", function(d){ return height - y(d.review_count); })
            .attr("width", x.bandwidth)
            .attr("fill", function(d){ return +d.review_count > 160 ? "red" : "grey"});
}

// 2. make the bar chart 
function bar2_plot(data){
	 var cuisine_stars = d3.nest()
	  .key(function(d) { return d.category;})
	  .rollup(function(d) { 
	   return d3.mean(d, function(g) {return +g.stars; });
	  }).entries(data);

	cuisine_stars.forEach(function(d) {
		d.category = d.key;
		d.stars = d.value.toFixed(2);
		
	});


	// Labels
	var yLabel = g_bar.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -40)
	    .attr("x", -170)
	    .attr("font-size", "20px")
	    .attr("text-anchor", "middle")
	    .text("Average Stars")

	 // X Scale
    var x = d3.scaleBand()
        .domain(cuisine_stars.map(function(d){ return d.category }))
        .range([0, width])
        .padding(0.2);

    // Y Scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(cuisine_stars, function(d) { return +d.stars })])
        .range([height, 0]);

    // X Axis
    var xAxisCall = d3.axisBottom(x);
    g_bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")")
        .call(xAxisCall)
        .selectAll("text")	
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");;

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return d; });
    g_bar.append("g")
        .attr("class", "y axis")
        .call(yAxisCall);

    // Bars
    var rects = g_bar.selectAll("rect")
        .data(cuisine_stars)
        
    rects.enter()
        .append("rect")
            .attr("y", function(d){ return y(d.stars); })
            .attr("x", function(d){ return x(d.category) })
            .attr("height", function(d){ return height - y(d.stars); })
            .attr("width", x.bandwidth)
            .attr("fill", function(d){ return +d.stars > 3 ? "red" : "grey"});
}


// 3. make a dot graph
function graph_plot_fc(data){
	console.log(d3.extent(data, function(d){return +d.review_count}))
	// Scales
	var x = d3.scaleLinear()
	    .range([0, width])
	    .domain([0.8,5]);;
	    
	var y = d3.scaleLog()
	    .range([height, 0])
	    .domain([3,4774])
	    .base(5);

	// Labels
	var xLabel = g.append("text")
	    .attr("y", height + 50)
	    .attr("x", width / 2)
	    .attr("font-size", "20px")
	    .attr("text-anchor", "middle")
	    .text("Rating Stars");
	var yLabel = g.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -40)
	    .attr("x", -170)
	    .attr("font-size", "20px")
	    .attr("text-anchor", "middle")
	    .text("Review Amount")

	// X Axis
	var xAxisCall = d3.axisBottom(x)
						.tickValues([1,2,3,4,5]);

	g.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height +")")
	    .call(xAxisCall);

	// Y Axis
	var yAxisCall = d3.axisLeft(y)
						.tickValues([10,40,160,640,4700]);;
	g.append("g")
	    .attr("class", "y axis")
	    .call(yAxisCall);

	

	// join new data with old elements
	var circles = g.selectAll("circle").data(data, function(d) {
		return d.business_id;
	});

	//  EXIST old elements not present in new data
	circles.exit().remove();

	// ENTER new elements prensent in new data
	circles.enter()
        .append("circle")
        // .on("click", function(d){click(d)})
		.on("mouseenter", mouseenter)
        .attr("class", "enter")
        .attr("cy", function(d){  return y(+d.review_count); })
        .attr("cx", function(d){ return x(+d.stars) })
        .attr("r", 5 )
        .attr("fill", "light-blue")
        .attr("opacity", "0.3");


    g.append("line")
		.attr("x1", x(3))  
		.attr("y1", 0)
		.attr("x2", x(3))  
		.attr("y2", height)
		.style("stroke-width", 2)
		.style("stroke", "red")
		.style("fill", "none");

	g.append("text")
		.attr("x", x(3) + 10)  
		.attr("y", 0)
		.attr("font-size", "20px")
		.attr("text-anchor", "left")
		.style('fill', 'red')
		.style("opacity", 0.5)
	    .text("high rating");

	g.append("text")
		.attr("x", x(3)-100)  
		.attr("y", 0)
		.attr("font-size", "20px")
	    .attr("text-anchor", "right")
	    .style('fill', 'red')
		.style("opacity", 0.5)
	    .text("low rating");


	 g.append("line")
		.attr("x1", 0)  
		.attr("y1", y(160))
		.attr("x2", width + 30) 
		.attr("y2", y(160))
		.style("stroke-width", 2)
		.style("stroke", "red")
		.style("fill", "none");

	g.append("text")
	    .attr("y", -405) // -y(160) - 20
	    .attr("x", -45 )
	    .attr("font-size", "20px")
		.attr("text-anchor", "left")
		.attr("transform", "rotate(90)")
		.style('fill', 'red')
		.style("opacity", 0.5)
	    .text("high popularity");


	g.append("text")
	    .attr("y", -405) // y(160) + 30
	    .attr("x", 145 )
	    .attr("font-size", "20px")
		.attr("text-anchor", "left")
		.attr("transform", "rotate(90)")
		.style('fill', 'red')
		.style("opacity", 0.5)
	    .text("low popularity");

}

var mouseenter = function(d){
	
	pop_up_tooltip(d);
}

// 4. show the tooltip on map
function pop_up_tooltip(d) {
	var latlng = L.latLng(d.latitude,  d.longitude);
	var popup = L.popup({keepInView:true})
		.setLatLng(latlng)
		.setContent('<p>' + "Name: " + d.name + "<br />" +  
			"Star: " + d.stars + "<br />" +
			"Review: " + d.review_count + "<br />" +
			'<div><Button class="wc">Click</Button> For Key Words</div>' + '</p>')
		.openOn(map);
	console.log(1,d);

	$( ".wc" ).click(function() {
 		wordCloud(d);
	});
}

// 5. drawMarker
function marker_plot_fc(data){
	data.forEach(function (d) { 
		 circle = L.circle([d.latitude,  d.longitude], {
			color: d.stars,
			fillColor: getColor(d.stars),
			fillOpacity: 0.6,
			radius: 80
		}).addTo(circleLayer).on("click", circleClick);;

		

		function circleClick(e) {
			pop_up_tooltip(d);
		}


	})

};

var review_words = {};
d3.json("data/review.json", function(error, data) {
    if (error) throw error;

    for (var i = 0; i < data.length; i++) {
    	var d = data[i]
    	review_words[d.business_id] = d
    }


});

// 6. make word cloud
function wordCloud(d) {

	// set the ranges for the scales
	var fontSize = d3.scalePow().exponent(5).range([40,80]);

	data = review_words[d.business_id]
	if (typeof data !== 'undefined') {
		var word_entries = d3.entries(data.words);
		fontSize.domain(d3.extent(word_entries, function(d) {return d.value;}));
	// Adds a set of variables to each element in the data (we will use x and y later)
        
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(word_entries)
            .fontSize(function(d,i) { return fontSize(+d.value); })
            .fontWeight(["bold"])
            .text(function(d) { return d.key; })
            .on("end", draw)
            .start();
		
	} else {
		g_wc.selectAll("text").remove();
		data = "No Feedback for this restaurant"
		g_wc.append("text")
                .attr('class','word')
                .attr("transform", "translate(-70,-10)")
                .text(data);
	}

	


    function draw(words) {

		g_wc.selectAll("text").remove();
          
         g_wc.selectAll("text")
         	.data(words)
            .enter().append("text")
                .attr('class','word')
                // .style("fill", function(d, i) { return color(i); })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", function(d) { return d.font; })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) { 
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; 
                })
                .text(function(d) { return d.text; });
    };
};




// EVENT LISTENERS
// 1. button to show the bar chart
$("#amountBtn")
	.on("click", function(){
		var myNode = document.getElementById("g_bar");
		while (myNode.firstChild) {
		    myNode.removeChild(myNode.firstChild);
		}
		bar1_plot(aData);
	});

// button
// 2. button to show the bar chart
$("#starBtn")
	.on("click", function(){
		var myNode = document.getElementById("g_bar");
		while (myNode.firstChild) {
		    myNode.removeChild(myNode.firstChild);
		};
		
			bar2_plot(aData);
	});


// 3. rate slider
$("#date-slider").slider({
	max: 5,
	min: 1,
	step:1,
	slide: function(event, ui) {
		// console.log(ui.value)
		$("#rateLabel")[0].innerHTML = +ui.value;
		minimumRate = +ui.value;

		filterData = aData.filter(function(d){
			if (category == "all") { return +d.stars >= minimumRate; }
			else {
				return d.category == category && +d.stars >= minimumRate;
			}
		});

		graph_plot_fc(filterData);

		circleLayer.clearLayers();
		map.setZoom(11);
		marker_plot_fc(filterData);

	}
});

// 4. category filter
$("#category-select")
	.on("change", function(){
		category = $("#category-select").val();
		// console.log(category);

	
		filterData = aData.filter(function(d){
			if (category == "all") { return +d.stars >= minimumRate; }
			else {
				return d.category == category && +d.stars >= minimumRate;
			}
		});

		graph_plot_fc(filterData);

		circleLayer.clearLayers();
		map.setZoom(11);
		marker_plot_fc(filterData);

	});

// 5. change the graph when map zooms
map.on('zoomend', function() {
	var bounds = map.getBounds();
	var min = bounds.getSouthWest().wrap();
		var max = bounds.getNorthEast().wrap();

		var data = filterData.filter(d => (d.latitude > min.lat) && (d.latitude < max.lat) && (d.longitude > min.lng) && (d.longitude < max.lng));
		
		graph_plot_fc(data);
});






