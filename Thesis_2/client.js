
//var oneYear = true;
var years =["2006","2007", "2008", "2009", "2010", "2011", "2012", "2013"];
var categories = [ {"Value": "VACS", "Display":"Vacancy Status"},{"Value": "FS", "Display":"Food Stamp"},
                {"Value": "RNTP", "Display":"Monthly Rent"}, {"Value": "HHL", "Display":"Household Language"},
                {"Value": "MV", "Display":"Years Lived"},{"Value": "YBL", "Display":"Year Built"},
                {"Value": "VALP", "Display":"Property Value"},{"Value": "TAXP", "Display":"Property Taxes"},
                {"Value": "HHT", "Display":"Household Type"},{"Value": "HINCP", "Display":"Household Income"},
                {"Value": "NP" , "Display" :"People per Household"},{"Value": "MULTG", "Display" :"Multigenerational Household"},
                {"Value": "FPARC", "Display" :"Family Presence"},   {"Value": "WORKSTAT", "Display" :"Work Status"} ];
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
      center:{lat: 39.737760, lng: -105.000755},
  });

  map.data.loadGeoJson('http://localhost:8080/neighborhoods.json');

  //credit Tushar Gupta
  map.data.setStyle({
    //fillColor: 'grey',
    strokeWeight: 3,
    strokeColor : 'grey',
    fillOpacity : 0
  });

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


  map.data.addListener('mouseover', function(event) {
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {strokeWeight: 6, fillOpacity : 0});
  });

  map.data.addListener('click', function(event) {
    var name  = event.feature.getProperty('name');
    console.log(name);
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {strokeWeight: 6, fillOpacity : 7});
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
  //encode uri component(str)
  xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select+"&category="+drop3select+"&year2="+drop4select+"&cat2="+drop5select+"&puma2="+drop6select, true );

  xhr.send();
}

/*function doMapStuff(neighborhood){
   var map = document.getElementById('map');
   map.data.setStyle(function(feature){
     var name = feature.getProperty('name');
     console.log(name);
   });
}*/

function onResponse( evt )
{
  var chartDiv = document.getElementById('chart_div');
  while (chartDiv.hasChildNodes()) {
    chartDiv.removeChild(chartDiv.lastChild);
  }

  var jsonData=JSON.parse(evt.target.responseText);

  var text = document.getElementById('testText');
  for(var puma in jsonData.neighborhoods){
    for (var neighborhood in jsonData.neighborhoods[puma]){
      //var name = map.data.getProperty('name');
      //console.log(name);
      //doMapStuff(neighborhood);
      var population =0;
      var population2000=0;
      for (census in jsonData.neighborhoods[puma][neighborhood]){
        population+=jsonData.neighborhoods[puma][neighborhood][census]["Population"];
        population2000+=jsonData.neighborhoods[puma][neighborhood][census]["Population2000"];
        //console.log(census, jsonData.neighborhoods[puma][neighborhood][census]["Population"])
      }
      //console.log("pop", population)
      text.innerHTML = "Population 2010 : " +population + " Population 2000 : " +population2000;
    }
  }

  for (var puma in jsonData.dataList){
    for (var year in jsonData.dataList[puma]){
      if (jsonData.dataType=="VALP"){
        VALP(jsonData.dataList[puma][year], puma );
      }
      if (jsonData.dataType=="TAXP"){
        TAXP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="RNTP"){
        RNTP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="MV"){
        MV(jsonData.dataList[puma][year], puma );
      }
      if (jsonData.dataType=="YBL"){
        YBL(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="NP"){
        NP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="HHT"){
        HHT(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="FPARC"){
        FPARC(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="WORKSTAT"){
        WORKSTAT(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="MULTG"){
        MULTG(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="HINCP"){
        HINCP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="HHL"){
        HHL(jsonData.dataList[puma][year], puma );
      }
      if (jsonData.dataType=="FS"){
        FS(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="VACS"){
        VACS(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="VALP"){
        VALP(jsonData.dataList[puma][year], puma );;
      }
      if (jsonData.dataType=="FINCP"){
        FINCP(jsonData.dataList[puma][year], puma );;
      }

    }
  }
}


function VALP(info, key){
  var a=0; var b=0; var c=0; var d=0; var e=0; var f=0; var g=0; var h=0; var j=0; var k=0; var l=0; var m=0; var n=0;
  var na=0;
  for(var i=0; i<info.length; i++){

    if(info[i]==1 || info[i]==2 || (info[i]>0 && info[i]<14999)){
      a++;
    }
    else if (info[i]==3 || info[i]==4 || info[i]<24999){
      b++;
    }
    else if (info[i]==5 || info[i]==6 || info[i]<34999){
      c++;
    }
    else if (info[i]==7 || info[i]==8 || info[i]<49999){
      d++;
    }
    else if (info[i]==9 || info[i]==10 || info[i]<69999){
      e++;
    }
    else if (info[i]==11 || info[i]==12 || info[i]<89999){
      f++;
    }
    else if (info[i]==13 || info[i]==14 || info[i]<124999){
      g++;
    }
    else if (info[i]==15 || info[i]==16 || info[i]<174999){
      h++;
    }
    else if (info[i]==17 || info[i]==18 || info[i]<249999){
      j++;
    }
    else if (info[i]==19 || info[i]==20 || info[i]<399999){
      k++;
    }
    else if (info[i]==21 || info[i]==22 || info[i]<749999){
      l++;
    }
    else if (info[i]==23 || info[i]<999999){
      m++;
    }
    else if (info[i]==24 || info[i]>1000000){
      n++;
    }
    else{
      na++;
    }
  }
  drawVALPChart(na,a,b,c,d,e,f,g,h,j,k,l,m,n,key);
}
function TAXP(info, key){
  //range corresponding to dollar amt
}
function RNTP(info, key){
  //dollar amount
  var a=0; var b=0; var c=0; var d=0; var e=0;var f=0; var na=0;
  for(var i =0; i<info.length; i++){
    if(info[i]>0 && info[i]<300){
      a++;
    }
    else if( info[i]>0 && info[i]<500){
      console.log(info[i])
      b++;
    }
    else if(info[i]>0 && info[i]<1000){
      c++;
    }
    else if( info[i]>0 && info[i]<1500){
      d++;
    }
    else if( info[i]>0 && info[i]<2500){
      e++;
    }
    else if(info[i]>0 && info[i]>=2500){
      f++;
    }
    else{
      na++;
    }
  }
  var percentForRent = 100 - (na/(a+b+c+d+e+f+na));
  drawRNTPChart(a,b,c,d,e,f,percentForRent, key);
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
function NP(info, key){
  var a=0; var b=0; var c=0; var d=0; var e=0; var f=0; var g=0; var h=0;
  for(var i=0; i<info.length; i++){
    if(info[i]==1){
      a++
    }
    if(info[i]==2){
      b++
    }
    if(info[i]==3){
      c++
    }
    if(info[i]==4){
      d++
    }
    if(info[i]==5){
      e++
    }
    if(info[i]==6){
      f++
    }
    if(info[i]==7){
      g++
    }
    if(info[i]>=8){
      h++
    }
  }
  drawNPChart(a,b,c,d,e,f,g,h,key);
}
function FPARC(info, key){
  var under5 =0
  var over5 = 0;
  var both =0;
  var neither=0;
  var vacant=0;
  for(var i=0; i<info.length; i++){
    if(info[i]==1){
      under5++
    }
    else if(info[i]==2){
      over5++;
    }
    else if(info[i]==3){
      both++;
    }
    else if(info[i]==4){
      neither++;
    }
    else{
      vacant++;
    }
  }
  drawFPARCChart(under5, over5, both, neither, vacant, key);
}
function MULTG(info, key){
  var yes=0;
  var no=0;
  var vacant=0;
  for (var i=0; i<info.length; i++){
    if (info[i]==1){
      no++;
    }
    else if(info[i]==2){
      yes++;
    }
    else{
      vacant++;
    }
  }
  drawMULTGChart(no, yes, vacant, key);
}
function HINCP(info, key){
  var a=0; var b=0; var c=0; var d=0; var e=0; var f=0; var g=0; var h=0;
  for (var i=0; i<info.length; i++){
    if (info[i]<10,000){
      a++;
    }
    else if(info[i] <35000){
      b++;
    }
    else if(info[i] <75000){
      c++;
    }
    else if(info[i] <150000){
      d++;
    }
    else if(info[i] <250000){
      e++;
    }
    else if(info[i] <400000){
      f++;
    }
    else if(info[i] <650000){
      g++;
    }
    else{
      h++;
    }
  }
  drawHINCPChart(a,b,c,d,e,f,g,h,key);
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
function FS(info, key){
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
  var percentVacant=100 - ((h)/(a+b+c+d+e+f+g+h));
  drawVACSChart(a,b,c,d,e,f,g,percentVacant,key);
}
function HHT(info, key){
  var marriedCouple=0;
  var maleHouse=0;
  var femaleHouse=0;
  var maleAlone =0;
  var maleNotAlone=0;
  var femaleAlone=0;
  var femaleNotAlone=0;
  var vacant=0;
  for(var i=0; i<info.length; i++){
    if(info[i]==1){
      marriedCouple++;
    }
    else if(info[i]==2){
      maleHouse++;
    }
    else if(info[i]==3){
      femaleHouse++;
    }
    else if(info[i]==4){
      maleAlone++;
    }
    else if(info[i]==5){
      maleNotAlone++;
    }
    else if(info[i]==6){
      femaleAlone++;
    }
    else if(info[i]==7){
      femaleNotAlone++;
    }
    else{
      console.log("here" , info[i]);
      vacant++;
    }
  }
  drawHHTChart(marriedCouple, maleHouse, femaleHouse, maleAlone, maleNotAlone, femaleAlone, femaleNotAlone, vacant, key);
}
function WORKSTAT(info, key){
  var bothEmployed=0;
  var oneEmployed=0;
  var bothUnemployed=0;
  var singleEmployed=0;
  var singleUnemployed=0;
  for(var i=0; i<info.length; i++){
    if(info[i]==1){
      bothEmployed++;
    }
    if(info[i]==2 || info[i]==4){
      oneEmployed++;
    }
    if(info[i]==5){
      bothUnemployed++;
    }
    if(info[i]==10 || info[i]==13){
      singleEmployed++;
    }
    if(info[i]==11 || info[i]==14){
      singleUnemployed++;
    }
  }
  drawWORKSTATChart(bothEmployed, oneEmployed, bothUnemployed, singleEmployed, singleUnemployed, key);
}

function drawVALPChart(na,a,b,c,d,e,f,g,h,j,k,l,m,n,key){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['<$14,999', a, '#b87333'],            // RGB value
       ['$15,000-$24,999', b, 'purple'],
       ['$25,000-$34,999', c, 'green'],
       ['$35,000-$49,999', d, 'blue'],
       ['$50,000-$69,999', e, 'yellow'],
       ['$70,000-$89,999', f, 'red'],
       ['$90,000-$124,999', g, 'black'],
       ['$125,000-$174,999', h, 'gold'],
       ['$175,000-$249,999', j, 'yellow'],
       ['$250,000-$399,999', k, 'green'],
       ['$400,000-$749,999', l, 'blue'],
       ['$750,000-$1,000,000', m, 'grey'],
       ['$1,000,000+', n, 'green'],

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
function drawTAXPChart(){
  //
}
function drawRNTPChart(a,b,c,d,e,f,na,key){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['$0-$299', a, '#b87333'],            // RGB value
       ['$300-$499', b, 'purple'],
       ['$500-$999', c, 'green'],
       ['$1,000-$1,499', d, 'blue'],
       ['$1,500-$2,500', e, 'yellow'],
       ['$2,500+', f, 'red'],
      // ['Not for Rent', na, 'black'],

    ]);

  var options = {'title':key+ '%'+na+': Monthly Rent',
                 'width':350,
                 'height':350};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.ColumnChart(chartDiv);
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
function drawNPChart(a,b,c,d,e,f,g,h,key){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['1', a, '#b87333'],            // RGB value
       ['2', b, 'purple'],
       ['3', c, 'green'],
       ['4', d, 'blue'],
       ['5', e, 'yellow'],
       ['6', f, 'red'],
       ['7', g, 'black'],
       ['8+', h, 'gold'],
    ]);

  var options = {'title':key+': Year Moved into Properties',
                 'width':350,
                 'height':350};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawHHTChart(marriedCouple, maleHouse, femaleHouse, maleAlone, maleNotAlone, femaleAlone, femaleNotAlone, vacant, key){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['Married Couple Household', marriedCouple, '#b87333'],            // RGB value
       ['Male Family Household (No Wife Present)', maleHouse, 'purple'],
       ['Female Family Household(No Husband Present)', femaleHouse, 'green'],
       ['Male Householder, Living ALone', maleAlone, 'blue'],
       ['Male Householder, Not Living Alone', maleNotAlone, 'yellow'],
       ['Female Householder, Living Alone', femaleAlone, 'red'],
       ['Female Householder, Not Living Alone', femaleNotAlone, 'black'],
       ['Vacant', vacant, 'gold'],
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
function drawFPARCChart(under5, over5, both, neither, vacant, key){
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['Children present under 5', under5],
    ['Children present between 5 and 17', over5],
    ['Children present both under 5 and between 5 and 17', both],
    ['No related hildren', neither],
    ['Not a Family/Vacant', vacant],

  ]);

  // Set chart options
  var options = {'title':key+': Distribution of Households with Children',
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
function drawMULTGChart(no, yes, vacant, key){
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['Yes', yes],
    ['No', no],
    ['Vacant Household', vacant],

  ]);

  // Set chart options
  var options = {'title':key+': Multigenerational Households',
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
function drawHINCPChart(a,b,c,d,e,f,g,h,key){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['<$10,000', a, '#b87333'],            // RGB value
       ['$10,000-$34,999', b, 'purple'],
       ['$35,000-$74,999', c, 'green'],
       ['$75,000-$149,999', d, 'blue'],
       ['$150,000-$249,999', e, 'yellow'],
       ['$250,000-$399,999', f, 'red'],
       ['$400,000-$649,999', g, 'black'],
       ['>$650,000', h, 'gold'],
    ]);

  var options = {'title':key+': Year Moved into Properties',
                 'width':350,
                 'height':350};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawHHLChart(eng, span, indeu, asian, other, key) {
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
function drawVACSChart(a,b,c,d,e,f,g,h,key) {
    // TODO NEED A DIFFERENT CHART
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Reason');
    data.addColumn('number', 'Percentage');
    data.addRows([
      ['For Rent', a],
      ['Rented (not occupied)', b],
      ['For Sale', c],
      ['Sold (not occupies)', d],
      ['Season Use', e],
      ['Migratory Workers', f],
      ['Other', g],
      //['Occupied', h],

    ]);
    var options = {'title':key+': % Vacant = '+h,
                   'width':350,
                   'height':350};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.ColumnChart(chartDiv);
    chart.draw(data, options);
  }
function drawWORKSTATChart(bothEmployed, oneEmployed, bothUnemployed, singleEmployed, singleUnemployed, key){
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'percentage');
  data.addRows([
    ['Husband and Wife Employed', bothEmployed],
    ['Either Husband or Wife Employed', oneEmployed],
    ['Both Husband or Wife Unemployed', bothUnemployed],
    ['Single Household, Employed', singleEmployed],
    ['Single Household, Unemployed', singleUnemployed],

  ]);
  var options = {'title':key+': Employment',
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
