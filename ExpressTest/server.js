var express = require('express');
var app = express();
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();

app.use(express.static('public'));

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/process_get', function (req, res) {

   var db = new sql.Database( 'thesis_data.sqlite' );
   var puma=req.query.puma;
   var year=req.query.year;

   console.log(puma , year);
   db.all( "SELECT * FROM House_Data WHERE PUMA = ? AND YEAR = ?",[puma, year],
       function( err, rows ) {
           if(err){ console.log(err);}
           var resp_text = "";
           for( var i = 0; i < rows.length; i++ )
           {
               resp_text +=rows[i].SERIALNO + " ";
               resp_text += rows[i].PUMA +"\n";
           }
       } );
    //  var projs_req = new XMLHttpRequest();
    //  projs_req.open( "get", "build_rules.json" );
    //  projs_req.send();
      text="hi";
      res.end( text);
   //res.sendFile(__dirname + "/"+"results.html");
})

var server = app.listen(8000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
