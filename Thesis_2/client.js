
//ionic and react
var oneYear = true;
function onPageLoad()
{

/*    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src="https://www.google.com/jsapi";//?autoload={'modules':['name':'visualization','version':'1','packages':['corechart']]}&callback=drawChart";
    document.body.appendChild(script);

  /*  var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src="https://www.gstatic.com/charts/loader.js";
    document.body.appendChild(script);
*/
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + "AIzaSyDSZEk1qVzdKWLeQqFQBcpIl_ezSXfwvpE" + "&callback=initialize";
    document.body.appendChild(script);


    //google.load('visualization', '1.0', {'packages':['corechart']});
    //google.setOnLoadCallback(drawChart);

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


  dropDown3.options.add( new Option("Rent", "RNTP") );
  dropDown3.options.add( new Option("Household Language","HHL") );
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
//TODO
function getResultsTwo(){
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



//inside this function I'll call a bunch more functions to do cool shit
function onResponse( evt )
{
    var xhr = evt.target;
    console.log( "Response text: ", xhr.responseText );
    var info = xhr.responseText.split(',');

    //make these statements for each potential category
    //TODO
    if (info[0]=="FS"){
      console.log("Woo");
      FS(info);
    }
    if (info[0]=="RNTP"){
      console.log("Woo");
      RNTP(info);
    }
    if (info[0]=="HHL"){
      console.log("Woo");
      HHL(info);
    }
    if (info[0]=="VACS"){
      console.log("Woo");
      VACS(info);
    }
}
function VACS(info){
    var text = document.getElementById( 'testText' );
    text.innerHTML="Vacancy stuff";
    drawChart();
}
function HHL(info){
    var text = document.getElementById( 'testText' );
    text.innerHTML="Language stuff";
}
function RNTP(info){
    var text = document.getElementById( 'testText' );
    text.innerHTML="Rent stuff";
}
function FS(info){
  var text = document.getElementById( 'testText' );
  var totalYes=0;
  var totalNo=0;
  var totalVacant=0;
  for (var i =0; i<info.length; i++){
    if (info[i] ==2){
      totalNo++;
    }
    else if(info[i] ==1){
      totalYes++;
    }
    else{
      totalVacant++;
    }
  }
  text.innerHTML = "No :"+totalNo+" Yes: "+totalYes+" Vacant: "+totalVacant;
  drawFSChart(totalNo, totalYes, totalVacant);
}

function drawFSChart(no, yes, vac) {
        // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Yes', yes],
      ['No', no],
      ['Vacant Household', vac],

    ]);

    // Set chart options
    var options = {'title':'Percentage of Households using Food Stamps',
                   'width':400,
                   'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
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
