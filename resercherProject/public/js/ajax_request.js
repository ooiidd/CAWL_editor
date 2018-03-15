/**
 * http://usejsdoc.org/
 */
var xhr = new XMLHttpRequest();
xhr.onload = function(){
	if(xhr.readyState === xhr.DONE){
		if(xhr.status === 200 || xhr.status === 201){
			console.log(xhr.responseText);
		}else{
			console.error(xhr.responseText);
		}
	}
};
xhr.open('GET', 'http://203.253.23.12:8180/editor/request');
xhr.send();