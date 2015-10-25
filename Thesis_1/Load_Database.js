var fs = require( 'fs' );
var sql = require( 'sqlite3' ).verbose();
var db = new sql.Database( 'thesis_data.sqlite' );

if( process.argv.length < 3 ){
    console.log( "Usage: Need a filename, dummy" );
    process.exit( 1 );
}

var filename = process.argv[ 2 ];
var year =parseInt(process.argv[ 3 ]);

console.log( "You want me to read file: ", filename , year);

try{
    var fileBuffer = fs.readFileSync( filename );
}
catch( exp ){
    console.log( "Failed to read file", filename );
    process.exit( 2 );
}

var contents = fileBuffer.toString();
var contents_lines = contents.split( '?' );

var columns=contents_lines[0].split(',');
var type=" INTEGER "
var data="(";
//console.log(columns);

for (var i=0; i<columns.length-1;i++){
  data+="'"+columns[i] +"'";
  data+="INTEGER";
  data+=",";
}
data+="'"+columns[columns.length]+ "'";
data+=type +")";
//console.log(data);
//db.run("DROP TABLE House_Data", function(err){});
db.run("CREATE TABLE IF NOT EXISTS House_Data "+data,
  function(err){
    //console.log(err)
      //res.writeHead( 200 );
      resp_text = "";
      //res.end( "added " + resp_text );
  });


for( var i = 1; i < contents_lines.length-1; i++ )
{
  var vals=contents_lines[i].split(',');
  var input="(";

  for (var j=0; j< vals.length-1; j++){

    input+=vals[j] +", ";
  }
    input+= year;
//  console.log(input)+" LLLLLLLL";
  db.run("INSERT INTO House_Data VALUES "+input+")",
        function(err){
          //console.log(err)
            //res.writeHead( 200 );
            resp_text = "";
            //res.end( "added " + resp_text );
    });

}
