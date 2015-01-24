var item;
var itemIcon;
var header = {
    "clusterName": "WIN-AMND703SS2B",
    "port": "19011",
    "authentication": {
        "type": "user",
        "data": "Admin:walldorf",
        "sslEnabled": "false"
    }
};

function calcRoute(routeInfo){
  var start = routeInfo.start_location;
  var end = routeInfo.end_location;
  var wayptsLocations = routeInfo.waypoints;
  var waypts = [];
  for(var i=0;i<wayptsLocations.length;i++)
  {
    waypts.push({
      location: wayptsLocations[i],
      stopover: true
    });
  }
  PassedRequest = {
    origin: start,
    destination: end,
    waypoints: waypts,
    optimizeWaypoints: false,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(PassedRequest,function(response,status){
    if(status == google.maps.DirectionsStatus.OK){
      console.log(response);
      var route = response.routes[0];
      var overview_path = route.overview_path;
      dirDisplay.setDirections(response);
      //createMSG(route);
    }else console.log(status);
  });
  var markers = [];
      Locations = getAllLocations(start, end, wayptsLocations);
      markerIconBlue =  "images/ppl_blue.png";
      markerIconGreen = "images/ppl_green.png";
      var markerIcon = markerIconBlue;
      startBlue = "images/center_blue.png";
      startGreen = "images/center_green.png";

      console.log(Locations);


  for (i = 0; i < Locations.length; i++) {
      if (i === 0) {
        markerIcon = startBlue;
      }
      else {
        markerIcon = markerIconBlue;
      }
        
        PlaceMarker.createNew(map, Locations[i], markerIcon, i, "data");
    }

  startSimulation(328121,50,100);
}

function getAllLocations(start,end,wayptsLocations)
{
  var geoAddresses = [];
  geoAddresses.push(start);
  for(var i=0;i<wayptsLocations.length;i++)
  {
    geoAddresses.push(wayptsLocations[i]);
  }
  geoAddresses.push(end);
  return geoAddresses;
}

//Place Marker class bind placemark with infowindow and click event listener
var PlaceMarker = {
        count : 0,

        createNew: function (map, address, icon, id, message) {
            "use strict";
            var that = this;
            geocoder.geocode({'address': address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var placeMarker = new google.maps.Marker({
                        position: results[0].geometry.location,
                        icon: icon,
                        id: id,
                        address: address,
                        map: map
                        //animation: google.maps.Animation.DROP
                    }),
                        infoWindow = new google.maps.InfoWindow({
                            content: String(id)
                        });
                    //infoWindow.open(map,placeMarker);
                    google.maps.event.addListener(placeMarker, 'click', function () {
                    //infoWindow.open(map,placeMarker);
                    });
                    /*jslint plusplus: true */
                    PlaceMarker.count++;
                    placeMarkers.push(placeMarker);
                    return placeMarker;
                }
            });
        },

        length: function () {
            "use strict";
            return this.count;
        }
    };


function createMSG(route)
{
  var url = "http://54.85.170.183/espws/restservice/stream/DELIVERY_INFO?action=upsert&workspace=demo&project=logistics";
  var deleteURL = "http://54.85.170.183/espws/restservice/stream/bulk?action=remove&workspace=demo&project=logistics";
  var truck_ID = "328121"
  var forDelete = {};
  var deleteArray = [];
  for(var i=0;i<10;i++)
  {
    var obj = {
      "DELIVERY_INFO" : {
        "TRUCK_ID" : truck_ID,
        "ROUTE_ID" : i+1
      }
    }
    deleteArray.push(obj);
  }
  forDelete.connectionDetails = header;
  forDelete.content = deleteArray;

  for(var i=0;i<route.legs.length;i++)
  {
    var result = {};
    result.connectionDetails = header;

    var lag = route.legs[i];
    var path = "";
    var steps = lag.steps;
    for(var j=0;j<steps.length;j++)
    {
      var step = steps[j];
      var forDecode = step.polyline.points;
      var line = decode(forDecode,5);
      for(var k=0;k<line.length;k++)
      {
        path += line[k][0] + " " + line[k][1];
        if(j < steps.length -1) path += ","        
      }
    }
    result.content = {
      "TRUCK_ID": truck_ID,
      "ROUTE_ID": (i+1) + "",
      "START_ADDRESS": lag.start_address,
      "START_LATITUDE" : lag.start_location.lat(),
      "START_LONGITUDE" : lag.start_location.lng(),
      "END_ADDRESS" : lag.end_address,
      "END_LATITUDE" : lag.end_location.lat(),
      "END_LONGITUDE" : lag.end_location.lng(),
      "EXPECTED_DISTANCE" : lag.distance.value,
      "EXPECTED_TIME" : lag.duration.value,
      "ROUTE" : path
    };
     // console.log(forDelete);
     //console.log(JSON.stringify(result));
    // $.post(deleteURL,JSON.stringify(forDelete));
    // $.post(url,JSON.stringify(result));
  }
}

function decode(encoded, precision) {
    precision = Math.pow(10, -precision);
    var len = encoded.length, index=0, lat=0, lng = 0, array = [];
    while (index < len) {
        var b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        array.push( [lng * precision, lat * precision] );
    }
    return array;
}

function startSimulation(truck_id,speed,interval){
  var url = "http://ec2-54-85-170-183.compute-1.amazonaws.com/espws/restservice/stream/START_SIMULATION?action=insert&workspace=demo&project=logistics";
  var msg = {
    "connectionDetails" : header,
    "content" : {
      "TRUCK_ID": "" + truck_id,
        "ROUTE_ID": "1",
        "SPEED":speed,
        "DISTANCE_INTERVAL":interval
    }
  }
  $.post(url,JSON.stringify(msg));
}





