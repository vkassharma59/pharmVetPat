
function getdata2tabfun(){
	var row = document.getElementById("prop-mw-wrapper");
	var cell= row.getElementsByTagName("td");
	var molecularweight = cell[1].innerText;
	
	var row = document.getElementById("prop-formula-wrapper");
	var cell= row.getElementsByTagName("td");
	var formula = cell[1].innerText;
	//ok till now
	var turncp = localStorage.getItem("CompoundTurn");
	localStorage.setItem("MolicularForm"+turncp,formula);
	localStorage.setItem("MolicularWeight"+turncp,molecularweight);
	var f=1;
	localStorage.setItem("test",f);
    
    var a=Sketcher.toDataURL();
				localStorage.setItem('mg',a);

    window.location.reload();

}

