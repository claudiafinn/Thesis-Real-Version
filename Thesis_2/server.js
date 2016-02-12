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
        var neighborhood1 = qs_params.puma;
        var neighborhood2=qs_params.puma2;
        var year = qs_params.year;
        var year2=qs_params.year2;
        var category = qs_params.category;
        var data="";
        var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );

        var sqlString1 = "SELECT * FROM NEIGHBORHOODS WHERE ";
        var sqlString1List = [];
        if(neighborhood2==" "){
          sqlString1+="Neighborhood = ? "
          sqlString1List.push(neighborhood1);
        }
        else{
          sqlString1+="(Neighborhood = ? OR Neighborhood = ?)";
          sqlString1List.push(neighborhood1);
          sqlString1List.push(neighborhood2);
        }
        db.all(sqlString1, sqlString1List,
          function( err, rows ) {
            var pumaData = {};
            for(var i=0; i<rows.length; i++){
              if (rows[i]['PUMA'] in pumaData){
                if(rows[i]['Neighborhood'] in pumaData[rows[i]['PUMA']]){
                  pumaData[rows[i]['PUMA']][rows[i]['Neighborhood']][rows[i]['CensusTract']] = {};
                }
                else{
                  pumaData[rows[i]['PUMA']][rows[i]['Neighborhood']] = {};
                  pumaData[rows[i]['PUMA']][rows[i]['Neighborhood']][rows[i]['CensusTract']] = {};
                }
              }
              else{
                pumaData[rows[i]['PUMA']]={};
                pumaData[rows[i]['PUMA']][rows[i]['Neighborhood']] ={};
                pumaData[rows[i]['PUMA']][rows[i]['Neighborhood']][rows[i]['CensusTract']]={};
              }
            }

            var sqlString2 = "SELECT * FROM House_Data3 WHERE (PUMA =  ?";
            var sqlString2List =[]
            var first = true;
            for (var key in pumaData){
              if(first ==  true){sqlString2List.push(parseInt(key))}
              else{
                sqlString2 +=" OR PUMA = ?";
                sqlString2List.push(parseInt(key));
              }
              first = false;
            }
            sqlString2+=" )";

            if (year2=="") { var dif = 0;}
            else { var dif = Math.abs(year-year2); }
            sqlString2+="AND (YEAR = ?"
            sqlString2List.push(parseInt(year));
            for(var i=0; i<dif; i++){
              year++;
              sqlString2+=" OR YEAR = ?"
              sqlString2List.push(parseInt(year));
            }
            sqlString2+=")";
            var dataToSend={};
            for (var key in pumaData){
              dataToSend[key]={};
            }
            db.all(sqlString2, sqlString2List,
              function( err, rows ) {
                if(err){ console.log(err);}
                for( var i = 0; i < rows.length; i++ )
                {
                  if( !(rows[i]['YEAR'] in dataToSend[rows[i]['PUMA']]))
                  {
                    dataToSend[rows[i]['PUMA']][rows[i]['YEAR']] = [ rows[i][category] ];
                  }
                  else {
                    dataToSend[rows[i]['PUMA']][rows[i]['YEAR']].push(rows[i][category]);
                  }
                }

                var sqlString3=" SELECT * FROM Population WHERE (CensusTract = ";
                var sqlString3List=[];
                for (puma in pumaData){
                  for(neighborhood in pumaData[puma]){
                    for(census in pumaData[puma][neighborhood]){
                      sqlString3+="? OR CensusTract = ";
                      sqlString3List.push(census);
                    }
                  }
                }
                sqlString3+=" 0 )"
                db.all(sqlString3, sqlString3List,
                  function( err, rows ) {

                    if(err){ console.log(err);}
                    for (var i=0; i<rows.length; i++){
                      for( puma in pumaData){
                        for (neighborhood in pumaData[puma]){
                          for (census in pumaData[puma][neighborhood]){
                            if (rows[i]['CensusTract'] == census){
                              pumaData[puma][neighborhood][census]["Population"] = rows[i]['Population2010'];
                              pumaData[puma][neighborhood][census]["Population2000"] = rows[i]['Population2000'];
                              pumaData[puma][neighborhood][census]["Housing"] = rows[i]['Housing2010'];
                              pumaData[puma][neighborhood][census]["Housing2000"] = rows[i]['Housing2000'];
                            }
                          }
                        }
                      }
                    }
                    var json = {};
                    json.dataList=dataToSend;
                    json.dataType=category;
                    json.neighborhoods = pumaData;
                    res.writeHead( 200 );
                    res.end(JSON.stringify(json));

                });
            });
        });
    }

    else if( req.url.indexOf( "load?" ) >= 0 )
    {
      var db = new sql.Database( 'Thesis_data/thesis_data.sqlite' );
      var pumas =[]
      db.all( "SELECT DISTINCT NEIGHBORHOOD FROM NEIGHBORHOODS",
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
        });
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
