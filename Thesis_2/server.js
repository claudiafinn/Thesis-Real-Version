var fs   = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();
var serveStatic = require('serve-static');
//var the_num = 0;

//async library

function getFormValuesFromURL( url )
{
    var kvs = {};
    var parts = url.split( "?" );
    if( parts.length === 2 )
    {
        var key_value_pairs = parts[1].split( "&" );
        for( var i = 0; i < key_value_pairs.length; i++ )
        {
            var key_value = key_value_pairs[i].split( "=" );
            kvs[ key_value[0] ] = key_value[1];
        }
    }
    return kvs
}

/*function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    //39.742141, -105.022376
    center: {lat: 39.742141, lng: -105.022376}
  });

  var ctaLayer = new google.maps.KmlLayer({
    url: 'http://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml',
    map: map
  });
}*/

//my code compile repo ben /source/dmcc_server.js
//serveStatic library node will do all this


function serveDynamic( req, res )
{
  //  initMap();
  //  var kvs = getFormValuesFromURL( req.url );
    console.log(req.url);
    if( req.url.indexOf( "getData?" ) >= 0 )
    {
        //TODO
        //library that does this for me - node qs
        //url encoding/decoding
        //var qs = require ('query-string'
       //code compile ben)
        var url_parts = req.url.split('?');
        var more_parts=url_parts[1].split('&');
        var puma = more_parts[0].split('=')[1];
        var year = more_parts[1].split('=')[1];
        var category = more_parts[2].split('=')[1];
        var data=""
        console.log(puma, year, category);
        var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );
        var temp = "SERIALNO";
        //db.all( "SELECT ? FROM House_Data2 WHERE PUMA = ? AND YEAR = ?",[category, parseInt(puma), parseInt(year)],

        db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ?", [ puma ],
          function( err, rows ) {
            console.log(rows[0].PUMA);
            puma=rows[0].PUMA;

              console.log("hello",puma, year);
              db.all( "SELECT * FROM House_Data2 WHERE PUMA = ? AND YEAR = ?",[puma, year],
                function( err, rows ) {
                  if(err){ console.log(err);}
                  for( var i = 0; i < rows.length; i++ )
                  {
                    data=data+(rows[i][category])+",";
                  }
                  res.writeHead( 200 );
                  res.end( category+","+data );
                } );
        });
    }

    else if( req.url.indexOf( "load?" ) >= 0 )
    {

      var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );
      var pumas =[]
      db.all( "SELECT NEIGHBORHOOD FROM NEIGHBORHOODS",
            function( err, rows ) {
                if(err){ console.log(err);}
                for( var i = 0; i < rows.length; i++ )
                {
                  console.log(rows[i].Neighborhood);
                  pumas.push(rows[i].Neighborhood);
                /*  if(pumas.indexOf(parseInt(rows[i].PUMA))==-1){
                      pumas.push(parseInt(rows[i].PUMA))
                    //  console.log(parseInt(rows[i].PUMA))
                  }*/
                }
              var jsonData ={}
              jsonData.puma_list=pumas;
              res.writeHead( 200 );
              res.end( JSON.stringify(jsonData ));
              } );
    }

    else
    {
        res.writeHead( 404 );
        res.end( "Unknown URL: "+req.url );
    }
}

var serveFiles = serveStatic( './Thesis_2/' , {'index ' : [ 'index.html', 'index.htm']});

function onRequest(req, res){
  serveFiles( req, res, function() {  serveDynamic( req, res ); ;});
}

var server = http.createServer( onRequest );
server.listen( 8080 );
