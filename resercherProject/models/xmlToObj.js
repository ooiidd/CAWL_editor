//var getobject = require('getobject');
module.exports = find;
function find(obj,attName){
	var ret={};
	var i=-1;
	var check = false;
	recursive(obj);
	var return_val=[];
	for(var item in ret){
		return_val.push(getobject.get(ret[item],'0.key'));
		console.log(getobject.get(ret[item],'0'));
	}
	return return_val;
	
	
	
	function recursive(ob){
		for(var key in ob){
			if(check==true){
				//console.log(key +' / '+ob[key]);
				var temp = {key : ob[key]};
				ret[i].push(temp);
			}
			console.log(key + ' / ' + ob[key]);
			if(key=="tagname" && ob[key] == attName){ check=true; i++;ret[i]=[];continue;}
			//console.log(ob[key]);
			if(typeof ob[key] ==='object'){
				//console.log('ob');
				recursive(ob[key]);
				check=false;
			}
		}
	}
}