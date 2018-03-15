var dragging = false;
var divdragging = false;
$(".dragbox").mousedown(function(e){
	e.preventDefault();
	divdragging = true;
});
$("#resizer").mousedown(function(e){
	e.preventDefault();
	dragging=true;
	
});
$(document).mousemove(function(e){
	if(dragging){
		$(".top-boxes").css("height",e.pageY-4);
	}
	if(divdragging){
		$("")
	}
});
$(document).mouseup(function(e){
	dragging=false;
});

function dragover_handler(ev){
	ev.preventDefault();
	//ev.dataTransfer.dropEffect="move";
	console.log("dragover_handler");
}
function drop_handler(ev){
	console.log("drop_handler");
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    
    for (var i=0, file; file=files[i]; i++) {
    	console.log(file.type);
        if (file.type.match('xml.*') || file.name.match('xsd.*') ) {
            var reader = new FileReader();

            reader.onload = function(e2) {
            	var data = e2.target.result;
            	$(".textarea").val(data);
            }
            var textdata = reader.readAsText(file); 
        }
        else{
        	console.log(file.type);
        	console.log("file type not match");
        }
    }
}