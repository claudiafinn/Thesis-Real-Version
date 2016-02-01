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
        var category2=qs_params.cat2;
        var puma2=qs_params.puma2;
        var data="";
        var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );
        var query = "SELECT * FROM House_Data3 WHERE PUMA = ? AND YEAR = ?"

        //1 OR MULTIPLE YEAR QUERY
        console.log(category2, puma2, year2);
        if( (category2 == "") &&  (puma2 == "")){
          //get corresponding PUMA from NEIGHBORHOOD
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ?", [ puma ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              //build sql string
              var sqlString = "SELECT * FROM House_Data3 WHERE PUMA = ? AND (YEAR = "+year;
              if (year2=="") { var dif = 0;}
              else { var dif = Math.abs(year-year2); }
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
                    if( !(rows[i]['YEAR'] in dataToSend))
                    {
                      dataToSend[rows[i]['YEAR']] = [ rows[i][category] ];
                    }
                    else {
                      dataToSend[rows[i]['YEAR']].push(rows[i][category]);
                    }
                  }

                  var json = {};
                  json.dataList=dataToSend;
                  json.dataType=category;
                  res.writeHead( 200 );
                  res.end(JSON.stringify(json));
              });
          });
        }

        //TODO
        else if(category2 !=""){
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ? ", [ puma ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              console.log("double cat", puma, year, category, category2);
              db.all( "SELECT * FROM House_Data3 WHERE PUMA = "+puma+"  AND YEAR = "+year,
                function( err, rows ) {
                  if(err){ console.log(err);}
                  var dataToSend={};
                  console.log(rows.length, category, category2);
                  for( var i = 0; i < rows.length; i++ )
                  {
                    if( !(category in dataToSend) && !(category2 in dataToSend))
                    {
                      dataToSend[category] = [];
                      dataToSend[category2] =[];
                    }
                    dataToSend[category].push(rows[i][category]);
                    dataToSend[category2].push(rows[i][category2] );
                  }
                  var json = {};
                  json.dataList=dataToSend;
                  json.dataType=category;
                  res.writeHead( 200 );
                  res.end(JSON.stringify(json));
                }
              );
          }
        );
        }

        //multiple nieghborhoods
        else if( puma2 !=""){
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ? OR Neighborhood = ?", [ puma, puma2 ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              puma2=rows[1].PUMA;
              console.log(puma, puma2)
              console.log("double puma");
              db.all( "SELECT * FROM House_Data3 WHERE (PUMA = ? OR PUMA = ?) AND YEAR = ?",[puma, puma2, year],
                function( err, rows ) {
                  if(err){ console.log(err);}
                  var dataToSend={};
                  for( var i = 0; i < rows.length; i++ )
                  {
                    if( !(rows[i]['PUMA'] in dataToSend))
                    {
                      dataToSend[rows[i]['PUMA']] = [ rows[i][category] ];
                    }
                    else {
                      dataToSend[rows[i]['PUMA']].push(rows[i][category]);
                    }
                  }
                  var json = {};
                  json.dataList=dataToSend;
                  json.dataType=category;
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
  res.setHeader("Access-Control-Allow-Origin","*");
  serveFiles( req, res, function() {  serveDynamic( req, res ); ;});
}

var server = http.createServer( onRequest );
server.listen( 8080 );
