var geocoder;
var map;

function initialize() {
   var style1 = [
      // {
      //   stylers:[
      //   {hue: '#0044ff'},
      //   {saturation: '-60'},
      //   {lightness: '-62'},
      //   {gamma: '0.97'}
      //   ]
      // },
      // {
      //   featureType: 'road.highway',
      //   stylers:[
      //   {hue: '#003bff'},
      //   {saturation: -52},
      //   {lightness: 20}
      //   ]
      // },
      // {
      //   featureType: 'water',
      //   elementType: 'geometry',
      //   stylers:[
      //   {hue: '#005eff'},
      //   {saturation: -78},
      //   {lightness: -52}
      //   ]
      // },
      // {
      //   elementType: 'labels.text.fill',
      //   stylers: [
      //   {hue: '#00bbff'},
      //   {saturation: -100},
      //   {lightness: 70}
      //   ]
      // }
      ];

  if (nodemap) {    
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(51.256405, 6.740892),
        streetViewControl: false,
        mapTypeControl: false,
        mapTypeControlOptions:{
          mapTypeIds:[google.maps.MapTypeId.ROADMAP,'map_style']
        }
    };
  }
  else {
    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(51.256405, 6.740892),
      streetViewControl: false,
      mapTypeControl: false,
      //disableDefaultUI: true,
      mapTypeControlOptions:{
        mapTypeIds:[google.maps.MapTypeId.ROADMAP,'map_style']
      }
  };
  }

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  var styledMap = new google.maps.StyledMapType(style1,{name:"Styled Map"});
      map.mapTypes.set('map_style',styledMap);
      map.setMapTypeId('map_style');

      if (!nodemap) {

          var itemPicker = document.getElementById('itemDropdown');
          var rSelect = document.getElementById('routeSelect');
          var orderbutton = document.getElementById('Orderbutton');

          //Create array of options to be added
          var trucksarray = [328121,198653,193871];

          //Create and append select list
          var selectList = document.createElement("select");
          selectList.id = "itemSelect";
          itemPicker.appendChild(selectList);

          // //Create and append the options
          for (var i = 0; i < trucksarray.length; i++) {
              var option = document.createElement("option");
              option.value = trucksarray[i];
              option.text = trucksarray[i];
              selectList.appendChild(option);
          }
          
           $('#itemSelect').prop('disabled', 'disabled');

           //set default truck based on first item in the array
           selectedTruck = trucksarray[0];

           selectList.onchange = function(evt) {
            selectedTruck = this.value;
          }


     }
    else {
        setTrucks();
    }

      //list for change of select list to modify node items based on user selection
      

      var inputContainer = document.getElementById('searchBox-container');
      var mapHandle = document.getElementById('maphandle');
      if (itemPicker) {   
        orderbutton.index=1;  
        rSelect.index=2;
        itemPicker.index=3;     
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(rSelect); 
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(itemPicker); 
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(orderbutton); 
      }      

      map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputContainer); 

      if (mapHandle) {
         map.controls[google.maps.ControlPosition.TOP_RIGHT].push(mapHandle); 
      } 

      var searchBox = new google.maps.places.SearchBox(document.getElementById('searchBox'));
      google.maps.event.addListener(searchBox,'places_changed',function(){
      var places = searchBox.getPlaces();
      if(places.length == 0) return;
      else{
        var location = places[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
      }
    });

    var truckIcon = "images/truck_go.png";

    if (nodemap) {
      //new Truck(map,new google.maps.LatLng(37.438429, -122.155949),328121,2013223,38,0,'08:30','14:00');
      //new Truck(map,new google.maps.LatLng(37.42565, -122.13535),198653,2013223,60,1,'08:00','17:30');
      //new Truck(map,new google.maps.LatLng(37.42565, -122.155940),193871,2013223,80,2,'07:30','15:00');
    }

    else {        


          startAddress = 'Stockumer Kirchstrasse 61, 40474 Dusseldorf, Germany';
        
           var geocoder = new google.maps.Geocoder();
        
           geocoder.geocode( { 'address': startAddress}, function(results, status) {
               startLocation = results[0].geometry.location;
           });

          var customers = [];


          var customer0 = {name : "Customer 1", address : 'Kehler Strasse 33, 40468 Dusseldorf, Germany', orderid : 34567, phone : '211 4534 4567',start : '--:--',lead : '30:00',selected : false };
          var customer2 = {name : "Customer 3", address : 'Gneisenaustrasse 38, 40447 Dusseldorf, Germany', orderid : 34568, phone : '211 4522 4321',start : '--:--',lead : '30:00',selected : false };
          var customer1 = {name : "Customer 2", address : 'Chamissostrasse 10B, 40237 Dusseldorf, Germany', orderid : 34569, phone : '211 2453 0184',start : '--:--',lead : '30:00',selected : false };
          //var customer3 = {name : "Customer 4", address : 'Rotterdamer Straße 116, 40474 Düsseldorf, Germany', orderid : 34570, phone : '211 2453 0184',start : '--:--',lead : '30:00',selected : false };

         

          customerdata.push(customer0);
          customerdata.push(customer1);
          customerdata.push(customer2);
          //customerdata.push(customer3);


          geocoder = new google.maps.Geocoder();

          function buildCustomerView(customers) {

            for (var i = 0; i < customers.length; i++) {
              (function(customer) {
                geocoder.geocode( { 'address': customer.address}, function(results, status) {
                  if (status == google.maps.GeocoderStatus.OK) {
                    var location = results[0].geometry.location;
                    new Customer(map,location,customer.address,customer.orderid,customer.name,customer.phone,customer.start,customer.lead,customer.selected);                
                  }
               });
              })(customers[i]);            
          };

            //google.maps.event.addListener(map,'idle',function(){
                CustomerCollection.reset();
                _.each(customers,function(customer){
                      CustomerCollection.add(customer);
              });
                tableView.render();
          //});

          }

          //buildCustomerView(customerdata);
          
          
          buildCustomerView(customerdata);
          
          

    }

    if (nodemap) {
          google.maps.event.addListener(map,'idle',function(){
              TruckCollection.reset();
              var bounds = map.getBounds();
              _.each(trucks,function(truck){
                if(bounds.contains(truck.position))
                {
                  TruckCollection.add(truck);
                } 
                
              });
              tableView.render();
            });
        }


}

  /*generic itemMarker
  * position - latitude/longitude coordinates
  * icon - map icon
  */

  // function addNewField() {
  //               var fieldExists = false;
  //               var vi = routePoints.length;
  //               var fieldId = 'mapfield'+vi;
  //               for (var m=0; m < inputFields.length; m++) {
  //                   if (inputFields[m] === fieldId) {
  //                     fieldExists = true;
  //                   }
  //               }
  //               if (!fieldExists) {
  //                 $('<p><input type="text" id="'+fieldId+'" size="30" name="'+fieldId+'" value="" placeholder="Enter Addresss" /> <a href="javascript:void(0);" style="text-decoration: none; color: #C1C4C9;" onclick="removeField('+vi+');" id="removeField'+vi+'">Remove</a></p>').appendTo(containerDiv);
  //                 inputFields.push(fieldId);
  //                 ci++;
  //               }
  //               //return false;
  //       };
        
  // function removeField(field) {
  //     console.log(ci);
  //     console.log(routePoints);
  //     markers[field].setMap(null);
  //     routePoints.splice(field,1);
  //     console.log(routePoints);
  //     var formid = '#removeField'+field;
  //     $(formid).parents('p').remove();
  //     ci--;
  //     console.log(ci);
  // };

google.maps.event.addDomListener(window, 'load', initialize);




