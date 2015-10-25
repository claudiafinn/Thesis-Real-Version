

function onLoad(){
  var req = new XMLHttpRequest();
   projs_req.addEventListener( "click", thefunc, false );
   //projs_req.open( "get", "" , true);
   //projs_req.send();
}
var submit = document.getElementById('form');
submit.onClick=thefunc();

form.onsubmit = function (evt){
	evt.preventDefault();
	onSubmit();
}

function onSubmit(){
  alert('hi')
}

function thefunc(){
  alert('hi')
}
