// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let faultmap = new L.LayerGroup();

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer:function(geoJsonPoint, latlng) {
      var magnitudescale = (geoJsonPoint.properties.mag)*4
      
      return L.circleMarker(latlng, {radius: magnitudescale} );  
  },
    style: function (geoJsonFeature) {
      console.log(geoJsonFeature.properties.mag);
      var colormag = "";
      switch(true){
        case parseInt(geoJsonFeature.properties.mag) > 5:
          colormag = "#ff6600"; break;
        case parseInt(geoJsonFeature.properties.mag) > 4:
          colormag = " #ff9933"; break;
        case parseInt(geoJsonFeature.properties.mag) > 3:
          colormag =  "#ffaa00"; break;
        case parseInt(geoJsonFeature.properties.mag) > 2:
          colormag = "#ffdb4d"; break;
        case parseInt(geoJsonFeature.properties.mag) > 1:
          colormag = "#ccff99"; break;
        case parseInt(geoJsonFeature.properties.mag) > 0:
          colormag = "#99ff33"; break;
        default: colormag ="#99ff33";
         }
         console.log(colormag)
      return {fillColor: colormag, fillOpacity: .8, color: colormag }
  },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Greyscale Map:": graymap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultmap
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var colors = ["#99ff33", "#ccff99", "#ffdb4d",  "#ffaa00", "#ff9933", "#ff6600"];
  var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
  var labels = []
  // Add min & max
  var legendInfo = "<h1>Magnitude Scale</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"min\">" + limits[0] + "</div>" +
      "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
    "</div>";
  div.innerHTML = legendInfo;
  limits.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
  });
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};
// Adding legend to the map
legend.addTo(myMap);
};

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(quakedata) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(quakedata, {
        color: "orange",
        weight: 3
      })
      .addTo(faultmap);
      // Then add the tectonicplates layer to the map.
      faultmap.addTo(myMap);
    });

});