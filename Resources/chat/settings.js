//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/comunication.js");
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var settingsView;
var labelLastMessage;

exports._get = function() {
	return settingsView;	
};

exports._setLastUpdatedCandidates = function() {
	var now = new Date();
	var dateString = convertMilisecondsToDate(now.valueOf());
	var timeString = convertMilisecondsToTime(now.valueOf());
	var lastUpdated = dateString + " " + timeString;
	Ti.App.Properties.setString("lastUpdatedCandidates",lastUpdated);
	labelLastMessage.setText(lastUpdated);
	Ti.API.info('DATE SINCRONIZACION CANDIDATES = '+lastUpdated);	
};

exports._set = function() {
	Ti.API.info("Pinta la ventana con el listado de ajustes disponibles");

	settingsView = Titanium.UI.createView({
		top:_p(60),
		backgroundColor:'#0F0F0F'
	});
	
	//Array donde se van a ir almacenando cada una de las filas del TableView
	var arrayRows = [];
	
	var row = Ti.UI.createTableViewRow();
	row.backgroundColor = '#0F0F0F';
	row.height = _p(60);
	row.hasChild = false;
	
	var labelTitle = Ti.UI.createLabel({
		color:'#E1E1E1',
		font:{fontSize:_p(18),fontWeight:'normal', fontFamily:'Arial'},
		left:_p(10),
		top:_p(10),
		height:_p(25),
		width:_p(250),
		clickName:'title',
		text:'Sincronizar contactos'
	});
	row.add(labelTitle);
	
	labelLastMessage = Ti.UI.createLabel({
		color:'#1999EE',
		font:{fontSize:_p(14),fontWeight:'normal', fontFamily:'Arial'},
		left:_p(10),
		top:_p(40),
		height:_p(20),
		width:_p(250),
		clickName:'lastMessage',
		text:''
	});
	row.add(labelLastMessage);
	
	arrayRows.push(row);
	
	// create table view
	var tableview = Ti.UI.createTableView({
		data:arrayRows
	});
	
	var actInd = Titanium.UI.createActivityIndicator({
		bottom:_p(10), 
		height:_p(20),
		width:_p(20),
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	settingsView.add(actInd);
	
	Ti.App.addEventListener('getChatCandidates_end', function(){
		Ti.API.info("HEMOS TERMINADO EL UPDATE");
		labelLastMessage.setText(Ti.App.Properties.getString("lastUpdatedCandidates"));
		actInd.hide();
	});
			
	tableview.addEventListener('click', function(e)
	{
		Ti.API.info('table view row clicked - E ' + JSON.stringify(e));
		Ti.API.info('table view row clicked - source ' + e.index);
		
		switch(e.index){
			case 0:
				Ti.API.info('Justo antes de lanzar el getChatCandidates_begin');
				//SE LE PIDE AL SERVIDOR EL JSON CON LA LISTA DE CONTACTOS CON LOS QUE PODREMOS CHATEAR.
				Ti.App.fireEvent('gleb_openActivityIndicator',{"text":"Sincronizando ..."});
				
				require('chat/comunication').getChatCandidates();	//Hasta que no termine este evento, no se cierra el indicador de Sincronizando...
				
				Ti.App.fireEvent('gleb_closeActivityIndicator');
		}
		
	});
	
	// add the tableView to the current window
	settingsView.add(tableview);
	
	/* ANDROID:BACK
	settingsView.addEventListener('android:back',function() {
		Ti.API.info("GLEB - Pressing Back Will Not Close The Activity/Window");	   	
		var alertDialog = Titanium.UI.createAlertDialog({
				title: 'GLEB',
				message:'Pulsa el botón Volver para cerrar la ventana',
			    buttonNames: ['OK']
			});				
		alertDialog.show();
	});
	*/
};
