//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/comunication.js");
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var chatsView;
var tableViewChats;
var myId = Ti.App.Properties.getString("GLEBUUID");
var tamanoTextoChatList = 12;

var viewMessages;

exports._get = function() {
	return chatsView;	
};

exports._set = function () {
	Ti.API.info("Pinta la ventana con el listado de conversaciones del chat");
	
	var dbChat = Ti.Database.open('chatDB');
	
	//INSERTAMOS REGISTROS DE PRUEBA EN LA BD
	//***************************************
		
	var listGroups = dbChat.execute('SELECT * FROM CHAT_GROUPS');
	var rowCount;
	if (Ti.Platform.name === 'android') {
	    rowCount = listGroups.rowCount;
	} else {
	    rowCount = listGroups.rowCount();
	}
	Ti.API.info("Numero de registros de la consulta de CHAT_GROUPS = " + rowCount);
	if (rowCount == 0){
		dbChat.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES('111000111','Chat One','111carlos111',1336500422885,1336500573500)");
		dbChat.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES('111000222','Chat Two','111ana111',1336500423885,1336500994200)");
		dbChat.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES('111000222','Chat Two','111alberto111',1336500423885,1336500994200)");
	}
	
	var listMessages = dbChat.execute('SELECT * FROM CHAT_MESSAGES');
	if (Ti.Platform.name === 'android') {
	    rowCount = listMessages.rowCount;
	} else {
	    rowCount = listMessages.rowCount();
	}
	Ti.API.info("Numero de registros de la consulta de CHAT_MESSAGES = " + rowCount);
	if (rowCount == 0){
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000111','Chat One','111carlos111','Carlos García','Hola Fer, a qué hora quedamos esta tarde?.',1336500422887)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000111','Chat One','" + myId + "','Fernando Ruiz','Hola Carlos, yo a partir de las 20:00 estaré en casa.',1336500522995)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000111','Chat One','111carlos111','Carlos García','Ok. Entonces, sobre las 20:15 me paso por tu casa.',1336500553200)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000111','Chat One','" + myId + "','Fernando Ruiz','Perfecto!!. Luego nos vemos.',1336500573500)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','111ana111','Ana Llorente','Hola chic@s!!. Os apetece quedar esta noche para tomar algo?.',1336500423995)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','" + myId + "','Fernando Ruiz','Yo me apunto. A ver que dice Alberto.',1336500494200)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','111alberto111','Alberto Sanz','Lo siento chicos, pero tengo cena familiar y terminaré tarde.',1336500594200)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','111ana111','Ana Llorente','Q pena Alberto!!. Entonces, mejor lo dejamos para mañana.',1336500754200)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','" + myId + "','Fernando Ruiz','Me parece buena idea.',1336500894200)");
		dbChat.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, timestamp) VALUES('111000222','Chat Two','111alberto111','Alberto Sanz','Ok. Mañana hablamos.',1336500994200)");
	}
	//***************************************
	
		
	chatsView = Titanium.UI.createView({
		top:_p(60),
		backgroundColor:'#E1E1E1'
	});
	
	//Obtenemos un TableViewRow con todos los chats dados de alta y se lo añadimos al window
	recoveryChatsList();
	
	chatsView.add(tableViewChats);
	
	dbChat.close();
	dbChat = null;
	
};	


exports._update = function () {
	Ti.API.info("Actualizamos el listado de conversaciones del chat");
	
	//Obtenemos un TableViewRow con todos los chats dados de alta y se lo añadimos al window
	recoveryChatsList();
};	


var recoveryChatsList = function (){
	//Array donde se van a ir almacenando cada una de las filas del TableView
	var arrayRows = [];
	
	var countRows = 0;
	var rowColor;
	var modulo;
	
	//Añadimos el botón "Volver" a la actual ventana en la que estamos
	var btnReturn = Titanium.UI.createButton({   		
		backgroundColor: 'white',
		borderColor: 'white',
		borderRadius: 4,
		borderWidth: 1,
		title: 'CERRAR',
		top:_p(5),
		bottom:_p(5),
		width: _p(60),
		height: _p(30),
		right: _p(5),
		font:{fontSize:_p(tamanoTextoChatList),fontWeight:"bold"},
	});
	
	btnReturn.addEventListener ('click', function() {
		Ti.App.fireEvent ('gleb_closeChat');
	});
	
	var row = Ti.UI.createTableViewRow();
		
	row.backgroundColor = '#0F0F0F';
	row.height = _p(40);
	row.index = countRows;
	
	row.add(btnReturn);
	arrayRows.push(row);
	countRows++;
	
	var dbChat = Ti.Database.open('chatDB');
	
	var listGroups = dbChat.execute('SELECT DISTINCT NAME_GROUP FROM CHAT_GROUPS ORDER BY LAST_UPDATED DESC');
			
	while (listGroups.isValidRow())
	{
		var row = Ti.UI.createTableViewRow();
		
		//Las filas pares tienen un color y las impares otro
		modulo = countRows % 2;
		if(modulo == 0){
			rowColor = '#E1E1E1';
		}
		else{
			rowColor = '#C3C3C3';
		}
		
		row.backgroundColor = rowColor;
		row.height = _p(60);
		row.hasChild = true;
		row.index = countRows;
		
		var tmpNameGroup = listGroups.fieldByName('name_group');
		row.title = tmpNameGroup;
		
		//Obtenemos el último mensaje de la conversación, ya que este se mostrará como parte de la información de la conversación.
		var listMessages = dbChat.execute('SELECT * FROM CHAT_MESSAGES WHERE NAME_GROUP="' + tmpNameGroup + '" ORDER BY TIMESTAMP DESC');
		if (Ti.Platform.name === 'android') {
		    rowCount = listMessages.rowCount;
		} else {
		    rowCount = listMessages.rowCount();
		}
		var lastTextMessage = "";
		
		//Conocer si la conversación es con una o varias personas
		var listParticipants = dbChat.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + tmpNameGroup + '"');
		
		if(listParticipants.rowCount == 1){
			//CHAT UNO A UNO
			row.leftImage = '../images/individual.png';
			if (rowCount > 0){
				lastTextMessage = listMessages.fieldByName('text_message');
			}
		}
		else if(listParticipants.rowCount > 1){
			//CHAT DE GRUPO
			row.leftImage = '../images/group.png';
			if (rowCount > 0){
				if (listMessages.fieldByName('id_participate_user') == myId){
					lastTextMessage = listMessages.fieldByName('text_message');
				}
				else{
					lastTextMessage = listMessages.fieldByName('name_participate_user') + ": " + listMessages.fieldByName('text_message');	
				}
			}
		}
		else{
			continue;
		}
		
		if(lastTextMessage.length > 25){
			lastTextMessage = lastTextMessage.substr(0,25);
			lastTextMessage = lastTextMessage + "...";	
		}
	
		var labelTitle = Ti.UI.createLabel({
			color:'black',
			font:{fontSize:_p(14),fontWeight:'bold', fontFamily:'Arial'},
			left:_p(20),
			top:_p(10),
			height:_p(20),
			width:_p(160),
			clickName:'title',
			text:tmpNameGroup
		});
		row.add(labelTitle);
		
		var labelLastMessage = Ti.UI.createLabel({
			color:'black',
			font:{fontSize:_p(14),fontWeight:'normal', fontFamily:'Arial'},
			left:_p(20),
			top:_p(30),
			height:_p(30),
			width:_p(320),
			clickName:'lastMessage',
			text:lastTextMessage
		});
		row.add(labelLastMessage);
	
		var lastUpdatedString = "";
		if(listParticipants.isValidRow()){
			var milisecondsLastUpdated = listParticipants.fieldByName('last_updated');
			lastUpdatedString = compareDateWithNow(milisecondsLastUpdated);
		}
		
		var labelUpdated = Ti.UI.createLabel({
			color:'black',
			font:{fontSize:_p(tamanoTextoChatList),fontWeight:'normal', fontFamily:'Arial'},
			left:_p(190),
			top:_p(10),
			height:_p(20),
			width:_p(60),
			textAlign:Titanium.UI.TEXT_ALIGNMENT_RIGHT,
			clickName:'date',
			text:lastUpdatedString
		});
		row.add(labelUpdated);
		
	    listGroups.next();	
	    
	    arrayRows.push(row);
	    countRows++;
	};
	
	dbChat.close();
	dbChat = null;
	
	// create table view
	tableViewChats = Ti.UI.createTableView({
		data:arrayRows
	});
	
	tableViewChats.addEventListener('click', function(e)
	{
		/*
		//Ti.API.info('table view row clicked - E ' + JSON.stringify(e));
		Ti.API.info('table view row clicked - source ' + e.rowData.title);
		var indexRowSelected = e.index;
		Ti.API.info('indexRowSelected = ' + indexRowSelected);
		
		if(indexRowSelected == 0){
			null;
		}
		else{
			var win = Ti.UI.createWindow({
				url:'chat.js',
				title:e.rowData.title
			});
			
			var name_group = e.rowData.title;
			win.name_group = name_group;
			require('modules/NavigationController').open(win);	
		}
		*/
		//Ti.API.info('table view row clicked - E ' + JSON.stringify(e));
		Ti.API.info('table view row clicked - source ' + e.rowData.title);
		var indexRowSelected = e.index;
		Ti.API.info('indexRowSelected = ' + indexRowSelected);
		
		if(indexRowSelected == 0){
			null;
		}
		else{
			require('chat/chat')._set(e.rowData.title);
			viewMessages = require('chat/chat')._get();
			viewMessages.show();
			var mainWin = require('../chat')._getMainWin();
			mainWin.add(viewMessages);
			
			return null; 
		}
	});
	
	tableViewChats.addEventListener('longclick', function(e)
	{
		//Ti.API.info('table view row clicked - E ' + JSON.stringify(e));
		Ti.API.info('table view row clicked - source ' + e.rowData.title);
		
		var stringListaParticipantes = listParticipatesOfAGroup(e.rowData.title);
		var fechaCreacion = createdDateOfAGroup(e.rowData.title);
		
		var options = "";
		var indexRowSelected = e.index;
		Ti.API.info('indexRowSelected = ' + indexRowSelected);
		
		if(indexRowSelected != 0){
			//Consultamos si el grupo es un chat individual o de más de 2 personas
			var bIndividual = isIndividualChat(e.rowData.title);
			if(bIndividual){
				//Mostramos el dialogo de opciones disponibles cuando mantenemos pulsando sobre un determinado chat
				var dialogIndividual = Titanium.UI.createOptionDialog({
					title:'Opciones',
					options:["Información del chat","Eliminar chat","Cancelar"],
					cancel:9
				});
				
				var dialogConfirmarDelete = Ti.UI.createAlertDialog({
			    	message: '¿Desea eliminar el chat?',
			    	buttonNames : ['Aceptar','Cancelar'],
			    	cancel: 1,
			    	title: 'Pregunta'
			  	});
			  	
			  	dialogIndividual.addEventListener('click', function(f)
				{
					Ti.API.info('F = ' + JSON.stringify(f));
					switch (f.index)
					{
						case 0:
							//Mostrar información del grupo o del chat
												
							var dialogInformation = Ti.UI.createAlertDialog({
						    	message: 'Participantes:\n' + stringListaParticipantes + '\n\nFecha de creación:\n' + fechaCreacion,
						    	ok: 'Ok',
						    	title: 'Información'
						  	}).show();
							
							break;
						case 1:
							//Eliminar chat del listado de chat's
							dialogConfirmarDelete.show();
							dialogConfirmarDelete.addEventListener('click', function(g){
								if(g.index != 1){
									tableViewChats.deleteRow(indexRowSelected);
									//Borrar de la BD y enviar accion al server
								}
							});
							break;
						default:
							//Cancelamos y no hacemos nada
							null;
					}
				});
				dialogIndividual.show();
			}
			else{
				//Mostramos el dialogo de opciones disponibles cuando mantenemos pulsando sobre un determinado chat
				var dialogGroup = Titanium.UI.createOptionDialog({
					title:'Opciones',
					options:["Información del grupo","Eliminar y salir del grupo","Añadir contacto al grupo","Cancelar"],
					cancel:9
				});
				
				var dialogConfirmarDelete = Ti.UI.createAlertDialog({
			    	message: '¿Desea abandonar el chat de grupo?',
			    	buttonNames : ['Aceptar','Cancelar'],
			    	cancel: 1,
			    	title: 'Pregunta'
			  	});
			  	
			  	dialogGroup.addEventListener('click', function(f)
				{
					Ti.API.info('F = ' + JSON.stringify(f));
					switch (f.index)
					{
						case 0:
							//Mostrar información del grupo o del chat
												
							var dialogInformation = Ti.UI.createAlertDialog({
						    	message: 'Participantes:\n' + stringListaParticipantes + '\n\nFecha de creación:\n' + fechaCreacion,
						    	ok: 'Ok',
						    	title: 'Información'
						  	}).show();
							
							break;
						case 1:
							//Eliminar chat del listado de chat's
							dialogConfirmarDelete.show();
							dialogConfirmarDelete.addEventListener('click', function(g){
								if(g.index != 1){
									tableViewChats.deleteRow(indexRowSelected);
									//Borrar de la BD y enviar accion al server
								}
							});
							break;
						case 2:
							//Añadir contacto al grupo
							var win = Ti.UI.createWindow({
								modal:true,
								url:'contactsList.js',
								title:'LISTA DE CONTACTOS'
							});
								
							require('modules/NavigationController').open(win);
							//Insertar en la BD y comunicárselo al server
							break;
						default:
							//Cancelamos y no hacemos nada
							null;
					}
				});
				dialogGroup.show();
			}
		}
	});
};


