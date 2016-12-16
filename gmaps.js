// Initialize Google Maps API Directions Service and Display
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
directionsDisplay.setPanel(document.getElementById('dPanel'));
var directionsDisplay2 = new google.maps.DirectionsRenderer();
directionsDisplay2.setPanel(document.getElementById('dPanel2'));

// Dropdown menu for different methods of transportation
var selectedMode = document.getElementById('mode').value;

// San Francisco's northeast and southwest boundaries
var sfBounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(37.817099, -122.362415),
  new google.maps.LatLng(37.709348, -122.506954)
);

// Linking input text field to a variable
var input = document.getElementById('coffee-and-donuts');

// Specify the boundaries and types of locations returned
var options = {
  bounds: sfBounds,
  types: ['establishment']
};

// Calling API for Autocomplete object using the text input, and option specifications
var search = new google.maps.places.Autocomplete(input, options);

// Empty array to store the location of the coffee/donut store
var wypnt = []

// Link div to variable
var pText = document.getElementById('pPanel');

// Returns the Place object of the search value
var place = search.getPlace();

// Activates every time you search for a new location
search.addListener('place_changed', function() {
  var place = search.getPlace();
  for (var i = 0; i < 1; i++) {
    // Empties array if there is something inside
    if (wypnt[i] != null) {
      wypnt.pop();
    }
    // Adds the address of the searched location
    wypnt.push({
      location: place.formatted_address,
      stopover: true
    });
  }
  // Call function to display directions
  displayDirections(directionsService, directionsDisplay);
  // Sets text
  pText.innerHTML = "You are getting coffee and donuts from: " + wypnt[0].location;
  var d = document.getElementById("directions-panel");
  d.className = "well";
  var welcome = document.getElementById('welcome');
  welcome.innerHTML = "You've reached ClickTime!";
});

// Whenever the method of transportation is changed, recall function to display directions
document.getElementById('mode').addEventListener('change', function() {
  if (document.getElementById('mode').value != "TRANSIT") {
    // Deletes dPanel2, and makes a new dPanel2 in its place.
    // Without this, switching from public transportation to
    // walking/biking leaves an extra panel of directions.
    directionsDisplay2 = new google.maps.DirectionsRenderer();
    var direcDiv = document.getElementById("directions-panel");
    var dp = document.getElementById("dPanel2");
    dp.parentNode.removeChild(dp);
    var newDPanel = document.createElement("DIV");
    newDPanel.id = "dPanel2";
    direcDiv.insertBefore(newDPanel, direcDiv.childNodes[0]);
    directionsDisplay2.setPanel(document.getElementById('dPanel2'));
  }

  // Prevents users from calling the displayDirections
  // function by changing the method of transportation
  // before searching for anything.
  if (wypnt[0] != null) {
    displayDirections(directionsService, directionsDisplay);
  }
});





  /* * * * * * * * *
  * * Functions * *
* * * * * * * * */

function displayDirections(directionsService, directionsDisplay) {
  // Get the selected method of transportation
  var selectedMode = document.getElementById('mode').value;

  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, {timeout:10000});
  } else {
    console.log('Your broweser does not support geolocation. Please use another browser.')
  }

  function success(position) {
    var userLat = position.coords.latitude;
    var userLng = position.coords.longitude;
    var request;

    if (selectedMode == "TRANSIT") {
      request = {
        origin: new google.maps.LatLng(userLat, userLng), // User location
        destination: '' + wypnt[0].location,  // 1st stop
        travelMode: google.maps.TravelMode[selectedMode]
      };

      // Since the Google Maps API doesn't natively support multiple destinations when
      // using public transportation, I have to make two calls to the directionsService 'route'
      // function. This is the first: from the user location to the searched destination.
      directionsService.route(request, function(response, status) {
       if (status == 'OK') {
         directionsDisplay2.setDirections(response);
       } else {
         window.alert('Directions request failed due to ' + status);
       }
      });

      request = {
        origin: '' + wypnt[0].location, // 1st stop
        destination: '282 2nd St #4, San Francisco, CA 94105',  // ClickTime Office
        travelMode: google.maps.TravelMode[selectedMode]
      };
    }

    // For walking and biking
    else {
      request = {
        origin: new google.maps.LatLng(userLat, userLng), // User location
        destination: '282 2nd St #4, San Francisco, CA 94105',  // ClickTime Office
        waypoints: wypnt,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[selectedMode]
      };
    }

    // Calls the directionsService 'route' function. If using public transportation,
    // this is the second time calling it.
    dispD(request);
    console.log('Your latitude is: ' + userLat + ' and longitude is: ' + userLng);
  }

  // Calls this function when the browser cannot get the user's location.
  function error(position) {
    var request;

    if (selectedMode == "TRANSIT") {
      request = {
        origin: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', // Google Headquarters
        destination: '' + wypnt[0].location,  // 1st stop
        travelMode: google.maps.TravelMode[selectedMode]
      };

      directionsService.route(request, function(response, status) {
       if (status == 'OK') {
         directionsDisplay2.setDirections(response);
       } else {
         window.alert('Directions request failed due to ' + status);
       }
      });

      request = {
        origin: '' + wypnt[0].location, // 1st stop
        destination: '282 2nd St #4, San Francisco, CA 94105',  // ClickTime Office
        travelMode: google.maps.TravelMode[selectedMode]
      };
    }

    else {
      request = {
        origin: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', // Google Headquarters
        destination: '282 2nd St #4, San Francisco, CA 94105',  // ClickTime Office
        waypoints: wypnt,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[selectedMode]
      };
    }

    dispD(request);
    console.log('Could not get user location. The default location was set to the Google Headquarters in Mountain View, CA.');
  }

  // Display directions helper function
  function dispD(request) {
    directionsService.route(request, function(response, status) {
     if (status == 'OK') {
       directionsDisplay.setDirections(response);
     } else {
       window.alert('Directions request failed due to ' + status);
     }
    });
  }
}
