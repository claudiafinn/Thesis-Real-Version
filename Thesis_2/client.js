
var oneYear = true;
var years =["2007", "2008", "2009", "2010", "2011", "2012", "2013"];
var categories = [{"Value": "FS", "Display":"Food Stamp"}, {"Value": "VACS", "Display":"Vacancy Status"},
              {"Value": "RNTP", "Display":"Monthly Rent"}, {"Value": "HHL", "Display":"Household Language"}];
var neighborhoods=[];

function onPageLoad()
{

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + "AIzaSyDSZEk1qVzdKWLeQqFQBcpIl_ezSXfwvpE" + "&callback=initialize";
    document.body.appendChild(script);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onLoadResponse );
    xhr.open( "get", "load?", true );
    xhr.send();

}

function initialize() {

  var minZoomLevel = 11;
  var map = new google.maps.Map(document.getElementById('map'), {
      zoom: minZoomLevel,
      center:{lat: 39.737760, lng: -105.000755}
  });

  //kml version
  /*  var ctaLayer = new google.maps.KmlLayer({
        url: "https://www.dropbox.com/s/ca9jlq7hbxg3x4n/neighborhoods.kml?dl=1",
        map: map
      });*/

  //geoJson version
  map.data.loadGeoJson('https://www.dropbox.com/s/civ8ghtyu4glxgt/neighborhoods.json?dl=1');

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

/*  map.data.setStyle(function(feature) {
    var color = 'purple';
    if (feature.getProperty('isColorful')) {
      color = feature.getProperty('color');
    }
    return
    ({
      fillColor: color,
      strokeColor: color,
      strokeWeight: 2
    });
  });*/

  map.data.addListener('mouseover', function(event) {
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {strokeWeight: 8});
  });
}


function onLoadResponse(evt){

  var dropDown1= document.getElementById("puma_select");
  var dropDown2= document.getElementById("year_select");
  var dropDown3= document.getElementById("category_select");
  for(var i=0; i<years.length; i++){
    dropDown2.options.add( new Option(years[i]) );
  }

  for(var i=0; i<categories.length; i++){
    dropDown3.options.add( new Option(categories[i].Display, categories[i].Value) );
  }

  var xhr = evt.target;
  var jsonData=JSON.parse(xhr.responseText);
  neighborhoods=jsonData.puma_list;
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
  //TODO
  xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select+"&category="+drop3select, true );

  xhr.send();
}

//get results for a range of years
//TODO
//need to update this for all potential doubles
function getResultsTwo(){
  var drop1 = document.getElementById('puma_select');
  var drop2 = document.getElementById('year_select');
  var drop3 = document.getElementById('category_select');
  var drop4 = document.getElementById('year_select2');
//get value not text
  var drop1select = drop1.options[drop1.selectedIndex].text;
  var drop2select = drop2.options[drop2.selectedIndex].text;
  var drop3select = drop3.options[drop3.selectedIndex].value;
  var drop4select = drop4.options[drop4.selectedIndex].text;
  console.log(drop1select, drop2select, drop3select, drop4select);

  var params=[];
  params["puma"]=drop1select;
  params["year"]=drop2select;
  params["category"]=drop3select;
  params["year2"]=drop4select;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener( "load", onResponse );
  xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select+"&category="+drop3select+"&year2="+drop4select, true );

  xhr.send();
}

function onResponse( evt )
{
  var jsonData=JSON.parse(evt.target.responseText);
  //console.log("length"+jsonData.dataList.length);

  if (jsonData.dataType=="HHL"){
    HHL(jsonData);
  }
  if (jsonData.dataType=="FS"){
    FS(jsonData);
  }
  if (jsonData.dataType=="RNTP"){
    RNTP(jsonData);
  }
  if (jsonData.dataType=="VACS"){
    VACS(jsonData);
  }
}

function VACS(info){
  var text = document.getElementById( 'testText' );
  text.innerHTML="Vacancy stuff";
  drawChart();
}

function HHL(info){
  console.log('here');
  for(var year in info.dataList){
    var english =0;
    var spanish=0;
    var indeu=0;
    var asian=0;
    var other=0;
    console.log(year);
    for (var i=0; i<info.dataList[year].length; i++){
      if (info.dataList[info.year][i] ==1){
        english++;
      }
      if (info.dataList[info.year][i] ==2){
        spanish++;
      }
      if (info.dataList[info.year][i] ==3){
        indeu++;
      }
      if (info.dataList[info.year][i] ==4){
        asian++;
      }
      if (info.dataList[info.year][i] ==5){
        other++;
      }
    }
    drawHHLChart(english,spanish,indeu,asian,other);
  }



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
  for (var i=0; i<info.dataList.length; i++){
    if (info.dataList[i]==2){
      totalNo++;
    }
    else if(info.dataList[i]==1){
      totalYes++;
    }
    else{
      totalVacant++;

    }
  }

  text.innerHTML = "No :"+totalNo+" Yes: "+totalYes+" Vacant: "+totalVacant;
  drawFSChart(totalNo, totalYes, totalVacant);
}

function drawHHLChart(eng, span, indeu, asian, other) {
    // Create the data table.
    console.log('heee');
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['English', eng],
      ['Spanish', span],
      ['Indo-European Language', indeu],
      ['Asian and Pacific Islan Language', asian],
      ['Other', other],

    ]);
    var options = {'title':'Distribution of Household Languages',
                   'width':350,
                   'height':350};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
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


function addCategory(){
  var div = document.getElementById( 'category_container' );
  var button = document.getElementById( 'add_category' );
  var new_select=document.createElement('select');
  new_select.className="form-control";
  new_select.id="category_select2";
  for(var i=0; i<categories.length; i++){
    new_select.options.add( new Option(categories[i].Display, categories[i].Value) );
  }
  div.appendChild(new_select);
  div.removeChild(button);
}

function addNeighborhood(){
  var div = document.getElementById( 'puma_container' );
  var button = document.getElementById( 'add_puma' );
  var new_select=document.createElement('select');
  new_select.className="form-control";
  new_select.id="puma_select2";
  for(var i=0; i<neighborhoods.length; i++){
    new_select.options.add( new Option(neighborhoods[i]) );
  }
  div.appendChild(new_select);
  div.removeChild(button);
}
function addYear(){
  var div = document.getElementById( 'year_container' );
  var button = document.getElementById( 'add_year' );
  var new_select=document.createElement('select');
  new_select.className="form-control";
  new_select.id="year_select2";
  for(var i=0; i<years.length; i++){
    new_select.options.add( new Option(years[i]) );
  }
  div.appendChild(new_select);
  div.removeChild(button);
  oneYear=false;


}
