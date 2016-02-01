

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
var categories = ["YEAR", "PUMA", "SERIALNO","ADJUST", "ADJINC", "NP", "FS","RNTP","VACS","VAL","YBL","FINCP","FPARC", "HHL","HHT", "HINCP","MV","MULTG","TAXP","WORKSTAT"];//etc
//var pumas = ["812","813"];//etc

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

db.run("CREATE TABLE IF NOT EXISTS House_Data3 "+data,
  function(err){
    console.log("1"+err)
      resp_text = "";
  });

//***find corresponding indexes to categories
//for each category that exists in the master, save the index of that category but in the order
//of the original list
//eg. indexes are ordered according to master list
var indexes =[];
var ybl =0;
var fs=0;
var documentCats =contents_lines[0].split(',');
for (var k=0; k<categories.length; k++){
  for (var m=0; m<documentCats.length; m++){
    if (documentCats[m] == categories[k]){
      if(categories[k]=="YBL"){ybl = m; console.log(categories[k], m);}
      if(categories[k]=="FS"){fs = m; console.log(categories[k], m);}
      //indexes.push(m);
      indexes[k]=m;

    }

  }
  console.log("here",indexes[k]);
}

//does this for every line in the file
for( var i = 1; i < contents_lines.length-1; i++ )
{
  var vals=contents_lines[i].split(',');
  var input="("+year+",";
  //retrieve the data fro the proper index
  for ( var j = 1; j <indexes.length; j++){
    //data to be preprocessed for 2008,2007,2006
    if(indexes[j]==ybl){
      console.log('here', j, vals[indexes[j]]);
      if(vals[indexes[j]]==01){input=input+12+",";   }
      else if(vals[indexes[j]]==02){input=input+11+",";  }
      else if(vals[indexes[j]]==03){input=input+10+","; }
      else if(vals[indexes[j]]==04){input=input+09+",";   }
      else if(vals[indexes[j]]==05){input=input+08+","; }
      else if(vals[indexes[j]]==06){input=input+07+",";   }
      else if(vals[indexes[j]]==07){input=input+06+","; }
      else if(vals[indexes[j]]==08){input=input+05+","; }
      else if(vals[indexes[j]]==09){input=input+04+",";  }
      else if(vals[indexes[j]]==10){input=input+03+",";  }
      else if(vals[indexes[j]]==11){input=input+02+","; }
      else if(vals[indexes[j]]==12){input=input+01+","; }
    }
    else if(indexes[j]==fs){
      if(vals[indexes[j]]==""){input=input+"NULL,";}
      else if(vals[indexes[j]]>0){input = input+01+","; }
      else if (vals[indexes[j]]==0){input=input+02+","; }
    }
    else{
      var data = vals[indexes[j]];
      if(data==undefined){
        data="NULL"
      }
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
  }

input+=")";
console.log("1"+input);
db.run("INSERT INTO House_Data3 VALUES "+input,
      function(err){
        console.log("2"+err)
          resp_text = "";
  });
}
