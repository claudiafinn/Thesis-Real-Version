var fs = require( 'fs' );
var sql = require( 'sqlite3' ).verbose();
var db = new sql.Database( 'thesis_data.sqlite' );
//var csv = require('csv');
//var parser = csv.parse();


try{
    var fileBuffer = fs.readFileSync( 'Population_Data.csv' );
}
catch( exp ){
    console.log( "Failed to read file" );
    process.exit( 2 );
}

var contents = fileBuffer.toString();
var contents_lines = contents.split( '\r\n' );

for( var i = 1; i < contents_lines.length-1; i++ )
{
  console.log(contents_lines[i])
  var vals=contents_lines[i].split(',');
  var input=" ( ";
  console.log(input);
  for ( var j = 0; j <vals.length; j++){
    if (j == vals.length-1){
      input+=vals[j];
        console.log(input);
    }
    else{
      input+=vals[j]+","
        console.log(input);
    }
  }
  console.log("a",input, "b");
  input+=")";
  console.log("c",input, "d");
  db.run("INSERT INTO Population VALUES "+input,
        function(err){
          console.log("2"+err)
            resp_text = "";
    });
}
