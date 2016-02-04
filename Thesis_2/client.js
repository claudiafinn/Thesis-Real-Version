
//var oneYear = true;
var years =["2006","2007", "2008", "2009", "2010", "2011", "2012", "2013"];
var categories = [{"Value": "FS", "Display":"Food Stamp"}, {"Value": "VACS", "Display":"Vacancy Status"},
              {"Value": "RNTP", "Display":"Monthly Rent"}, {"Value": "HHL", "Display":"Household Language"},
            {"Value": "MV", "Display":"Years Lived"},{"Value": "YBL", "Display":"Year Built"},
          {"Value": "VALP", "Display":"Property Value"},{"Value": "TAXP", "Display":"Property Taxes"},
        {"Value": "HHT", "Display":"Household Type"},{"Value": "HINCP", "Display":"Household Income"},];
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

  map.data.loadGeoJson('http://localhost:8080/neighborhoods.json');

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


function getResults(){
  var drop1 = document.getElementById('puma_select');
  var drop2 = document.getElementById('year_select');
  var drop3 = document.getElementById('category_select');
  var drop1select = drop1.options[drop1.selectedIndex].text;
  var drop2select = drop2.options[drop2.selectedIndex].text;
  var drop3select = drop3.options[drop3.selectedIndex].value;
  var drop4select ="";
  var drop5select ="";
  var drop6select ="";

  var drop4 = document.getElementById('year_select2');
  if (drop4 != null){ drop4select = drop4.options[drop4.selectedIndex].text; }

  var drop5 = document.getElementById('category_select2');
  if (drop5 != null){ drop5select = drop5.options[drop5.selectedIndex].value;}

  var drop6 = document.getElementById('puma_select2');
  if (drop6 != null){ drop6select = drop6.options[drop6.selectedIndex].text;}

  var xhr = new XMLHttpRequest();
  xhr.addEventListener( "load", onResponse );
  xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select+"&category="+drop3select+"&year2="+drop4select+"&cat2="+drop5select+"&puma2="+drop6select, true );

  xhr.send();
}

//TODO
//how to call two different functions - if two categories
function onResponse( evt )
{
  var chartDiv = document.getElementById('chart_div');
  while (chartDiv.hasChildNodes()) {
    chartDiv.removeChild(chartDiv.lastChild);
  }

  var jsonData=JSON.parse(evt.target.responseText);
  console.log('here1');
  for (var puma in jsonData.dataList){
    for (var year in jsonData.dataList[puma]){
      if (jsonData.dataType=="HHL"){
        HHL(jsonData.dataList[puma][year], puma );
      }
      if (jsonData.dataType=="FS"){
        console.log (year, puma)
        console.log('here2' + jsonData.dataList[puma]);
        FS(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="RNTP"){
        RNTP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="VACS"){
        VACS(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="MV"){
        MV(jsonData.dataList[puma][year], puma );
      }
      if (jsonData.dataType=="YBL"){
        YBL(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="TAXP"){
        TAXP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="VALP"){
        VALP(jsonData.dataList[puma][year], puma );;
      }
    }
  }
}

function VALP(info, key){

}
function YBL(info, key){
  var a=0;
  var b=0;
  var c=0;
  var d=0;
  var e=0;
  var f=0;
  var g=0;
  var h=0;
  var i=0;
  var j=0;
  var k=0;
  var l=0;
  var m=0;
  var n=0;
  var o=0;
  var p=0;
  var q=0;

  for (var i=0; i<info.length; i++){
    if (info[i]==1){
     q++;
    }
    if (info[i]==2){
      p++;
    }
    if (info[i]==3){
      o++;
    }
    if (info[i]==4){
      n++;
    }
    if (info[i]==5){
      m++;
    }
    if (info[i]==6){
      l++;
    }
    if (info[i]==7){
      k++;
    }
    if (info[i]==8){
      j++;
    }
    if (info[i]==9){
      i++;
    }
    if (info[i]==10){
      h++;
    }
    if (info[i]==11){
      g++;
    }
    if (info[i]==12){
      f++;
    }
    if (info[i]==13){
      e++;
    }
    if (info[i]==14){
      d++;
    }
    if (info[i]==15){
      c++;
    }
    if (info[i]==16){
      b++;
    }
    if (info[i]==17){
      a++;
    }
  }
  drawYBLChart(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,key);
}

function VACS(info, key){
  console.log('vacs')

  var a=0;
  var b=0;
  var c=0;
  var d=0;
  var e=0;
  var f=0;
  var g=0;
  var h=0;
  for (var i=0; i<info.length; i++){
    if (info[i]==1){
      a++;
    }
    else if(info[i]==2){
      b++;
    }
    else if(info[i]==3){
      c++;
    }
    else if(info[i]==4){
      d++;
    }
    else if(info[i]==5){
      e++;
    }
    else if(info[i]==6){
      f++;
    }
    else if(info[i]==7){
      g++;
    }
    else{
      h++;

    }
  }
  drawVACSChart(a,b,c,d,e,f,g,h,key);
}

function HHL(info, key){
    var english =0;
    var spanish=0;
    var indeu=0;
    var asian=0;
    var other=0;
    for (var i=0; i<info.length; i++){
      if (info[i] ==1){
        english++;
      }
      if (info[i] ==2){
        spanish++;
      }
      if (info[i] ==3){
        indeu++;
      }
      if (info[i] ==4){
        asian++;
      }
      if (info[i] ==5){
        other++;
      }
    }
    drawHHLChart(english,spanish,indeu,asian,other, key);

}

function RNTP(info, key){
  var totalYes=0;
  var totalNo=0;
  var totalVacant=0;
  for (var i=0; i<info.length; i++){
    if (info[i]==2){
      totalNo++;
    }
    else if(info[i]==1){
      totalYes++;
    }
    else{
      totalVacant++;
    }
  }
  drawRNTPChart(totalNo, totalYes, totalVacant, key);
}

function MV(info, key){
  var a=0;
  var b=0;
  var c=0;
  var d=0;
  var e=0;
  var f=0;
  var g=0;
  var h=0;
  for (var i=0; i<info.length; i++){
    if (info[i]==1){
      a++;
    }
    else if(info[i]==2){
      b++;
    }
    else if(info[i]==3){
      c++;
    }
    else if(info[i]==4){
      d++;
    }
    else if(info[i]==5){
      e++;
    }
    else if(info[i]==6){
      f++;
    }
    else if(info[i]==7){
      g++;
    }
    else{
      h++;

    }
  }
  drawMVChart(a,b,c,d,e,f,g,h,key);
}

function FS(info, key){
  console.log('fs');
  var totalYes=0;
  var totalNo=0;
  var totalVacant=0;
  for (var i=0; i<info.length; i++){
    if (info[i]==2){
      totalNo++;
    }
    else if(info[i]==1){
      totalYes++;
    }
    else{
      totalVacant++;
    }
  }
  drawFSChart(totalNo, totalYes, totalVacant, key);
}


function drawHHLChart(eng, span, indeu, asian, other, key) {
    // Create the data table.
    //console.log('HHL CHART', eng, span, indeu, asian, other, year);
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
    var options = {'title':key+': Distribution of Household Languages',
                   'width':350,
                   'height':350};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }

function drawVACSChart(a,b,c,d,e,f,g,h,key) {
    // TODO NEED A DIFFERENT CHART
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['For Rent', a],
      ['Rented (not occupied)', b],
      ['For Sale', c],
      ['Sold (not occupies)', d],
      ['Season Use', e],
      ['Migratory Workers', f],
      ['Other', g],
      ['Occupied', h],

    ]);
    var options = {'title':key+': Vacancy Status',
                   'width':350,
                   'height':350};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }

function drawMVChart(a,b,c,d,e,f,g,h,key) {
    var data = new google.visualization.arrayToDataTable([
         ['Time', 'value', { role: 'style' }],
         ['<12 Months', a, '#b87333'],            // RGB value
         ['12-23 Months', b, 'purple'],
         ['2-4 Years', c, 'green'],
         ['5-9 Years', d, 'blue'],
         ['10-19 Years', e, 'yellow'],
         ['20-29 Years', f, 'red'],
         ['30+ Years', g, 'black'],
         ['Vacant', h, 'gold'],
      ]);

    var options = {'title':key+': Year Moved into Properties',
                   'width':350,
                   'height':350};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.ColumnChart(chartDiv);
    chart.draw(data, options);
  }

function drawFSChart(no, yes, vac, key) {
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
    var options = {'title':key+': Percentage of Households using Food Stamps',
                   'width':400,
                   'height':300};

    // Instantiate and draw our chart, passing in some options.
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }

function drawYBLChart(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,key){
  var data = new google.visualization.DataTable();
  console.log('here');
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['2013', a],
    ['2012', b],
    ['2011', c],
    ['2010', d],
    ['2009', e],
    ['2008', f],
    ['2007', g],
    ['2006', h],
    ['2005', i],
    ['2000-2004', j],
    ['1990-1999', k],
    ['1980-1989', l],
    ['1970-1979', m],
    ['1960-1969', n],
    ['1950-1959', o],
    ['1940-1949', p],
    ['1939 or earlier', q],

  ]);
  var options = {'title':key+': Year Structure Built',
                 'width':350,
                 'height':350};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
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


/*function addCategory(){
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
}*/

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

  var div2 = document.getElementById( 'year_container' );
  var button2 = document.getElementById( 'add_year' );
  div.removeChild(button2);
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

  var div2 = document.getElementById( 'puma_container' );
  var button2 = document.getElementById( 'add_puma' );
  div2.removeChild(button2);
}
