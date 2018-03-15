//var parse = require('xml-parser');
//var inspect = require('util').inspect;
//var findxml = require('../models/xmlToObj.js');
var parser = require('xmldom').DOMParser;
var fs = require('fs');
var request = require('request');
//var jsdom = require('jsdom');

exports.main = function(req, res){
	res.render('index',{
		title : 'main',
		xml : '',
		flow : '',
		text : '',
		node : '',
		flownamearr: null
	});
};
/*
 * To XML Button click
 */
exports.ajax1 = function(req,res){
	//console.log(req.query.subject);

		
	if(req.body.subject)
		console.log(req.body.subject);
	var eurl = "http://203.253.23.12:8180/editor/request";
	if(req.query.subject)
		eurl=eurl+"?subject="+req.query.subject;
	if(req.query.predicate)
		eurl=eurl+"&predicate="+req.query.predicate;
	console.log(req.query.subject);
	console.log(req.query.predicate);
	var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
	}
	var options = {
			url: eurl,
			method: 'GET',
			headers: headers
	}
	request(options,function(error, response, body){
		if(!error && response.statusCode == 200){
			console.log(body);
			res.json(body);
		}
	});
}
exports.ajax2 = function(req,res){
	var eurl = "http://203.253.23.12:8180/editor/request";
	var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
	}
	var options = {
			url: eurl,
			method: 'GET',
			headers: headers
	}
	var ret;
	request(options,function(error, response, body){
		if(!error && response.statusCode == 200){
			res.json(ret);
		}
	});
}
exports.ajax3 = function(req,res){
	var eurl = "http://203.253.23.12:8180/editor/request";
	var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
	}
	var options = {
			url: eurl,
			method: 'GET',
			headers: headers
	}
	var ret;
	request(options,function(error, response, body){
		if(!error && response.statusCode == 200){
			res.json(ret);
		}
	});
}
exports.toxml = function(req,res){
	var svgArea = req.body.svgtext;
	var xml = new parser().parseFromString(svgArea,'text/xml');
	//console.log(xml);
	var gTag = xml.getElementsByTagName('g');
	var pathTag = xml.getElementsByTagName('path');
	var gArray=[];
	var rectArray=[];
	//console.log(gTag);
	for(var i=0;i<gTag.length;i++){//gTag loop 
		var temp={
				name:"",
				circle:[]
		};
		var temp_rect={};
		for(var j=0;j<gTag[i].childNodes[0].attributes.length;j++){//노드 정보값 받아오기 위한 루프
			temp_rect[gTag[i].childNodes[0].attributes[j].name] = gTag[i].childNodes[0].attributes[j].value;
		}
		rectArray.push(temp_rect);//node 정보값 받아옴
		//console.log(gTag[i].childNodes.length);
		for(var j=2;j<gTag[i].childNodes.length;j++){
			var tempcircle={
					pathid:null,
					name:""
			};
			//3=pathid,4=name
			tempcircle.pathid=Number(gTag[i].childNodes[j].attributes[3].value);
			tempcircle.name=String(gTag[i].childNodes[j].attributes[4].value);
			temp.circle.push(tempcircle);
		}
		temp.name = String(gTag[i].childNodes[0].attributes[4].value);
		gArray.push(temp);
	}
	console.log((rectArray));
	
	
	
	
	
	var source_re = /\S*[Ss]ource/;
	var sink_re = /\S*[Ss]ink/;
	//Create CAWL link tag
	var Source_number=0;
	var start_node=[];
	var linkstr=[];
	for(var i = 0;i<gArray.length;i++){//Source가 몇개인지 찾음
		//console.log(gArray[i].name);
		if(gArray[i].name.match(source_re)){
			start_node[Source_number]=gArray[i];
			gArray.splice(i,1);
			i--;
			Source_number++;
		}
	}
	//console.log(Source_number);
//	while(gArray.length > 0){
//		
//	}
	var setArray=[];
	for(var i = 0; i < Source_number;i++){//flow 개수만큼 루프를 돌음 link태그 
		var set = new Set();
		var temp_array=[];
		var stack = new Array();
		stack.push(start_node[i]);
		while(stack.length>0){
			var currentNode = stack.pop();
			
			for(var j=0;j<currentNode.circle.length;j++){
				if(currentNode.circle[j].name=="from"){
					
					for(var k=0;k<gArray.length;k++){
						for(var circle_i=0;circle_i<gArray[k].circle.length;circle_i++){
							if((gArray[k].circle[circle_i].name=="to")&&(currentNode.circle[j].pathid == gArray[k].circle[circle_i].pathid)){
								stack.push(gArray[k]);
								var str = "\t\t<link from=\""+currentNode.name+"\" to=\""+gArray[k].name+"\"/>";
								temp_array.push(str);
								set.add(currentNode.name);
								set.add(gArray[k].name);
								gArray.splice(k,1);
								break;
							}
						}
					}
					
				}
			}
			
			
		}//while end
		setArray.push(set);
		linkstr.push(temp_array);
	}
	//console.log(linkstr);
	console.log(setArray[0]);
	console.log(setArray[1]);
	console.log(setArray[0].has('mSink'));
	var nodeStr= new Array(Source_number);
	for(var i=0;i<Source_number;i++){
		nodeStr[i] = new Array();
	}
	var last_stack=[];
	var re_sink = /\S*[Ss]ink/;
	var re_source = /\S*[Ss]ource/;
	for(var i=0;i<rectArray.length;i++){
		var temp_str="";
		var isnode=true;
		if(rectArray[i].node_name){
			temp_str ="\t\t<node" + " name=\""+String(rectArray[i].node_name)+"\"";
		}
		else if(rectArray[i].nodename){
			isnode=false;
			if(rectArray[i].nodename.match(re_source)){
				temp_str = "\t<flow name=\""+rectArray[i].flow_name+"\">\n";
				temp_str = temp_str+"\t\t<source name=\""+rectArray[i].nodename+"\"/>";
			}
			else{
				last_stack.push(rectArray[i]);
			}
		}
		if(rectArray[i].node_state){
			temp_str = temp_str + "state=\""+String(rectArray[i].node_state)+"\">\n";
		}
		
		if(rectArray[i].wait_joinCondition){
			temp_str = temp_str + "\t\t\t<wait joinCondition=\""+String(rectArray[i].wait_joinCondition)+"\"\/>\n";
		}
		
		if(rectArray[i].condition_expression){
			temp_str = temp_str + "\t\t\t<condition expression=\""+String(rectArray[i].condition_expression)+"\">\n";
		}
		
		if(rectArray[i].context_name){
			temp_str = temp_str + "\t\t\t\t<context name=\""+String(rectArray[i].context_name)+"\">\n";
		}
		
		if(rectArray[i].constraint_name){
			temp_str = temp_str + "\t\t\t\t\t<constraint name=\""+String(rectArray[i].constraint_name)+"\">\n";
		}
		if(rectArray[i].subject_type){
			temp_str = temp_str + "\t\t\t\t\t\t<subject type=\""+String(rectArray[i].subject_type)+"\">";
			if(rectArray[i].subject_value){
				temp_str = temp_str + String(rectArray[i].subject_value)+"</subject>\n";
			}
		}
		if(rectArray[i].verv_value){
			temp_str = temp_str +"\t\t\t\t\t\t<verb>"+ String(rectArray[i].subject_value)+"</verb>\n";
		}
		
		if(rectArray[i].object_type){
			temp_str = temp_str + "\t\t\t\t\t\t<object type=\""+String(rectArray[i].object_type)+"\">";
			if(rectArray[i].object_value){
				temp_str = temp_str + String(rectArray[i].object_value)+"</object>\n";
			}
		}
		if(rectArray[i].constraint_name){
			temp_str = temp_str + "\t\t\t\t\t</constraint>\n";
		}
		if(rectArray[i].context_name){
			temp_str = temp_str + "\t\t\t\t</context>\n";
		}
		
		if(rectArray[i].condition_expression){
			temp_str = temp_str + "\t\t\t</condition>\n";
		}
		if(isnode)
			temp_str = temp_str + "\t\t</node>";
		
		
		for(var j=0;j<Source_number;j++){
			if(temp_str.length == 0)
				break;
			if(setArray[j].has(rectArray[i].node_name) || setArray[j].has(rectArray[i].nodename)){
				nodeStr[j].push(temp_str);
			}
		}
		//console.log(temp_str);
	}
	for(var i=0;i<last_stack.length;i++){//sink 를 마지막에 넣어주기 위해
		var temp = last_stack[i];
		var temp_str = "\t\t<sink name=\""+temp.nodename+"\"/>\n";
		
		for(var j=0;j<Source_number;j++){
			if(setArray[j].has(temp.nodename) || setArray[j].has(temp.nodename)){
				nodeStr[j].push(temp_str);
			}
		}
	}
	console.log("test");
	console.log(nodeStr[0]);
	console.log(nodeStr[1]);
	console.log(linkstr[0].join('\n'));
	console.log(linkstr[1].join('\n'));
	
	var last_str="";
	for(var i=0;i<Source_number;i++){
		last_str+=nodeStr[i].join('\n');
		last_str+=linkstr[i].join('\n');
		last_str+="\n\t</flow>\n";
	}
	last_str+="</CAWL>";
	fs.writeFile('test.xml', last_str,'utf8',function(err){
		console.log("file write");
	});
	
	
	res.render('index',{
		title : 'main',
		text: linkstr[0].join('\n'),
		xml : '',
		flow : '',
		node : '',
		flownamearr : null
	});
}
var node_attr={};
function findChild(node){
	//console.log(node.childNodes.length);
	for(var i=1 ; i<node.childNodes.length ; i+=2){
		findChild(node.childNodes[i]);
	}
	for(var i=0 ; i<node.attributes.length ; i++){
		var tagname = node.tagName;
		var name = node.attributes[i].name;
		var value = node.attributes[i].value;
		//console.log("test : "+node.data);
		if(node.childNodes.length == 1){
			node_attr[tagname+"_value"]=node.childNodes[0].data;
		}
		/*if(tagname=="subject"){
			console.log("childNodes : "+node.childNodes.length);
			console.log(node);
		}*/
		node_attr[tagname+"_"+name] = value;
	}
}
/*
 * Convert Button
 */
exports.xmlparse = function(req, res){//xml to svg
	var area = req.body.textarea;
	area=area.replace(/<xs:/gi,"<");
	area=area.replace(/<\/xs:/gi,"<\/");
	//console.log(area);
	var flow=[];
	var xml = new parser().parseFromString(area,'text/xml');
	var getflow = xml.getElementsByTagName('flow');
	var nodelist=[];
	var node_dom = xml.getElementsByTagName('node');
	//console.log(node_dom[0].attributes);
	/*console.log(node_dom[0].attributes[0].name + " "+node_dom[0].attributes[0].value);
	console.log(node_dom[0].childNodes[1].tagName);
	console.log(node_dom[0].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[0]);
	console.log(node_dom[0].childNodes[3].childNodes[1].childNodes[1].childNodes[1].nodeName);
	*/
	for(var node_dom_count=0 ; node_dom_count<node_dom.length ; node_dom_count++){//
		//console.log(node_dom[node_dom_count].attributes[0].value);
		//console.log(node_dom[node_dom_count]);
		//console.log(node_dom[node_dom_count].childNodes.length);
		findChild(node_dom[node_dom_count]);
		//console.log(node_dom[node_dom_count].childNodes[0]);
		nodelist.push(node_attr);
		node_attr={};
	}
	
//	console.log(xml.getElementsByTagName('flow')[0].getElementsByTagName('link').length);
//	var link = xml.getElementsByTagName('flow')[0].getElementsByTagName('link');
//	console.log(link[0].attributes[0].value);
	var flowname=[];
	for(var i=0;i<getflow.length;i++){
		var getlink = getflow[i].getElementsByTagName('link');
		flowname.push(getlink[0].parentNode.attributes[0].value);
		var templink=[];
		for(var j=0;j<getlink.length;j++){
			templink.push({
				'from':getlink[j].attributes[0].value,
				'to':getlink[j].attributes[1].value
			});
		}
		flow.push(templink);
	}
	console.log(flow);
	console.log(nodelist);
	
	
	//var obj = new parse(area);
	//console.log(obj);
	//console.log(obj.root.children.flow);
	//console.log(inspect(obj, { colors: true, depth: Infinity }));
	//area = area.slice(test[0].length);
	/*for(var key in obj){
		console.log( key + '=>' + obj[key]);
	}*/
	//link_arr=findxml(obj,'link');
	//findxml(obj,'node');
	//console.log(link_arr[0]);
	//console.log(obj);
	
	
//	var parser = new DomParser();
//	var dom = parser.parseFromString(area);
//	//console.log(dom.childNodes[0]);
//	//console.log(dom);
//	var flow = dom.getElementsByTagName('flow');
//	console.log(flow[0].attributes.length);
	//var link = flow.getElementsByTagName('link');
	//for(i=0;i<x.length;i++)
		//console.log(x[i].nodeName + ": " +x[i].attributes[0].name+' '+x[i].attributes[0].value + ' / '+x[i].attributes[1].value);
	//res.json(flow);
	res.render('index',{
		title : 'main',
		text : null,
		xml : area,
		flow : flow,
		node : nodelist,
		flownamearr : flowname
	});
};
