

function onPageLoad()
{
    //TODO make xhr's that get the puma and years from db
    //and populate drop down lists with them

    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onLoadResponse );
    xhr.open( "get", "load?", true );
    xhr.send();

}

function sendUpdateReq()
{
    // alert( "SENDUPDATE" );
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onResponse );
    xhr.open( "get", "idk?", true );
    xhr.send();
}

function getResults()
{
    var drop1 = document.getElementById('puma_select');
    var drop2 = document.getElementById('year_select')

    var drop1select = drop1.options[drop1.selectedIndex].text;
    var drop2select = drop2.options[drop2.selectedIndex].text;
    console.log(drop1select, drop2select);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onResponse );
    xhr.open( "get", "getData?puma="+drop1select+"&year="+drop2select, true );
    xhr.send();
}

//do all the things
function onLoadResponse(evt){
  console.log("HEREEE");
  var dropDown1= document.getElementById("puma_select");
  var dropDown2= document.getElementById("year_select");
  dropDown2.options.add( new Option("2013") );
  dropDown2.options.add( new Option("2014") );
  dropDown2.options.add( new Option("2015") );

  var xhr = evt.target;
  var jsonData=JSON.parse(xhr.responseText);
  console.log(jsonData.puma_list.length);
  for (var i=0; i<jsonData.puma_list.length; i++){
    dropDown1.options.add( new Option(jsonData.puma_list[i]) );
  }
}
function onResponse( evt )
{
    var xhr = evt.target;
    console.log( "Response text: ", xhr.responseText );
    var info = xhr.responseText.split(',');
    var table = document.getElementById( 'table' );
    for (var i =0; i<info.length; i++){
      var item =document.createElement('td');
      var row = document.createElement('tr');
      table.appendChild(row);
      row.appendChild(item);
      item.innerHTML = info[i];
    }
    //element.innerHTML = xhr.responseText;
}