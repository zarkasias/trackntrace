function initialize() {

 // startSimulation(328121,50,100);
  WebSocketTest(); 
}

function WebSocketTest() {

  var style1 = [
      /*{
        stylers:[
        {hue: '#0044ff'},
        {saturation: '-60'},
        {lightness: '-62'},
        {gamma: '0.97'}
        ]
      },
      {
        featureType: 'road.highway',
        stylers:[
        {hue: '#003bff'},
        {saturation: -52},
        {lightness: 20}
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers:[
        {hue: '#005eff'},
        {saturation: -78},
        {lightness: -52}
        ]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
        {hue: '#00bbff'},
        {saturation: -100},
        {lightness: 70}
        ]
      }*/
      ];

    var custaddress = new google.maps.LatLng(51.270440,6.770060); 
    var truckaddress = new google.maps.LatLng(51.260696, 6.745236);
    var mapcenter = new google.maps.LatLng( (51.270440+51.260696)/2 , (6.770060+6.745236)/2 );

    var mapOptions = {
          zoom: 13,
          center: mapcenter,
          //streetViewControl: false,
          //mapTypeControl: false,
          draggable:false,
          mapTypeControlOptions:{
            mapTypeIds:[google.maps.MapTypeId.ROADMAP,'map_style']
          }
      };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var styledMap = new google.maps.StyledMapType(style1,{name:"Styled Map"});
    map.mapTypes.set('map_style',styledMap);
    map.setMapTypeId('map_style');

    var truckmarker = new google.maps.Marker({
        map: map,
        position: truckaddress,
        icon: 'images/truck_go.png',
        draggable:true,
      });
  
	  
    if ("WebSocket" in window) {

	     console.log("WebSocket is supported by your Browser!");
	     $('.truckstatus').html('Delivery Center');
	     // Let us open a web socket
	     var ws = new WebSocket("ws://54.85.170.183:9092");
	     ws.onopen = function()
	     {
	        // Web Socket is connected, send data using send()
	        //ws.send("Hello");
	        ws.send("{\"topic\": \"/demo/logistics/SENSOR_POSITION\",\"messageType\": \"SUBSCRIBE\", \"subscribeOptions\": { \"base\": \"true\" },\"authorization\":\"Basic QWRtaW46d2FsbGRvcmY=\"}");
        	//alert("Message is sent...");
	     };
		   lineScale = d3.scale.linear();
		   colorScale = d3.scale.linear();
	     lineScale.domain([0.0,1.0]).range([5,105]);
   	   colorScale.domain([0.0,1.0]).range(['green','red']);

	    ws.onmessage = function (evt) 
	    { 

	        var response=jQuery.parseJSON(evt.data);
	        
	        var updatedPosition ="";     

	        if (response.event) {
		          updatedPosition = response.event.value;
		          console.log(updatedPosition);
		          var notification = updatedPosition[0].NOTIFICATION;
		          var routedetails = JSON.parse(updatedPosition[0].ROUTE_DETAILS);
		          //route leg information
		          var routeleg = routedetails.Legs[0];
		          //route leg id
		          var routeId = routeleg.RouteId;
		          //route distance
		          var legDistance = routeleg.LegDistance * 0.000621371192;
		          //actual time
		          var actualTime = routeleg.ActualTime;
		          //actual distance
		          var actualDistance = routeleg.ActualDistance * 0.000621371192;
		          //expected time
		          var expectedTime = routeleg.ExpectedTime;
		          //leg complete
		          var legComplete = routeleg.IsComplete;
		          //this leg true
		          var isonLeg = routeleg.IsTruckOnLeg;
              //Start address
              var startaddress = routeleg.Start_Address;
              //End address
              var endaddress = routeleg.End_Address;
              console.log(routeleg);

              if (routeId == "1") {

                var geocoder = new google.maps.Geocoder();

                geocoder.geocode( { 'address': endaddress}, function(results, status) {

                    if (status == google.maps.GeocoderStatus.OK) {
                      var latitude = results[0].geometry.location.lat();
                      var longitude = results[0].geometry.location.lng();

                      var newcustaddress = new google.maps.LatLng(latitude, longitude);
                      //custmarker.setPosition(newcustaddress);
                      var custmarker = new google.maps.Marker({
                        position: newcustaddress,
                        map: map,
                      });
                      var newmapcenter = new google.maps.LatLng( (updatedPosition[0].LATITUDE+latitude)/2 , (updatedPosition[0].LONGITUDE+longitude)/2 );
                      map.setCenter(newmapcenter);
                      if (actualTime<5) {
                        document.getElementById('arrived').innerHTML = "Your Shop&Go delivery has arrived.";
                        document.getElementById('CustomerExpTime').innerHTML = "The Truck has Arrived.";
                        document.getElementById('trucknumber').innerHTML = "Truck "+updatedPosition[0].TRUCK_ID+" - has Arrived!";
                      }
                      else {
                      actualTime = Math.round((actualTime * 100) / 100);
                      document.getElementById('CustomerExpTime').innerHTML = "Expected Time is "+actualTime+" seconds.";
                      document.getElementById('trucknumber').innerHTML = "Truck "+updatedPosition[0].TRUCK_ID+" - On Time";
                      }
                      document.getElementById('Custaddress').innerHTML = endaddress;
                      
                    } 
                }); 
                          
                var newtruckaddress = new google.maps.LatLng(updatedPosition[0].LATITUDE, updatedPosition[0].LONGITUDE);
                truckmarker.setPosition(newtruckaddress);
              }
		    }
    	};

	    ws.onclose = function()
	    { 
	        // websocket is closed.
	        alert("Connection is closed..."); 
	    };
	}
	else {
	     // The browser doesn't support WebSocket
	     alert("WebSocket NOT supported by your Browser!");
	}
}

/*function startSimulation(truck_id,speed,interval){

    var header = {
    "clusterName": "WIN-AMND703SS2B",
    "port": "19011",
    "authentication": {
        "type": "user",
        "data": "Admin:walldorf",
        "sslEnabled": "false"
    }
    };

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
    console.log(JSON.stringify(msg));
}*/

google.maps.event.addDomListener(window, 'load', initialize);




