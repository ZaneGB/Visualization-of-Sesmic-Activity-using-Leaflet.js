// Store our API endpoint inside queryUrl

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var faultUrl = "PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, coord) {
      return new L.circle(coord,
        {radius: Radius(feature.properties.mag),
          fillColor: Color(feature.properties.mag),
          fillOpacity: 0.6,
          // stroke: true,
          // color: "black",
          weight: 0.5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers

    var satelliteMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiYW5kcmV3aG9hbmcwOSIsImEiOiJjamt1Zno2ejcwNTFkM3FwZGJrOXk1bWxxIn0.BCVeyxRcjhsbOLVqnx5uTQ'
    });

    var grayscaleMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'pk.eyJ1IjoiYW5kcmV3aG9hbmcwOSIsImEiOiJjamt1Zno2ejcwNTFkM3FwZGJrOXk1bWxxIn0.BCVeyxRcjhsbOLVqnx5uTQ'
    });

    var outdoorsMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.outdoors',
        accessToken: 'pk.eyJ1IjoiYW5kcmV3aG9hbmcwOSIsImEiOiJjamt1Zno2ejcwNTFkM3FwZGJrOXk1bWxxIn0.BCVeyxRcjhsbOLVqnx5uTQ'
    });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Grayscale Map": grayscaleMap,
    "Outdoors Map": outdoorsMap
  };

  // Add the tectonic plate layer
  var faultLines = new L.LayerGroup();

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultLines
  };

  // Create  map with the outdoors map and earthquakes layers displaying upon loading
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    zoom: 2.5,
    layers: [outdoorsMap, earthquakes, faultLines]
  });

   // Add Fault lines data

   d3.json(faultUrl, function(plateData) {

//    d3.json(faultLines, function(plateData) {

     // Add geoJSON data, along with style information, to the tectonic plates layer
     L.geoJson(plateData, {
       color: "blue",
       weight: 2
     })
     .addTo(faultLines);
   });

  // Create a layer control. Pass in baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "lightgreen",
      "darkgreen",
      "yellow",
      "tan",
      "darkorange",
      "red"
    ];

  // Generate label based on USGS earthquake data.
  // The darker color, the greater the  sesimic activity.

    for (var i = 0; i < grades.length; i++) {
       div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(myMap);
};

// Increase size of circles to improve visibility.
function Radius(value){
  return value*40000
};

function Color(magnitude) {
  if (magnitude > 5) {
      return 'red'
  } else if (magnitude > 4) {
      return 'darkorange'
  } else if (magnitude > 3) {
      return 'tan'
  } else if (magnitude > 2) {
      return 'yellow'
  } else if (magnitude > 1) {
      return 'darkgreen'
  } else {
      return 'lightgreen'
  }
};
