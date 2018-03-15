function toxmlf(){
	var f=document.super_form;
	var svgtext=document.getElementById("svg");
	console.log(svgtext.innerHTML);
	document.getElementById("svgtext").value = svgtext.innerHTML;
	console.log("s");
	f.action="/toxml";
	f.submit();
}