// create var for the currentWindow
var currentWin = Ti.UI.currentWindow;

//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

//TODO: EL SERVIDOR NOS DEVOLVERA UN JSON CON TODOS LOS USUARIOS DISPONIBLES. POR AHORA, LISTAMOS TODOS LOS USUARIOS DE LA AGENDA.
var dbChat = Ti.Database.open('chatDB');
var rows = dbChat.execute('SELECT * FROM CHAT_CANDIDATES');
dbChat.close();
dbChat = null;
Ti.API.info('Numero de candidatos en BD'+rows.rowCount);

// create the array
var dataArray = [];

var countRows = 0;
var modulo = 0;
		
while (rows.isValidRow())
{
	//Las filas pares tienen un color y las impares otro
	modulo = countRows % 2;
	if(modulo == 0){
		rowColor = '#E1E1E1';
	}
	else{
		rowColor = '#C3C3C3';
	}
		
    dataArray.push({title:'' + rows.fieldByName('name') + '', color:'black', font:{fontSize:24,fontWeight:'bold', fontFamily:'Arial'},backgroundColor:rowColor, height:70, hasChild:false});
    countRows++;
    rows.next();	
};

// create table view
var tableview = Ti.UI.createTableView({
	data:dataArray
});

currentWin.add(tableview);

tableview.addEventListener('click',function(e) {
	Ti.API.info('contact clicked - ' + e.rowData.title);
	currentWin.close();
	Ti.App.fireEvent('contactSelected',{contactName:e.rowData.title});
});

