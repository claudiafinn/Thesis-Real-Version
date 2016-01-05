

var fs = require( 'fs' );
var sql = require( 'sqlite3' ).verbose();
var db = new sql.Database( 'thesis_data.sqlite' );

if( process.argv.length < 4 ){
    console.log( "Usage: Need a filename, dummy" );
    process.exit( 1 );
}

var filename = process.argv[ 2 ];
var year = process.argv[ 3 ];
console.log( "You want me to read file: ", filename );

try{
    var fileBuffer = fs.readFileSync( filename );
}
catch( exp ){
    console.log( "Failed to read file", filename );
    process.exit( 2 );
}

//**Start real shit
//
//**
var categories = ["YEAR","PUMA", "SERIALNO","ADJHSG", "ADJINC", "FS","RNTP","VACS","VALP","YBL","FINCP","HHL","HINCP","MV","TAXP","WORKSTAT"];//etc
var pumas = ["812","813"];//etc

var contents = fileBuffer.toString();
var contents_lines = contents.split( '\n' );


//create sqlite string for categories (labels for the db)
var data="(";
for (var i=0; i< categories.length; i++){
  if(i==categories.length-1){
    data+=categories[i];
  }
  else{
    data+=categories[i]+",";
  }
}
data+=")";
console.log(data);


//**create table
//db.run("DROP TABLE House_Data2", function(err){});
db.run("CREATE TABLE IF NOT EXISTS House_Data2 "+data,
  function(err){
    console.log("1"+err)
      //res.writeHead( 200 );
      resp_text = "";
      //res.end( "added " + resp_text );
  });

//***find corresponding indexes to categories
//for each category that exists in the master, save the index of that category but in the order
//of the original list
//eg. indexes are ordered according to master list
var indexes =[];
var something =contents_lines[0].split(',');
for (var k=0; k<categories.length; k++){
  for (var m=0; m<something.length; m++){
    if (something[m] == categories[k]){
      indexes.push(m);
      console.log(m);

    }
  }
}

//does this for every line in the file
for( var i = 0; i < contents_lines.length-1; i++ )
{
//  var year="2008";
  var vals=contents_lines[i].split(',');
  var input="("+year+",";


  //retrieve the data fro the proper index
  for ( var j = 0; j <indexes.length; j++){
    var data = vals[indexes[j]];
    if (data==""){
      data="NULL"
    }
    if (j==indexes.length-1){
        input+=data;
    }
    else{
      input+=data+",";
    }
  }

input+=")";
console.log(input);
db.run("INSERT INTO House_Data2 VALUES "+input,
      function(err){
        console.log("2"+err)
          //res.writeHead( 200 );
          resp_text = "";
          //res.end( "added " + resp_text );
  });
}
