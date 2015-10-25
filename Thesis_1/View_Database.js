var fs = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();


function getFormValuesFromURL( url )
{
    var kvs = {};
    var parts = url.split( "?" );
    var key_value_pairs = parts[1].split( "&" );
    for( var i = 0; i < key_value_pairs.length; i++ )
    {
        var key_value = key_value_pairs[i].split( "=" );
        kvs[ key_value[0] ] = key_value[1];
    }

    return kvs
}

function thesis_server(req, res){
  console.log(req.url);
  var filename = "./" + req.url;
  try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
         if( req.url.indexOf( "data_form?" ) >= 0 ){
            var kvs = getFormValuesFromURL( req.url );
            var db = new sql.Database( 'thesis_data.sqlite' );

            db.all( "SELECT * FROM House_Data WHERE PUMA = ? AND YEAR = ?",[ kvs['PUMA'],kvs['Year'] ],
                function( err, rows ) {
                    if(err){ console.log(err);}
                    res.writeHead( 200 );
                    var resp_text = "<html><body><table><tbody>";
                    for( var i = 0; i < rows.length; i++ )
                    {
                        resp_text += "<tr><td>"+ rows[i].SERIALNO +"</td>" ;
                        resp_text += "<td>"+ rows[i].PUMA +"</td>"+"</tr>";
                    }
                    resp_text += "</tbody></table></body></html>";
                    res.end(  resp_text );
                } );

         }

         else
        {
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
      }
    }

var server = http.createServer( thesis_server );

server.listen( 8080 );
