var svg = Snap("#svg");
var test = document.getElementById("test2");
//console.log(typeof test);
/*test.addEventListener("mouseover",function(ev){
	console.log("enter test");
	tempcircle[0] = svg.circle(350,300,5);
},false);
test.addEventListener("mouseleave",function(ev){
	console.log("leave");
},false);*/
//그려줄 row와 col
var row,col;
var currentRect=null;
var currentoverRect=null;
var rectid=0;
var tempcircle=[];
var tempEllipse=null;
var path=[];
var findRectArr=[];//노드를 만들어 주었는지 알기위해 사용하는 String형 배열 indexOf() 메서드로 찾는다.
var circleArray=[];
var pathid=0;
var currentStartDoc=null;
var currentOverDoc=null;
var currentText=null;
var currentLine=null;
var highlight_rect=null;
var temp_rect;
var lineDrawing=false;
var docStart;//선 그리기 시작할때 시작점
var docEnd;//선 그리기 시작할때 끝점
var pa;
var sx,sy;
var rectarr=new Array(100);//rectarr[col][row]
for(var i=0;i<100;i++)
	rectarr[i] = new Array(100);

var arrow = svg.path("M2,2 L2,11 L10,6 L2,2").attr({fill:'#000000'});
var marker = arrow.marker(0,0,10,10,9,6);
function textChangef(){
	currentText.node.textContent=$('#nameinput').val();
}
function parseData(data){
	$('#attr').empty();
	$('#nodediv').remove();
	$('#variablediv').remove();
	$('#conditiondiv').remove();
	$('#attr').append($('<div/>',{
		id:'nodediv'
	}));
	$('#attr').append($('<hr>'));
	$('#attr').append($('<div/>',{
		id:'variablediv'
	}));
	$('#attr').append($('<div/>',{
		id:'conditiondiv'
	}));
	$('#nodediv').append('<span>Name: </span>');
	$('#nodediv').append($('<input/>',{
		type:'text',
		id: 'nameinput',
		value:data.children()[0].attr('nodename'),
		onchange:"textChangef()"
	}));
	$('#conditiondiv').append('<span>Condition Expression: </span>');
	$('#conditiondiv').append('<br>');
	$('#conditiondiv').append('<span>Context Name: </span>');
	$('#conditiondiv').append('<br>');
	$('#conditiondiv').append('<span>Constraint Name: </span>');
	$('#conditiondiv').append('<br>');
	$('#conditiondiv').append('<select id=subject_select></select>');
	$('#conditiondiv').append('<select id=verv_select></select>');
	$('#conditiondiv').append('<select id=object_select></select>');
	
	$('#subject_select').change(function(){
		console.log(currentRect.attr('nodename'));
		var params = {subject: $("#subject_select option:selected").text()};
		$('#verv_select option').remove();
		$('#object_select option').remove();
		$('#verv_select').append("<option value=none>NONE</option>");
		$.ajax({
			url: "/ajax1",
			type: "GET",
			dataType: 'json',
			data:params,
			async: true,
			success: function(data){
				console.log(data);
				var ret = (JSON.parse(data));
				for(var obj in ret){
					for(var value in ret[obj]){
						console.log(ret[obj][value]);
						$('#verv_select').append("<option value="+obj+">"+ret[obj][value]+"</option>");
					}
				}
			},
			error: function(json){
				console.log("error : "+JSON.stringify(json));
			}
		});
	});
	$('#verv_select').change(function(){
		var params = {subject: $("#subject_select option:selected").text(),
				predicate: $("#verv_select option:selected").text()};
		$('#object_select option').remove();
		$('#object_select').append("<option value=none>NONE</option>");
		$.ajax({
			url: "/ajax1",
			type: "GET",
			dataType: 'json',
			data:params,
			async: true,
			success: function(data){
				console.log(data);
				var ret = (JSON.parse(data));
				for(var obj in ret){
					for(var value in ret[obj]){
						console.log(ret[obj][value]);
						$('#object_select').append("<option value="+obj+">"+ret[obj][value]+"</option>");
					}
				}
			},
			error: function(json){
				console.log("error : "+JSON.stringify(json));
			}
		});
	});
}
function direction(element){
	var temp_attr=path[element].attr('d');
	path[element].attr({
		markerEnd: marker
	});
}
//docover2 out2는 점에 마우스 대면 초록색 원 그려주는 것.
var docover2 = function(){
	if(lineDrawing==true && docStart != this){
		currentLine.attr({
			d:"M"+sx+","+sy+" L"+this.attr("cx")+","+this.attr("cy")
		});
	}
	currentOverDoc=this;
	svg.unmousemove();
	svg.unmouseup();
	//currentoverRect.unmouseover();
	this.unmouseout();
	tempEllipse = svg.ellipse(this.attr("cx"),this.attr("cy"),11,11).attr({
		'pointer-events':'none',
		fill:"#00ff00",
		stroke:"#00ff00",
		'fill-opacity':"0.3",
		'stroke-opacity':"0.3"
	});
	this.mouseout(docout2);
	console.log("drag remove");
	currentoverRect.undrag();
}
var docout2 = function(){
	if(lineDrawing==true && docStart!=this){
		svg.mousemove(function(e){
			currentLine.attr({
				d:"M"+sx+","+sy+" L"+e.offsetX+","+e.offsetY
			});
		});
		svg.mouseup(function(){
			lineDrawing=false;
			pathid++;
			svg.unmousemove();
			this.unmouseup();
		});
	}
	tempEllipse.remove();
	console.log("drag add")
	currentoverRect.drag(move,start,stop);
	//currentoverRect.mouseover(mouseover);
}


//선을 그리다가 점에 놓을때 발생하는 이벤트
var docup = function(){
	console.log("docup");
	lineDrawing=false;
	svg.unmouseup();
	svg.unmousemove();
	var ex=this.attr("cx");
	var ey=this.attr("cy");
	var newcircle = svg.circle(ex,ey,0);
	newcircle.attr({
		pathid:pathid,
		name:"to"
	});
	currentoverRect.add(newcircle);
	pathid++;
}

//선을 그릴때 시작하는 점 이벤트 mousedown event point
var docover = function(){
	docStart=this;
	lineDrawing=true;
	pa = this.parent();
	currentDoc = this;
	sx=this.attr("cx");
	sy=this.attr("cy");
	var newcircle = svg.circle(sx,sy,0);
	newcircle.attr({
		pathid:pathid,
		name:"from"
	});
	currentLine = svg.path("M"+sx+","+sy+" L"+sx+","+sy);
	path[pathid]=currentLine;
	currentLine.attr({
		markerEnd: marker,
		fill:"#000000",
		stroke: "#000",
		strokeWidth: 1
	});
	currentoverRect.add(newcircle);
	pa.undrag();
	svg.mousemove(function(e){
		currentLine.attr({
			d:"M"+sx+","+sy+" L"+e.offsetX+","+e.offsetY
		});
	});
	svg.mouseup(function(){
		lineDrawing=false;
		pathid++;
		svg.unmousemove();
		this.unmouseup();
	});
}

//rect 마우스를 위에 올렸을때 발생.
var mouseover = function(){
	console.log("mouseover");
	if(this===currentoverRect){
		
	}
	else{
		currentoverRect = this;
		for(var i=0;i<tempcircle.length;i++){
			tempcircle[i].remove();
		}
		var x=Number(this.children()[0].attr('x'));
		var y=Number(this.children()[0].attr('y'));
		var w=Number(this.children()[0].attr('width'));
		var h=Number(this.children()[0].attr('height'));
		var group = this;
		tempcircle[0] = svg.circle(x+w/4,y,3);
		tempcircle[1] = svg.circle(x+w/2,y,3);
		tempcircle[2] = svg.circle(x+w/2+w/4,y,3);
		tempcircle[3] = svg.circle(x,y+h/4,3);
		tempcircle[4] = svg.circle(x,y+h/2,3);
		tempcircle[5] = svg.circle(x,y+h/4+h/2,3);
		
		tempcircle[6] = svg.circle(x+w,y+h/4,3);
		tempcircle[7] = svg.circle(x+w,y+h/2,3);
		tempcircle[8] = svg.circle(x+w,y+h/2+h/4,3);
		
		tempcircle[9] = svg.circle(x+w/4,y+h,3);
		tempcircle[10] = svg.circle(x+w/2,y+h,3);
		tempcircle[11] = svg.circle(x+w/4+w/2,y+h,3);
		for(var i=0;i<tempcircle.length;i++){
			group.add(tempcircle[i]);	
			tempcircle[i].unmousedown();
			tempcircle[i].mousedown(docover);
			tempcircle[i].mouseup(docup);
			tempcircle[i].hover(docover2,docout2);
			tempcircle[i].attr({
				cursor:'default'
			});
		}
	}
}
//rect drag 리스너 (움직일때)
var move = function(dx,dy,x,y,event){
	temp_rect.attr({
		transform: this.data('origTransform') + (this.data('origTransform') ? "T" : "t")+[dx,dy]
	});
	console.log("x = "+event.offsetX, " y = "+event.offsetY);
	var xpoint,ypoint;
	xpoint = parseInt(event.offsetX/200)*200;
	ypoint = parseInt(event.offsetY/80)*80;
	//console.log(event.offsetX/200+","+ypoint);
	if(highlight_rect.attr('x')==xpoint && highlight_rect.attr('y')==ypoint){
		;
	}
	else{
		highlight_rect.attr({
			x:xpoint,
			y:ypoint
		});
	}
}

//rect drag 리스너중 start(mouse down 발생시)리스너
var start = function(){
	//console.log('ajax');
	
	/*jQuery.getJSON("http://203.253.23.12:8180/editor/request"+"?callback=?",function(data){
		console.log("Symbol: "+data.symbol + ", Price: "+data.price);
	});*/
	//this.unmouseover();
	for(var i=0;i<tempcircle.length;i++){
		tempcircle[i].remove();
	}
	if(currentRect != null)
		currentRect.attr({
			stroke:"#000",
			strokeWidth: 1
		});
	if(currentRect != this){
		currentRect = this.children()[0];
		currentText = this.children()[1];
		currentRect.attr({
			stroke: "#00BFFF",
			strokeWidth: 3
		});
		parseData(this);
	}
	var request = $.ajax({
		url: "/ajax1",
		type: "GET",
		dataType: 'json',
		async: true,
		success: function(data){
			console.log(data);
			var ret = (JSON.parse(data));
			$('#subject_select').append("<option value=none>NONE</option>");
			for(var obj in ret){
				for(var value in ret[obj]){
					console.log(ret[obj][value]);
					$('#subject_select').append("<option value="+obj+">"+ret[obj][value]+"</option>");
				}
			}
		},
		error: function(json){
			console.log("error : "+JSON.stringify(json));
		}
	});
	//점선으로된 사각형 만들어줌
	temp_rect = svg.rect(currentRect.attr('x'),currentRect.attr('y'),currentRect.attr('width'),currentRect.attr('height'));
	temp_rect.attr({
		stroke: "#000",
		strokeWidth: 0.8,
		"stroke-dasharray":"3,3",
		fill: "none"
	});
	//highlight사각형 ( 어디에 위치될지 ) 알려주는 사각형 만들어줌
	highlight_rect = svg.rect(currentRect.attr('x')-25,currentRect.attr('y')-15,200,80);
	highlight_rect.attr({
		stroke: "#00fa00",
		strokeWidth: 0.5,
		fill: "#00fa00",
		"fill-opacity":0.4
	});
	//this.children()[0].data('origTransform',this.children()[0].transform().local);
	this.data('origTransform',this.transform().local);
}

//rect drag 리스너중 stop(놓았을때 발생)
var stop = function(){
	//this.mouseover(mouseover);
	
	currentoverRect=null;
	var trans = this.transform().local;
	var tempX = (Number(highlight_rect.attr('x'))+25)-Number(currentRect.attr('x'));
	var tempY = Number(highlight_rect.attr('y'))+15-Number(currentRect.attr('y'));
		//trans = trans.slice(tempX[0].length+1);
	console.log(tempX+","+tempY);
	var col_check=parseInt((Number(this.children()[0].attr('x'))+tempX)/200);
	var row_check=parseInt((Number(this.children()[0].attr('y'))+tempY)/80);
	if(tempX==0 && tempY==0){
		temp_rect.remove();
		highlight_rect.remove();
		return ;
	}
	if(rectarr[col_check][row_check]){
		temp_rect.remove();
		highlight_rect.remove();
		alert('exist');
		return;
	}
	console.log("test : "+col_check+", "+row_check);
		this.attr({
			transform:'1,0,0,1,0,0'
		});
		this.children()[0].attr({
			x:Number(this.children()[0].attr('x'))+Number(tempX),
			y:Number(this.children()[0].attr('y'))+Number(tempY)
		});
		this.children()[1].attr({
			x:Number(this.children()[1].attr('x'))+Number(tempX),
			y:Number(this.children()[1].attr('y'))+Number(tempY)
		})
		//점 따라다니게 하기
		var temp_children = this.children();
		var rectid = Number(temp_children[0].attr('id'));

		var temp_col = findRectArr[rectid].col;
		var temp_row = findRectArr[rectid].row;

		findRectArr[rectid].col = parseInt(Number(temp_children[0].attr('x'))/200);
		findRectArr[rectid].row = parseInt(Number(temp_children[0].attr('y'))/80);
		
		var temp_gtag = rectarr[temp_col][temp_row];
		rectarr[temp_col][temp_row]=undefined;
		rectarr[findRectArr[rectid].col][findRectArr[rectid].row] = temp_gtag;
		
		//연결된 선 다시그리기
		for(var i=2;i<temp_children.length;i++){
			
			if(typeof temp_children[i].attr('pathid') === 'string'){
				var ptid = Number(temp_children[i].attr('pathid'));
				console.log(ptid);
				console.log(this.children());
				circleArray[ptid].start.remove();
				circleArray[ptid].end.remove();
				
				console.log(rectid+','+circleArray[ptid].srect+','+circleArray[ptid].erect);
				path[ptid].remove();
				
				
				//console.log(findRectArr[rectid].col+","+findRectArr[rectid].row);
				
				
				//console.log(findRectArr[rectid].col+","+findRectArr[rectid].row);
				drawLinef(circleArray[ptid].srect,circleArray[ptid].erect,ptid);
			}
			/*if(typeof temp_children[i].attr('pathid') === 'string'){
				temp_children[i].attr({
					cx:Number(temp_children[i].attr('cx'))+Number(tempX),
					cy:Number(temp_children[i].attr('cy'))+Number(tempY)
				});
				if(temp_children[i].attr('name')=='from'){
					var temp_str=path[Number(temp_children[i].attr('pathid'))].attr('d').match(/L[,\d]+/)[0];
					console.log(temp_str);
					path[Number(temp_children[i].attr('pathid'))].attr({
						d:"M"+temp_children[i].attr('cx')+","+temp_children[i].attr('cy')+" "+temp_str
					});
				}
				else{
					var temp_str=path[Number(temp_children[i].attr('pathid'))].attr('d').match(/M[,\d]+/)[0];
					console.log(temp_str);
					path[Number(temp_children[i].attr('pathid'))].attr({
						d:temp_str+" "+"L"+temp_children[i].attr('cx')+","+temp_children[i].attr('cy')
					});
				}
				direction(Number(temp_children[i].attr('pathid')));
			}*/
		}
		temp_rect.remove();
		highlight_rect.remove();
}
function addrect(left,right,width,height,nodename){
	var newg = svg.g();
	//g태그 하나 생성
	newg.attr({
		transform:'translate(0,0)',
		cursor: 'move'
	});
	//rect1개 생성
	//console.log(typeof left);
	var x=150,y=150,w=200,h=50,name="NewNode";
	if(typeof left==='number'){
		//console.log('tt');
		x= (left);
		y= (right);
		w= (width);
		h= (height);
		name=nodename;
	}
	console.log(nodename);
	
	var newrect = svg.rect(x,y,w,h);
	var newtext = svg.text(x-name.length+50,y+28,name);
	
	//console.log(nodelist);
	var temp_node;
	for(var i=0;i<nodelist.length;i++){
		//console.log(nodename + " " + nodelist[i].node_name);
		if(nodelist[i].node_name == nodename){
			temp_node = JSON.parse(JSON.stringify(nodelist[i]));
			//console.log(temp_node);
			nodelist.splice(i,1);
			break;
		}
	}
	console.log(temp_node);
	//findRectArr.push(name);
	newrect.attr({
		nodename:name,
		fill:"#ffffff",
		stroke: "#000",
		strokeWidth: 1,
		id:rectid++
	});
	//var keys = Object.keys(temp_node);
	if(temp_node){
		newrect.attr(temp_node);
	}
	newg.add(newrect);
	newg.add(newtext);
	newg.drag(move,start,stop);
	//newg.mouseover(mouseover);
	return newg;
}
//AddBox 버튼 클릭 리스너

$("#addrect").click(function(){
	var temp_col=0,temp_row;
	for(var i=0;i<100;i++){
		if(rectarr[0][i]) continue;
		else{
			temp_row = i;
			break;
		}
	}
	var temp_name;
	
	for(var i=1;i<101;i++){
		if(FindRectf(findRectArr,"NewNode"+i.toString()) != -1){
			continue;
		}
		else{
			temp_name = "NewNode"+i.toString();
			break;
		}
	}
	console.log(temp_name);
	rectarr[temp_col][temp_row] = addrect(temp_col*200+25,temp_row*80+15,150,50,temp_name);
	findRectArr.push({name:temp_name,col:temp_col,row:temp_row});
});
//flow값(렌더링 할 값이 있으면) 렌더링 해줘야함.

function FindRectf(arr,nodename){
	for(var i=0;i<arr.length;i++){
		if(arr[i].name == nodename)
			return i;
	}
	return -1;
}
//연결선 그려주는 함수
function drawLinef(start,end,ptid){
	var pathnum;
	if(ptid){
		console.log("pathid is good");
		pathnum = ptid
	}
	else{
		pathnum = pathid;
		pathid++;
	}
	var srow,scol,erow,ecol;
//	console.log("start : "+start);
//	console.log("end : "+end)
//	console.log(findRectArr[start]);
	srow = findRectArr[start].row;
	scol = findRectArr[start].col;
	erow = findRectArr[end].row;
	ecol = findRectArr[end].col;
	var startG = rectarr[scol][srow];
	var endG = rectarr[ecol][erow];
	var startchild = startG.children();
	var endchild = endG.children();
	if(scol == ecol){//열같으면 그냥 바로 아래로 가는 선 만들어주면 됨
		//console.log(start);
		
		//처음 시작 점 찾기
		var startx = Number(startchild[0].attr("x"));
		var starty = Number(startchild[0].attr("y"));
		var startwidth = Number(startchild[0].attr("width"));
		var startheight = Number(startchild[0].attr("height"));
		var sCirclex = startx+startwidth/2;
		var sCircley = starty+startheight;
		var new_start_circle = svg.circle(sCirclex,sCircley,0);
		new_start_circle.attr({
			pathid:pathnum,
			name:"from"
		});
		startG.add(new_start_circle);
		//끝나는 점 찾기
		var endx = Number(endchild[0].attr("x"));
		var endy = Number(endchild[0].attr("y"));
		var endwidth = Number(endchild[0].attr("width"));
		var endheight = Number(endchild[0].attr("height"));
		var eCirclex = endx+endwidth/2;
		var eCircley = endy;
		var new_end_circle = svg.circle(eCirclex,eCircley,0);
		new_end_circle.attr({
			pathid:pathnum,
			name:"to"
		});
		endG.add(new_end_circle);
		
		path[pathnum]=svg.path("M"+sCirclex+","+sCircley+" L"+eCirclex+","+eCircley);
		path[pathnum].attr({
			markerEnd: marker,
			fill: "#000000",
			stroke: "#000",
			strokeWidth:1
		});
		circleArray[pathnum]={
				start:new_start_circle,
				end:new_end_circle,
				srect:start,
				erect:end
		};
	}
	else if(scol < ecol){//오른쪽으로 빠지는 선
		//처음 시작 점 찾기
		var startx = Number(startchild[0].attr("x"));
		var starty = Number(startchild[0].attr("y"));
		var startwidth = Number(startchild[0].attr("width"));
		var startheight = Number(startchild[0].attr("height"));
		var sCirclex = startx+startwidth/2;
		var sCircley = starty+startheight;
		var new_start_circle = svg.circle(sCirclex,sCircley,0);
		new_start_circle.attr({
			pathid:pathnum,
			name:"from"
		});
		startG.add(new_start_circle);
		
		//끝나는 점 찾기
		var endx = Number(endchild[0].attr("x"));
		var endy = Number(endchild[0].attr("y"));
		var endwidth = Number(endchild[0].attr("width"));
		var endheight = Number(endchild[0].attr("height"));
		var eCirclex = endx+endwidth/2;
		var eCircley = endy;
		var new_end_circle = svg.circle(eCirclex,eCircley,0);
		new_end_circle.attr({
			pathid:pathnum,
			name:"to"
		});
		endG.add(new_end_circle);
		
		//아랫쪽에 뭔가 있는지 판단해줘야함
		var lineString="M"+sCirclex+","+sCircley;
		var forX,forY;
		for(forY=srow+1;forY<erow;forY++){
			if(rectarr[ecol][forY]){
				console.log("break");
				break;
			}
			else
				console.log("no");
		}
//		if(forY >= erow){
//			for(forY=srow+1;forY<erow;forY++){
//				if(rectarr[ecol][forY]){
//					break;
//				}
//			}
//		}
		//처음 오른쪽으로 가는 선 그려주기
		lineString = lineString+"L"+sCirclex+","+(sCircley+15);
		if(forY>=erow){//아래 라인 안막힘
//			if(forY==erow)
//				lineString=lineString+"L"+(forX*200-100)+","+sCircley;
//			else{//오른쪽 라인에는 아무 사각형 없는데 아래로 가는 라인에 사각형이 있음.
			lineString=lineString+"L"+(ecol*200+100)+","+(sCircley+15);
//			lineString=lineString+"L"+(forX*200-200)+","+(eCircley-15);
//			lineString=lineString+"L"+eCirclex+","+(eCircley-15);
			
//			}
		}
		else{//아래쪽으로 가는 라인에 사각형에 막힘
			console.log("else");
			console.log("forY : "+forY+" ,erow : "+erow)
			lineString=lineString+"L"+(ecol*200)+","+(sCircley+15);
			lineString=lineString+"L"+(ecol*200)+","+(eCircley-15);
			lineString=lineString+"L"+(ecol*200+100)+","+(eCircley-15);
//			lineString=lineString+"L"+(forX*200)+","+sCircley;
//			lineString=lineString+"L"+(forX*200)+","+(eCircley-15);
//			lineString=lineString+"L"+(eCirclex)+","+(eCircley-15);
		}
		lineString=lineString+"L"+eCirclex+","+eCircley;
		path[pathnum]=svg.path(lineString);
		path[pathnum].attr({
			markerEnd: marker,
			fill: "none",
			stroke: "#000",
			strokeWidth:1
		});
		circleArray[pathnum]={
				start:new_start_circle,
				end:new_end_circle,
				srect:start,
				erect:end
		};
	}
	else if(scol > ecol){//열 다르면 꺾인선 만들어줘야함(왼쪽으로 빠지는 선)
		//처음 시작 점 찾기
		var startx = Number(startchild[0].attr("x"));
		var starty = Number(startchild[0].attr("y"));
		var startwidth = Number(startchild[0].attr("width"));
		var startheight = Number(startchild[0].attr("height"));
		var sCirclex = startx+startwidth/2;
		var sCircley = starty+startheight;
		var new_start_circle = svg.circle(sCirclex,sCircley,0);
		new_start_circle.attr({
			pathid:pathnum,
			name:"from"
		});
		startG.add(new_start_circle);
		
		//끝나는 점 찾기
		var endx = Number(endchild[0].attr("x"));
		var endy = Number(endchild[0].attr("y"));
		var endwidth = Number(endchild[0].attr("width"));
		var endheight = Number(endchild[0].attr("height"));
		var eCirclex = endx+endwidth/2;
		var eCircley = endy;
		var new_end_circle = svg.circle(eCirclex,eCircley,0);
		new_end_circle.attr({
			pathid:pathnum,
			name:"to"
		});
		endG.add(new_end_circle);

		//아래 라인에 뭔가 있는지 판단해줘야함
		//***************************************************
		var lineString="M"+sCirclex+","+sCircley;
		var forX,forY;
		for(forY=srow+1;forY<erow;forY++){
			if(rectarr[scol][forY]){
				break;
			}
		}
		
		if(forY >= erow){
			for(forX=scol-1;forX>ecol;forX--){
				if(rectarr[forX][erow]){
					break;
				}
			}
		}
		console.log("forX : "+forX);
		console.log("forY : "+forY);
		console.log(erow);
		//처음 아래로 가는 선 그려주기
		if(forY>=erow){
			console.log("test for if");
			lineString=lineString+"L"+sCirclex+","+(eCircley-15);
			lineString=lineString+"L"+eCirclex+","+(eCircley-15);
//			if(forX==ecol)
//				lineString=lineString+"L"+sCirclex+","+eCircley;
//			else{//아래 사각형은 아무것도 없는데 왼쪽으로 가는 과정에 사각형이 길을 막고 있음.
//				lineString=lineString+"L"+sCirclex+","+(forY*80-80);
//				lineString=lineString+"L"+(eCirclex+25)+","+(forY*80-80);
//				lineString=lineString+"L"+(eCirclex+25)+","+eCircley;
//			}
			
		}
		else{//아래쪽으로 가는 라인에 사각형에 막힘
			console.log("test for else");
			lineString=lineString+"L"+sCirclex+","+(forY*80);
			lineString=lineString+"L"+(eCirclex+100)+","+(forY*80);
			lineString=lineString+"L"+(eCirclex+100)+","+(eCircley-15);
			lineString=lineString+"L"+(eCirclex)+","+(eCircley-15);
		}
		//***************************************************
		
		lineString=lineString+"L"+eCirclex+","+eCircley;
		console.log(lineString);
		path[pathnum]=svg.path(lineString);
		path[pathnum].attr({
			markerEnd: marker,
			fill: "none",
			stroke: "#000",
			strokeWidth:1
		});
		circleArray[pathnum]={
				start:new_start_circle,
				end:new_end_circle,
				srect:start,
				erect:end
		};
	}
//	console.log(startG);
//	console.log(endG)
}
//node name 으로 찾아서 from link에서 어디에 연결되어있는지 찾아주는 함수.
function findNode(arr,nodename,num){
	var sink_re = /\S*[Ss]ink/;
	var ret=null;
	var startNode;
	var temp_row,temp_col,index;
	if(num==1){//num이 1일때 정규식으로 앞뒤 자르고 source
		col = maxcol+1;
		var re = /\S*[Ss]ource/;
		for(var i=0;i<arr.length;i++){
			var match = arr[i].from.match(re);
			if(match){
				if(FindRectf(findRectArr,match[0]) == -1){
					rectarr[col][row] = addrect(col*200+25,row*80+15,150,50,match[0]);
					rectarr[col][row].children()[0].attr({
						flow_name:flowname[0]
					});
					findRectArr.push({name:match[0],col:col,row:row});
					row++;
					flowname.splice(0,1);
				}
				ret = arr[i].to;
				arr.splice(i,1);
				index = FindRectf(findRectArr,match[0]);
				temp_row = findRectArr[index].row;
				temp_col = findRectArr[index].col;
				startNode = rectarr[col][row];
				break;
			}
		}
	}
	else{
		for(var i=0;i<arr.length;i++){
			var match = arr[i].from.match(nodename);
			if(match){
				//console.log(findRectArr);
				//console.log(match[0]);
				//console.log(findRectArr.indexOf(match[0]));
				if(FindRectf(findRectArr,match[0]) == -1){
					rectarr[col][row] = addrect(col*200+25,row*80+15,150,50,match[0]);
					findRectArr.push({name:match[0],col:col,row:row});
					row++;
				}
				ret = arr[i].to;
				//console.log(ret);
				arr.splice(i,1);
				index = FindRectf(findRectArr,match[0]);
//				console.log("second index : "+index);
				temp_row = findRectArr[index].row;
				temp_col = findRectArr[index].col;
				startNode = rectarr[col][row];
				break;
			}
		}
	}
//	console.log("index: "+index);
	if(ret==null){
		if(arr[0])
			ret = arr[0].from;
		col++;
		return ret;
	}
	if(FindRectf(findRectArr,ret) != -1){//있으니 선만 이어준다.
//		console.log("test : "+FindRectf(findRectArr,ret));
//		console.log("있다ret");
//		console.log(ret);
		line_queue.push({
			start:index,
			end:FindRectf(findRectArr,ret)
		});
		//drawLinef(index,FindRectf(findRectArr,ret));
	}
	else{//없으니 만들어 주고 이어준다.
//		console.log("만들었다 "+ ret);
		//start node의 위치를 찾는다.
		col = temp_col;
		row = temp_row+1;
		while(1){
			if(rectarr[col][row]){
				col++;
			}
			else{
				break;
			}
		}
		maxcol = Math.max(col,maxcol);
		rectarr[col][row] = addrect(col*200+25,row*80+15,150,50,ret);
		findRectArr.push({name:ret,col:col,row:row});
		row++;
		line_queue.push({
			start:index,
			end:FindRectf(findRectArr,ret)
		});
		//drawLinef(index,FindRectf(findRectArr,ret));
	}
	if(ret.match(sink_re)){
		if(arr[0])
			ret = arr[0].from;
		col++;
	}
//	console.log('ret = '+ret);
	//console.log(rectarr[0][0]);
	return ret;
}
if(flow){
	console.log(flowname);
	var line_queue=[];
	var maxcol=-1;
	
	row=0;
	col=0;
	console.log("ok");
	console.log(flow.length);
	for(var i=0;i<flow.length;i++
	){
		//flow 한개를 가지고 순회하며 flow를 만들어준다.
		var ret = findNode(flow[i],"source",1);
//		console.log(ret);
		while(flow[i].length > 0){
			ret = findNode(flow[i],ret,2);
			//console.log(flow[i].length);
		}
		//while(1){
		//var ret = findNode(flow[i],"source",1);
		//var ret = findNode(flow[i],"sink",2);
		//}
		/*for(var j=0;j<flow[i].length;j++){
			rectarr[row][col]=addrect(col*200+20,row*80+20,150,50,flow[i][j].from);
			row++;
			if(j==flow[i].length-1)
				rectarr[row][col]=addrect(col*200+20,row*80+20,150,50,flow[i][j].to);
		}*/
		col++;
		row=0;
	}
	while(line_queue.length > 0){
		var temp = line_queue.shift();
		drawLinef(temp.start,temp.end);
	}
}
