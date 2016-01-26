var fs   = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();
var serveStatic = require('serve-static');
var qs = require( 'querystring' );


//my code compile repo ben /source/dmcc_server.js
//serveStatic library node will do all this


function serveDynamic( req, res )
{
    var qs_params = qs.parse( req.url.split( "?" )[ 1 ] );
    if( req.url.indexOf( "getData?" ) >= 0 )
    {
        var puma = qs_params.puma;
        var year = qs_params.year;
        var category = qs_params.category;
        //undefined if does not exist - but thats ok?
        var year2=qs_params.year2;
        var category2=qs_params.category2;
        var puma2=qs_params.puma2;
        var data="";
        var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );
        var query = "SELECT * FROM House_Data2 WHERE PUMA = ? AND YEAR = ?"

        //no doubles or double year
        if(typeof category2 == "undefined" && typeof puma2 == "undefined"){
          //get corresponding PUMA from NEIGHBORHOOD
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ?", [ puma ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              //single everything
              if(typeof year2 == "undefined" ){
                console.log("single everything");
                db.all( "SELECT * FROM House_Data2 WHERE PUMA = ? AND YEAR = ?",[puma, year],
                  function( err, rows ) {
                    if(err){ console.log(err);}
                    var dataToSend={};
                    for( var i = 0; i < rows.length; i++ )
                    {
                      if(!(rows[i]['YEAR'] in dataToSend))
                      {
                        dataToSend[rows[i]['YEAR']] = [ rows[i][category] ];
                      }
                      else {
                        dataToSend[rows[i]['YEAR']].push(rows[i][category]);
                      }
                    }
                    var json = {};
                    json.year = year;
                    json.dataList=dataToSend;
                    json.dataType=category;
                    res.writeHead( 200 );
                    res.end(JSON.stringify(json));
                  }
                );
              }
              //double year
              else{
                console.log("double year");
                //build sql string
                var sqlString = "SELECT * FROM House_Data2 WHERE PUMA = ? AND (YEAR = "+year;
                var dif = Math.abs(year-year2);
                for(var i=0; i<dif; i++){
                  year++;
                  sqlString+=" OR YEAR = "+year
                }
                sqlString+=")";

                db.all(sqlString,[puma],
                  function( err, rows ) {
                    if(err){ console.log(err);}
                    var dataToSend={};
                    for( var i = 0; i < rows.length; i++ )
                    {
                      if( !(rows[i]['YEAR'] in dataToSend)){dataToSend[rows[i]['YEAR']] = [ rows[i][category] ];}
                      else { dataToSend[rows[i]['YEAR']].push(rows[i][category]); }
                    }
                    var json = {};
                    json.year = year;
                    json.dataList=dataToSend;
                    json.dataType=category;
                    res.writeHead( 200 );
                    res.end(JSON.stringify(json));
                  }
                );
              }
            }
          );
        }
        //TODO
        else if(typeof category2 !="undefined"){
            //dif
            console.log("double cat");
        }
        //multiple nieghborhoods
        else if(typeof puma2 !="undefined"){
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ? OR Neighborhood = ?", [ puma, puma2 ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              puma2=rows[1].PUMA;
              console.log(puma, puma2)
              console.log("double puma");
              db.all( "SELECT * FROM House_Data2 WHERE (PUMA = ? OR PUMA = ?) AND YEAR = ?",[puma, puma2, year],
                function( err, rows ) {
                  if(err){ console.log(err);}
                  var jsonData =[]
                  for( var i = 0; i < rows.length; i++ )
                  {
                    var x ={"puma": rows[i]['PUMA'], "value":rows[i][category]}
                    jsonData.push(x);
                  }
                  var json = {};
                  json.dataList=jsonData;
                  json.dataType=category;
                  json.multipleYears=true;
                  res.writeHead( 200 );
                  res.end(JSON.stringify(json));
                }
              );
          }
        );
    }
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
                  pumas.push(rows[i].Neighborhood);
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
