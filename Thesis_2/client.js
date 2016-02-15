
//var oneYear = true;
//adding some comments
//nothing exciting
//another change
var years =["2006","2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];
var categories = [ {"Value": "VACS", "Display":"Vacancy Status"},{"Value": "FS", "Display":"Food Stamp"},
                {"Value": "RNTP", "Display":"Monthly Rent"}, {"Value": "HHL", "Display":"Household Language"},
                {"Value": "MV", "Display":"Years Lived"},{"Value": "YBL", "Display":"Year Built"},
                {"Value": "VALP", "Display":"Property Value"},{"Value": "TAXP", "Display":"Property Taxes"},
                {"Value": "HHT", "Display":"Household Type"},{"Value": "HINCP", "Display":"Household Income"},
                {"Value": "NP" , "Display" :"People per Household"},{"Value": "MULTG", "Display" :"Multigenerational Household"},
                {"Value": "FPARC", "Display" :"Family Presence"},   {"Value": "WORKSTAT", "Display" :"Work Status"} ];
var neighborhoods=[];
var map;
var windows=[];


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
  map = new google.maps.Map(document.getElementById('map'), {
      zoom: minZoomLevel,
      center:{lat: 39.737760, lng: -105.000755},
  });
  var markers=[];

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
  //  map.data.revertStyle();
  //  map.data.overrideStyle(event.feature, {strokeWeight: 6, fillOpacity : 0});
  });

  var infowindow = new google.maps.InfoWindow();

  map.data.addListener('click', function(event) {
    //delete old marker and window
    for(var i = 0; i < markers.length; i++){
       markers[i].setMap(null);
    }
    markers=[];
    infowindow.close();
    //create new marker and window
    var marker = new google.maps.Marker({position: event.latLng, map: map});
    markers.push(marker)
    var name  = event.feature.getProperty('name');
    infowindow.setContent("<p style=\"color:black;\">"+name+"</p>");
    infowindow.open(map, marker);
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {strokeWeight: 5, fillOpacity : .4, fillColor : '#ccffff'});
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


function onResponse( evt )
{

  var chartDiv = document.getElementById('chart_div');
  while (chartDiv.hasChildNodes()) {
    chartDiv.removeChild(chartDiv.lastChild);
  }
  var jsonData=JSON.parse(evt.target.responseText);

  for(var i=0; i<windows.length; i++){
    windows[i].close();
  }
  windows=[];
  var mapNeighborhood="";
  var populationString="";
  var marker;
  for(var puma in jsonData.neighborhoods){
    for (var neighborhood in jsonData.neighborhoods[puma]){
      mapNeighborhood=neighborhood;
      var population =0;
      var population2000=0;
      for (census in jsonData.neighborhoods[puma][neighborhood]){
        population+=jsonData.neighborhoods[puma][neighborhood][census]["Population"];
        population2000+=jsonData.neighborhoods[puma][neighborhood][census]["Population2000"];
      }
    }
    populationString=" Population 2010 : " +population + "\r\n Population 2000 : " +population2000;
    map.data.forEach(function(feature) {
      if( neighborhood == feature.getProperty('name')){
        var ifw = new google.maps.InfoWindow();

        var coords = feature.getGeometry().getAt(0).getAt(0);
        marker = new google.maps.Marker({position: coords, map: map});

        ifw.setContent("<p style=\"color:black;\">"+mapNeighborhood+"</p>"+
                              "<p style=\"color:black;\">"+ populationString+"</p>"
                                );
        ifw.open(map, marker);
        windows.push(ifw);
        map.data.overrideStyle(feature, {strokeWeight: 5, fillOpacity : .4, fillColor : '#ccffff'});
      }
    });
  }
  for (var puma in jsonData.dataList){
    for (var year in jsonData.dataList[puma]){
      if (jsonData.dataType=="VALP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        VALP(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="TAXP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        TAXP(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="RNTP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        RNTP(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="MV"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        MV(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="YBL"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        YBL(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="NP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        NP(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="HHT"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        HHT(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="FPARC"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        FPARC(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="WORKSTAT"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        WORKSTAT(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="MULTG"){
        if(year==2006 || year==2007 ){
          console.log('doenst exist')
        }
        else{
          var key =""
          for (key2 in jsonData.neighborhoods[puma]){key=key2}
          MULTG(jsonData.dataList[puma][year], year, key);
        }
      }
      if (jsonData.dataType=="HINCP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        HINCP(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="HHL"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        HHL(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="FS"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        FS(jsonData.dataList[puma][year], year, key);
      }
      if(jsonData.dataType=="VACS"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        VACS(jsonData.dataList[puma][year], year, key);
      }
      if (jsonData.dataType=="FINCP"){
        var key =""
        for (key2 in jsonData.neighborhoods[puma]){key=key2}
        FINCP(jsonData.dataList[puma][year], year, key);
      }

    }
  }
}

function VALP(info, year, neighborhood){
  var a=0; var b=0; var c=0; var d=0; var e=0; var f=0; var g=0; var h=0; var j=0; var k=0; var l=0; var m=0; var n=0;
  var na=0;
  for(var i=0; i<info.length; i++){

    if(info[i]==1 || info[i]==2 || (info[i]>25 && info[i]<14999)){
      a++;
    }
    else if (info[i]==3 || info[i]==4 || (info[i]>25 && info[i]<24999)){
      b++;
    }
    else if (info[i]==5 || info[i]==6 || (info[i]>25 &&info[i]<34999)){
      c++;
    }
    else if (info[i]==7 || info[i]==8 || (info[i]>25 &&info[i]<49999)){
      d++;
    }
    else if (info[i]==9 || info[i]==10 || (info[i]>25 &&info[i]<69999)){
      e++;
    }
    else if (info[i]==11 || info[i]==12 || (info[i]>25 &&info[i]<89999)){
      f++;
    }
    else if (info[i]==13 || info[i]==14 || (info[i]>25 &&info[i]<124999)){
      g++;
    }
    else if (info[i]==15 || info[i]==16 || (info[i]>25 &&info[i]<174999)){
      h++;
    }
    else if (info[i]==17 || info[i]==18 || (info[i]>25 &&info[i]<249999)){
      j++;
    }
    else if (info[i]==19 || info[i]==20 || (info[i]>25 &&info[i]<399999)){
      k++;
    }
    else if (info[i]==21 || info[i]==22 || (info[i]>25 &&info[i]<749999)){
      l++;
    }
    else if (info[i]==23 || (info[i]>25 &&info[i]<999999)){
      m++;
    }
    else if (info[i]==24 || (info[i]>25 &&info[i]>1000000)){
      n++;
    }
    else{
      na++;
    }
  }
  drawVALPChart(na,a,b,c,d,e,f,g,h,j,k,l,m,n,year, neighborhood);
}
function TAXP(info, key){
  //range corresponding to dollar amt
}
function RNTP(info, year, neighborhood){
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
  drawRNTPChart(a,b,c,d,e,f,percentForRent, year, neighborhood);
}
function MV(info,  year, neighborhood){
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
  drawMVChart(a,b,c,d,e,f,g,h,year, neighborhood);
}
function YBL(info,  year, neighborhood){
  var a=0;
  var b=0;
  var c=0;
  var d=0;
  var e=0;
  var f=0;
  var g=0;
  var h=0;
  var x=0;
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
      x++;
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
  drawYBLChart(a,b,c,d,e,f,g,h,x,j,k,l,m,n,o,p,q,year, neighborhood);
}
function NP(info,  year, neighborhood){
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
  drawNPChart(a,b,c,d,e,f,g,h,year, neighborhood);
}
function FPARC(info,  year, neighborhood){
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
  drawFPARCChart(under5, over5, both, neither, vacant, year, neighborhood);
}
function MULTG(info,  year, neighborhood){
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
  drawMULTGChart(no, yes, vacant, year, neighborhood);
}
function HINCP(info,  year, neighborhood){
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
  drawHINCPChart(a,b,c,d,e,f,g,h,year, neighborhood);
}
function HHL(info,  year, neighborhood){
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
    drawHHLChart(english,spanish,indeu,asian,other, year, neighborhood);

}
function FS(info,  year, neighborhood){
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
  drawFSChart(totalNo, totalYes, totalVacant, year, neighborhood);
}
function VACS(info,  year, neighborhood){
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
  var percentVacant=Math.round(100 - ((h)/(a+b+c+d+e+f+g+h)));
  drawVACSChart(a,b,c,d,e,f,g,percentVacant,year, neighborhood);
}
function HHT(info,  year, neighborhood){
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
      vacant++;
    }
  }
  drawHHTChart(marriedCouple, maleHouse, femaleHouse, maleAlone, maleNotAlone, femaleAlone, femaleNotAlone, vacant, year, neighborhood);
}
function WORKSTAT(info,  year, neighborhood){
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
  drawWORKSTATChart(bothEmployed, oneEmployed, bothUnemployed, singleEmployed, singleUnemployed, year, neighborhood);
}

function drawVALPChart(na,a,b,c,d,e,f,g,h,j,k,l,m,n,year,neighborhood){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['<$14,999', a, '#94DFF7'],            // RGB value
       ['$15,000-$24,999', b, '#68C4E3'],
       ['$25,000-$34,999', c, '#1A27DB'],
       ['$35,000-$49,999', d, '#711ADB'],
       ['$50,000-$69,999', e, '#AA28EB'],
       ['$70,000-$89,999', f, '#DA28EB'],
       ['$90,000-$124,999', g, '#EB28A6'],
       ['$125,000-$174,999', h, '#EB283F'],
       ['$175,000-$249,999', j, '#F2780C'],
       ['$250,000-$399,999', k, '#F2AD0C'],
       ['$400,000-$749,999', l, '#F2EE0C'],
       ['$750,000-$1,000,000', m, '#9EF20C'],
       ['$1,000,000+', n, '#0CF210'],

    ]);

  var options = {'title':year+' '+neighborhood+':Property Value',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'},
                 colors: ['#ACADE8', '#8182E6', '#6668E8', '#2327DE', '#A023DE', '#D523DE', '#DE23A3', '#DE2384', '#DE2346', '#FC0313', '#FC2C03', '#FCF803']
                 };
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawTAXPChart(){
  //
}
function drawRNTPChart(a,b,c,d,e,f,na,year,neighborhood){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['$0-$299', a, '#94DFF7'],            // RGB value
       ['$300-$499', b, '#68C4E3'],
       ['$500-$999', c, 'green'],
       ['$1,000-$1,499', d, 'blue'],
       ['$1,500-$2,500', e, 'yellow'],
       ['$2,500+', f, 'red'],
      // ['Not for Rent', na, 'black'],

    ]);

  var options = {'title':year+' '+neighborhood+': Monthly Rent',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawMVChart(a,b,c,d,e,f,g,h,year,neighborhood) {
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

    var options = {'title':year+' '+neighborhood+': Year Moved into Properties',
                  'width':350,
                  'height':300,
                  'legend': { position: "none" }
                  };
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.ColumnChart(chartDiv);
    chart.draw(data, options);
  }
function drawYBLChart(a,b,c,d,e,f,g,h,x,j,k,l,m,n,o,p,q,year,neighborhood){
  var data = new google.visualization.DataTable();
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
    ['2005', x],
    ['2000-2004', j],
    ['1990-1999', k],
    ['1980-1989', l],
    ['1970-1979', m],
    ['1960-1969', n],
    ['1950-1959', o],
    ['1940-1949', p],
    ['1939 or earlier', q],

  ]);
  var options = {'title':year+' '+neighborhood+': Year Structure Built',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawNPChart(a,b,c,d,e,f,g,h,year,neighborhood){
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

  var options = {'title':year+' '+neighborhood+': Year Moved into Properties',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawHHTChart(marriedCouple, maleHouse, femaleHouse, maleAlone, maleNotAlone, femaleAlone, femaleNotAlone, vacant, year,neighborhood){
  var data = new google.visualization.arrayToDataTable([
       ['Time', 'value', { role: 'style' }],
       ['Married Couple Household', marriedCouple, '#b87333'],            // RGB value
       ['Male Family Household', maleHouse, 'purple'],
       ['Female Family Household', femaleHouse, 'green'],
       ['Male House holder, Living ALone', maleAlone, 'blue'],
       ['Male House holder, Not Living Alone', maleNotAlone, 'yellow'],
       ['Female House holder, Living Alone', femaleAlone, 'red'],
       ['Female House holder, Not Living Alone', femaleNotAlone, 'black'],
       ['Vacant', vacant, 'gold'],
    ]);

  var options = {'title':year+' '+neighborhood+': Year Moved into Properties',
                 'width':400,
                 'height':350,
                 'legend': {position: 'right', textStyle: {fontSize: 11}},
                 'chartArea': {width: '80%', height: '85%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block; width: 400; height: 300;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawFPARCChart(under5, over5, both, neither, vacant, year,neighborhood){
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
  var options = {'title':year+' '+neighborhood+': Distribution of Households with Children',
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
function drawMULTGChart(no, yes, vacant, year,neighborhood){
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['Yes', yes],
    ['No', no],
    ['Vacant Household', vacant],

  ]);

  // Set chart options
  var options = {'title':year+' '+neighborhood+': Multigenerational Households',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};

  // Instantiate and draw our chart, passing in some options.
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawHINCPChart(a,b,c,d,e,f,g,h,year,neighborhood){
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

  var options = {'title':year+' '+neighborhood+': Year Moved into Properties',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}
function drawHHLChart(eng, span, indeu, asian, other, year,neighborhood) {
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
    var options = {'title':year+' '+neighborhood+': Distribution of Household Languages',
                  'width':350,
                  'height':300,
                 'chartArea': {width: '80%'}};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }
function drawFSChart(no, yes, vac, year,neighborhood) {
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
    var options = {'title':year+' '+neighborhood+': Percentage of Households using Food Stamps',
                    'width':350,
                    'height':300,
                   'chartArea': {width: '80%'}};

    // Instantiate and draw our chart, passing in some options.
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }
function drawVACSChart(a,b,c,d,e,f,g,h,year,neighborhood) {
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
    var options = {'title':year+' '+neighborhood+': % Vacant = '+h,
                   'width':350,
                   'height':300,
                  'chartArea': {width: '80%'}};
    var div = document.getElementById('chart_div');
    var chartDiv = document.createElement('div');
    chartDiv.setAttribute("style", "display: inline-block;")
    div.appendChild(chartDiv);
    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
  }
function drawWORKSTATChart(bothEmployed, oneEmployed, bothUnemployed, singleEmployed, singleUnemployed, year,neighborhood){
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
  var options = {'title':year+' '+neighborhood+': Employment',
                'width':350,
                'height':300,
               'chartArea': {width: '80%'}};
  var div = document.getElementById('chart_div');
  var chartDiv = document.createElement('div');
  chartDiv.setAttribute("style", "display: inline-block;")
  div.appendChild(chartDiv);
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);
}

function sendUpdateReq(){
    // alert( "SENDUPDATE" );
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onResponse );
    xhr.open( "get", "idk?", true );
    xhr.send();
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

  var div2 = document.getElementById( 'year_container' );
  var button2 = document.getElementById( 'add_year' );
  div2.removeChild(button2);
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
