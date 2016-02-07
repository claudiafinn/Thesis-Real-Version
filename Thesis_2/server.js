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

        //check for problems in data
        //male sure no sql bad stuff
        var sqlString1 = "SELECT * FROM NEIGHBORHOODS WHERE "
        if(neighborhood2==" "){
          sqlString1+="Neighborhood = \""+neighborhood1+'\"';
        }
        else{
          sqlString1+="(Neighborhood = \""+neighborhood1 +"\" OR Neighborhood = \""+neighborhood2+"\")";
        }
        console.log(sqlString1);
        db.all(sqlString1,

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

            //console.log(pumaData);
            var sqlString2 = "SELECT * FROM House_Data3 WHERE (PUMA =  ";
            var first = true;
            for (var key in pumaData){
              if(first ==  true){sqlString2+=key}
              else{
                sqlString2 +=" OR PUMA = "+key;
              }
              first = false;
            }
            sqlString2+=" )";
            if (year2=="") { var dif = 0;}
            else { var dif = Math.abs(year-year2); }
            sqlString2+="AND (YEAR = "+year;
            for(var i=0; i<dif; i++){
              year++;
              sqlString2+=" OR YEAR = "+year
            }
            sqlString2+=")";

            var dataToSend={};
            for (var key in pumaData){
              dataToSend[key]={};
            }
            db.all(sqlString2,
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
              /*  var json = {};
                json.dataList=dataToSend;
                json.dataType=category;
                json.neighborhoods = pumaData;
*/
                //build sqlString for retrieving all the population data
                var sqlString3=" SELECT * FROM Population WHERE (CensusTract = "
                for (puma in pumaData){
                  for(neighborhood in pumaData[puma]){
                    for(census in pumaData[puma][neighborhood]){
                      sqlString3+=census +" OR CensusTract = ";
                    }
                  }
                }
                sqlString3+=" 0 )"

                console.log(sqlString3);
                db.all(sqlString3,
                  function( err, rows ) {
                    if(err){ console.log(err);}
                    for (var i=0; i<rows.length; i++){
                      for( puma in pumaData){
                        for (neighborhood in pumaData[puma]){
                          for (census in pumaData[puma][neighborhood]){
                            console.log ("HERE", census, rows[i]['CensusTract'])
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
                    console.log(pumaData);
                    var json = {};
                    json.dataList=dataToSend;
                    json.dataType=category;
                    json.neighborhoods = pumaData;
                    res.writeHead( 200 );
                    res.end(JSON.stringify(json));

                });
            });
        });

        //TODO
        //maybe won't do multiple categores
        /*else if(category2 !=""){
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
      }*/

        //multiple nieghborhoods
      /*  else if( puma2 !=""){
          db.all("SELECT PUMA FROM NEIGHBORHOODS WHERE Neighborhood = ? OR Neighborhood = ?", [ puma, puma2 ],
            function( err, rows ) {
              puma=rows[0].PUMA;
              puma2=rows[1].PUMA;
              var tracts=[];
              for(var i=0; i<rows.length; i++){
                tracts.push(rows[i]['CensusTract']);
                console.log(rows[i]['CensusTract']);
              }
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
              });
          });
        }*/
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
