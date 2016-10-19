var mapViewModel = function() {
    var self = this;
    self.map = null;
    if(self.shouldShowErrorMessage == null || !self.shouldShowErrorMessage()){
      /*if no error only then use google maps*/
      self.shouldShowErrorMessage = ko.observable(false);
      self.bounds = new google.maps.LatLngBounds();
      self.infoWindow  = new google.maps.InfoWindow({
            content: ""
        });
    }
    self.showMap = ko.observable({ /* inital map data bind*/
        lat: ko.observable(-37.814),
        lng:ko.observable(144.96332)
    });
    self.expanded = ko.observable(false);
    self.flickrURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=1c9f777eb7446f34a7261dc1a54be4b2&extras=geo&format=json&jsoncallback=?";
    self.txtFilterLocation = ko.observable(""); /* Filter text box */
    self.markers = ko.observableArray([ /* Initial Filter List */
        {'title':'Philip Island','lat': 145.2031,'lang':-38.4897,'mapMarker':'','infoWindowContent':''},
        {'title':'Dandenong Ranges','lat': 145.3662,'lang':-37.9086,'mapMarker':'','infoWindowContent':''},
        {'title':'Great Ocen Road','lat': 144.7852,'lang':-37.4713,'mapMarker':'','infoWindowContent':''},
        {'title':'St. Kilda Beach','lat': 144.973,'lang':-37.8669,'mapMarker':'','infoWindowContent':''},
        {'title':'Yarra River','lat': 145.2218,'lang':-37.7536,'mapMarker':'','infoWindowContent':''}
    ]);
    self.filteredMarkers = ko.computed(function() { /* This array will return filtered array based on provided value in text box*/
    var filter = self.txtFilterLocation().toLowerCase(); /* Filter Text Box. */
      if (!filter) { /*if no filter provided than show all markers on map and return initial array*/
        if(self.markers()[0].mapMarker!==""){ // make sure markers have been set in our array.
          for(var i=0;i<self.markers().length;i++){
            self.markers()[i].mapMarker.setMap(self.map.googleMap);
        }
      }
        return self.markers();
      } else { /* If filter is provided than return the filtered array and also show respective markers on map. */
            var i=0;
            return ko.utils.arrayFilter(self.markers(), function(item) {
              if(item.title.toLowerCase().indexOf(filter) === -1)
              {
                self.markers()[i].mapMarker.setMap(null);
              }else{
                self.markers()[i].mapMarker.setMap(self.map.googleMap);
                markerAnimation(self.markers()[i].mapMarker); /* Animate Filtered Markers */
              }
              i++;
              return item.title.toLowerCase().indexOf(filter) !== -1;
            });
      }
    },self);
    self.showFilters = function() { /* Show Filters on click.*/
        self.expanded() ? self.expanded(false) : self.expanded(true);
        };
    self.animateMarker = function(marker) { /* Find the marker as per list item click and animate it*/
        if (typeof marker.mapMarker != 'undefined') {
          markerAnimation(marker.mapMarker);
          self.infoWindow.setContent(marker.infoWindowContent);
          self.infoWindow.open(self.map.googleMap, marker.mapMarker);
        }else{
          markerAnimation(marker);
          self.infoWindow.setContent(marker.infoWindowContent);
          self.infoWindow.open(self.map.googleMap, marker);
        }
    };
};

ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      if(self.shouldShowErrorMessage == null || !self.shouldShowErrorMessage()){
      /* initialize google map*/
      var mapObj = ko.utils.unwrapObservable(valueAccessor());
      var latLng = new google.maps.LatLng(
          ko.utils.unwrapObservable(mapObj.lat),
          ko.utils.unwrapObservable(mapObj.lng));
      var mapOptions = {
          center: latLng,
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          mapObj.googleMap = new google.maps.Map(element, mapOptions);
          self.map=mapObj;
          google.maps.event.addDomListener(window, 'resize', function() {
            mapObj.googleMap.setCenter(latLng);
          });
          for( i = 0; i < markers().length; i++ ) {
            /* for each marker get the flickr image*/
            getFlickrPicture(self.flickrURL+"&lat="+markers()[i].lang+"&lon="+markers()[i].lat,markers()[i]);
          }
        }
      }
    };

var getFlickrPicture = function(url,marker) {
  /* ajax call to Flickr API*/
  $.ajax({
    url : url,
    type: 'GET',
    dataType:'jsonp',
    success : showMarkersWithImages(marker)
  }).fail(function() {
      flickrFailure(marker); /*Please note that we are showing error message in infowindow in case of flick error.*/
  });
};

var showMarkersWithImages = function(markerObj) { /*In case of success place markers with images*/
    return function(data, textStatus, jqXHR) {
      placeMarkers(markerObj,data);
    };
};

var flickrFailure = function(markerObj){
    return function(xhr, error) { /*In case of failure place markers with error message on info window*/
      placeMarkers(markerObj,null);
  };
};

var placeMarkers = function(markerObj,data) {
  /* This method will place markers and also the click event on makers*/
    var infoWindowContent = getInforWindow(markerObj,data);
    position = new google.maps.LatLng (
                  ko.utils.unwrapObservable(markerObj.lang),
                  ko.utils.unwrapObservable(markerObj.lat)
                  );
    var marker = new google.maps.Marker({
                  map: self.map.googleMap,
                  position: position,
                  title: markerObj.title,
                  animation: google.maps.Animation.DROP,
                  draggable: false,
                  infoWindowContent: infoWindowContent
                });
    bounds.extend(position);
    markerObj.mapMarker = marker;
    markerObj.infoWindowContent = infoWindowContent;
    self.map.googleMap.fitBounds(bounds);
    google.maps.event.addListener(marker,'click', function() {
                markerAnimation(marker);
                self.infoWindow.setContent(infoWindowContent);
                self.infoWindow.open(self.map.googleMap, marker);
            });
};

var getInforWindow = function(markerObj,data) {
    var contentString = "";
    var htmlString = "";
    if(data!==null && data.photos.photo.length>0) { /* In case of Flick Success show first found image on info window*/
      var photoURL = 'https://farm' + data.photos.photo[0].farm + '.static.flickr.com/' + data.photos.photo[0].server + '/' + data.photos.photo[0].id + '_' + data.photos.photo[0].secret + '_m.jpg';
          htmlString = '<p class="text-center"><strong>'+markerObj.title+'</strong></p><img src="' + photoURL + '">';
          contentString = '<div id="content">' + htmlString + '</div>';
    } else  { /* In case of Flickr failure show failed message on info window*/
          contentString = '<div id="content">No images available currently. </div>';
    }
    return contentString;
};

var markerAnimation = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE); /* animation type*/
    setTimeout(function(){
      marker.setAnimation(null); /* Stop animation after 3 bounces */
    }, 2100);
};

function initialize() {
    ko.applyBindings(mapViewModel);
}

function mapError(){
    self.shouldShowErrorMessage = ko.observable(true);
    ko.applyBindings(mapViewModel);
}