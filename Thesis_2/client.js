
//ionic and react
var oneYear = true;
function onPageLoad()
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + "AIzaSyDSZEk1qVzdKWLeQqFQBcpIl_ezSXfwvpE" + "&callback=initialize";
    document.body.appendChild(script);

    console.log('hi');
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onLoadResponse );

    xhr.open( "get", "load?", true );
    xhr.send();

}

//initialize google maps
function initialize() {

  var minZoomLevel = 12;
  var map = new google.maps.Map(document.getElementById('map'), {
      zoom: minZoomLevel,
      center: new google.maps.LatLng(39.737760, -105.000755),
      //mapTypeId: google.maps.MapTypeId.ROADMAP
  });

//kml version
  var ctaLayer = new google.maps.KmlLayer({
      url: "https://www.dropbox.com/s/ca9jlq7hbxg3x4n/neighborhoods.kml?dl=1",
      map: map
    });

//geoJson version
//  map.data.loadGeoJson('https://www.dropbox.com/s/civ8ghtyu4glxgt/neighborhoods.json?dl=1');

  //credit Tushar Gupta
  var strictBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(28.70, -54.50),
    new google.maps.LatLng(48.85, -55.90)
  );

  // Listen for the dragend event
  google.maps.event.addListener(map, 'dragend', function () {
      if (strictBounds.contains(map.getCenter())) return;

      // We're out of bounds - Move the map back within the bounds

      var c = map.getCenter(),
          x = c.lng(),
          y = c.lat(),
          maxX = strictBounds.getNorthEast().lng(),
          maxY = strictBounds.getNorthEast().lat(),
          minX = strictBounds.getSouthWest().lng(),
          minY = strictBounds.getSouthWest().lat();

      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;

      map.setCenter(new google.maps.LatLng(y, x));
  });

  // Limit the zoom level
  google.maps.event.addListener(map, 'zoom_changed', function () {
      if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
  });

//styling with GoeJSON - doesn't work
/*  map.data.setStyle(function(feature) {
    var color = 'purple';
    if (feature.getProperty('isColorful')) {
      color = feature.getProperty('color');
    }
    return //** @type {google.maps.Data.StyleOptions} */
  /*  ({
      fillColor: color,
      strokeColor: color,
      strokeWeight: 2
    });
  });

  KmlLayer.addListener('mouseover', function(event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {strokeWeight: 8});
    });*/
}


//do all the things
function onLoadResponse(evt){
//  console.log("HEREEE");



  var dropDown1= document.getElementById("puma_select");
  var dropDown2= document.getElementById("year_select");
  var dropDown3= document.getElementById("category_select");

  //different way to do this?
  //see how to add value different from displayed
  dropDown2.options.add( new Option("2008") );
  dropDown2.options.add( new Option("2009") );
  dropDown2.options.add( new Option("2010") );
  dropDown2.options.add( new Option("2011") );
  dropDown2.options.add( new Option("2012") );
  dropDown2.options.add( new Option("2013") );
  dropDown2.options.add( new Option("2014") );
  dropDown2.options.add( new Option("2015") );

  dropDown3.options.add( new Option("Food Stamp", "FS") );
  dropDown3.options.add( new Option("Year Moved in","MV") );
  dropDown3.options.add( new Option("Vacancy Status", "VACS") );
  dropDown3.options.add( new Option("Serial No", "SERIALNO") );

  var xhr = evt.target;
  var jsonData=JSON.parse(xhr.responseText);
  console.log(jsonData.puma_list.length);
  for (var i=0; i<jsonData.puma_list.length; i++){
    dropDown1.options.add( new Option(jsonData.puma_list[i]) );
  }
}

function getResults()
{
    //split into different scenarios - there will be more
    if(oneYear==true){
      getResultsOne()
    }
    else{
      getResultsTwo()
    }

}

//get results for one year
function getResultsOne(){
  var drop1 = document.getElementById('puma_select');
  var drop2 = document.getElementById('year_select');
  var drop3 = document.getElementById('category_select');
//get value not text
  var drop1select = drop1.options[drop1.selectedIndex].text;
  var drop2select = drop2.options[drop2.selectedIndex].text;
  var drop3select = drop3.options[drop3.selectedIndex].value;
  console.log(drop1select, drop2select, drop3select);
  var xhr = new XMLHttpRequest();
  xhr.addEventListener( "load", onResponse );
  xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select+"&category="+drop3select, true );

  xhr.send();
}

//get results for a range of years
function getResultsTwo(){

}
//inside this function I'll call a bunch more functions to do cool shit
function onResponse( evt )
{
    var xhr = evt.target;
    console.log( "Response text: ", xhr.responseText );
    var info = xhr.responseText.split(',');

    //make these statements for each potential category
    if (info[0]=="FS"){
      console.log("Woo");
      FS(info);
      //call function to analyze FS
    }

}

function FS(info){
  var table = document.getElementById( 'table' );

  for (var i =0; i<info.length; i++){
    var item =document.createElement('td');
    var row = document.createElement('tr');
    table.appendChild(row);
    row.appendChild(item);
    item.innerHTML = info[i];
  }
}
//don't think this is doing anything
function sendUpdateReq()
{
    // alert( "SENDUPDATE" );
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onResponse );
    xhr.open( "get", "idk?", true );
    xhr.send();
}

function addYear(){
  var div = document.getElementById( 'year_container' );
  var button = document.getElementById( 'add_year' );
  var new_select=document.createElement('select');
  new_select.className="form-control";
  new_select.options.add( new Option("2008") );
  new_select.options.add( new Option("2009") );
  new_select.options.add( new Option("2010") );
  new_select.options.add( new Option("2011") );
  new_select.options.add( new Option("2012") );
  new_select.options.add( new Option("2013") );
  new_select.options.add( new Option("2014") );
  new_select.options.add( new Option("2015") );
  div.appendChild(new_select);
  div.removeChild(button);
  oneYear=false;


}
