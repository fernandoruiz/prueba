//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var viewMessages;

exports._get = function() {
	return viewMessages;	
};

exports._set = function(name_group) {
	
	viewMessages = Titanium.UI.createView({
		backgroundColor:'#0F0F0F'
	});
	
	//Array donde se van a ir almacenando cada una de las filas del TableView
	var arrayRows = [];
	
	var countRows = 0;
	
	var arrayColors = ['#E1E1E1', '#C3C3C3', '#A5A5A5'];
	
	var tamanoTextoChat = 14;
	
	var dbChat = Ti.Database.open('chatDB');
	var nameChatGroup = name_group;
	var listMessages = dbChat.execute('SELECT * FROM CHAT_MESSAGES WHERE NAME_GROUP="' + nameChatGroup + '" ORDER BY TIMESTAMP ASC');
	dbChat.close();
	dbChat = null;
	
	// create the array
	var dataArray = [];
	
	var dateReference = "";
	
	//Añadimos el botón "Volver" a la actual ventana en la que estamos
	var btnReturn = Titanium.UI.createButton({   		
		backgroundColor: 'white',
		borderColor: 'white',
		borderRadius: 4,
		borderWidth: 1,
		title: 'VOLVER',
		top:_p(5),
		bottom:_p(10),
		width: _p(60),
		height: _p(30),
		right: _p(5),
		font:{fontSize:_p(tamanoTextoChat-2),fontWeight:"bold"},
	});
	
	btnReturn.addEventListener('click',function(e) {
		//Cerramos la ventana actual
		Titanium.Media.vibrate([ 0, 100]);
		viewMessages.hide();
		var header = require('chat/header')._get();
		header.show();
		var viewChats = require('chat/chatList')._get();
		viewChats.show();
		var mainWin = require('../chat')._getMainWin();
		mainWin.add(header);	
		mainWin.add(viewChats);	

	});
		
	viewMessages.add(btnReturn);
			
	//Añadimos el botón "Solicitar más mensajes" en el primer row de la TableViewRow
	var btnMoreMessages = Ti.UI.createButton({
		title:'Solicitar más mensajes',
		left:_p(60),
		right:_p(60),
		top:_p(5),
		height:_p(40),
		width:_p(200),
		borderRadius:1,
		font:{fontFamily:'Arial',fontWeight:'normal',fontSize:_p(tamanoTextoChat-2)}
	});
	var row = Ti.UI.createTableViewRow();
	row.add(btnMoreMessages);
	arrayRows.push(row);
	countRows++;
	
	btnMoreMessages.addEventListener('click',function(e) {
		/*TODO
		if (textMessage.value != '') {
			//Enviamos el mensaje al server y si todo va correctamente lo guardamos en la BD
			var now = new Date();
			sendChatMessage(textMessage.value, Ti.App.Properties.getString("GLEBUUID"), nameChatGroup, now.valueOf());
		} 
		else {
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Por favor, escriba un mensaje',
		    	ok: 'Ok',
		    	title: 'Aviso'
		  	}).show();
		}
		*/
	});
	
	 
	while (listMessages.isValidRow())
	{
		//Se tiene que analizar cada mensaje de la conversación y en función
		//del id del participante se pintará en un color u otro
		//PARA ELLO VAMOS A AÑADIR EN LA TABLA DE MENSAJES EL NOMRBE DEL GRUPO Y UN NUMERO QUE IDENTIFIQUE CADA MENSAJE 
		var row = Ti.UI.createTableViewRow();
		
		//TODO
		//var idMessageColor = listMessages.fieldByName('id_message_chat');
		var idMessageColor = 1;
		
		row.height = 'auto';
		row.hasChild = false;
		
		//Sacamos del timestamsp del registro, la fecha en formato DD/MM/AAAA para agruparl los mensajes por días
		var miliseconds =  listMessages.fieldByName('timestamp');
		var dateMessage = convertMilisecondsToDateString(miliseconds);
		var timeMessage = convertMilisecondsToTime(miliseconds);
		
		//Pintamos un registro que indique cada día en el que se han enviado mensajes		
		if(dateReference == "" || dateMessage != dateReference){
			var rowDate = Ti.UI.createTableViewRow();
			rowDate.backgroundColor = '#0F0F0F';
			rowDate.height = _p(30);
			rowDate.hasChild = false;
			var labelDateMessage = Ti.UI.createLabel({
				color:'black',
				minimumFontSize: _p(tamanoTextoChat-2),
				font:{fontSize:_p(tamanoTextoChat-2),fontWeight:'normal', fontFamily:'Arial'},
				textAlign:'center',
				backgroundImage:'../images/backgroundDate.png',
				left:_p(80),
				right:_p(80),
				top:_p(5),
				height:_p(20),
				width:_p(160),
				bottom:_p(5),
				clickName:'date',
				text:dateMessage
			});
			rowDate.add(labelDateMessage);
			arrayRows.push(rowDate);
			countRows++;
			dateReference = dateMessage;
		}
	
		
		var tmpIdParticipate = listMessages.fieldByName('id_participate_user');
		if(tmpIdParticipate == Ti.App.Properties.getString("GLEBUUID")){
			
			row.backgroundColor = '#E2F7E1';
			
				var labelMessage = Ti.UI.createLabel({
				color:'black',
				minimumFontSize: _p(tamanoTextoChat),
				font:{fontSize:_p(tamanoTextoChat),fontWeight:'normal', fontFamily:'Arial'},
				left:_p(70),
				top:_p(5),
				height:'auto',
				width:_p(230),
				bottom:_p(5),
				clickName:'message',
				text:listMessages.fieldByName('text_message')
			});
			row.add(labelMessage);
			
				var labelUpdated = Ti.UI.createLabel({
				color:'black',
				font:{fontSize:_p(tamanoTextoChat),fontWeight:'normal', fontFamily:'Arial'},
				left:_p(15),
				bottom:_p(5),
				height:'auto',
				width:'auto',
				textAlign:Titanium.UI.TEXT_ALIGNMENT_RIGHT,
				clickName:'timestamp',
				text:timeMessage
			});
			row.add(labelUpdated);
		}
		else{
			row.backgroundColor = '#E1E1E1';
		
			var tmpNameParticipate = listMessages.fieldByName('name_participate_user');
			row.title = tmpNameParticipate;
		
			var labelTitle = Ti.UI.createLabel({
				color:'black',
				font:{fontSize:_p(tamanoTextoChat+2),fontWeight:'bold', fontFamily:'Arial'},
				left:_p(15),
				top:_p(5),
				height:_p(20),
				width:_p(230),
				clickName:'title',
				text:tmpNameParticipate
			});
			row.add(labelTitle);
			
				var labelMessage = Ti.UI.createLabel({
				color:'black',
				minimumFontSize: _p(tamanoTextoChat),
				font:{fontSize:_p(tamanoTextoChat),fontWeight:'normal', fontFamily:'Arial'},
				left:_p(15),
				top:_p(30),
				height:'auto',
				width:_p(230),
				bottom:_p(5),
				clickName:'message',
				text:listMessages.fieldByName('text_message')
			});
			row.add(labelMessage);
			
				var labelUpdated = Ti.UI.createLabel({
				color:'black',
				font:{fontSize:_p(tamanoTextoChat),fontWeight:'normal', fontFamily:'Arial'},
				left:_p(260),
				bottom:_p(5),
				height:'auto',
				width:'auto',
				textAlign:Titanium.UI.TEXT_ALIGNMENT_RIGHT,
				clickName:'timestamp',
				text:timeMessage
			});
			row.add(labelUpdated);
		} 
	    
	    arrayRows.push(row);
	    countRows++;
	    listMessages.next();	
	};
	
	// create table view
	var tableview = Ti.UI.createTableView({
		backgroundColor:'#0F0F0F',
		top:_p(40),
		bottom:_p(60),
		allowsSelection:false,
		data:arrayRows
	});
	tableview.scrollToIndex(countRows);
	
	viewMessages.add(tableview);
	
	
	var textMessage = Ti.UI.createTextArea({
		color:'#336699',
		font:{fontFamily:'Arial',fontWeight:'normal',fontSize:_p(tamanoTextoChat)},
		bottom:_p(5),
		left:_p(0),
		width:_p(260),
		height:_p(55),
		hintText:'texto del mensaje...',
		keyboardType:Ti.UI.KEYBOARD_DEFAULT,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	
	viewMessages.add(textMessage);
	
	var btnSend = Ti.UI.createButton({
		title:'Enviar',
		bottom:_p(5),
		right:_p(0),
		width:_p(60),
		height:_p(55),
		borderRadius:1,
		font:{fontFamily:'Arial',fontWeight:'normal',fontSize:_p(tamanoTextoChat)}
	});
	
	viewMessages.add(btnSend);
	
	btnSend.addEventListener('click',function(e) {
		if (textMessage.value != '') {
			//Enviamos el mensaje al server y si todo va correctamente lo guardamos en la BD
			var now = new Date();
			//sendChatMessage(textMessage.value, Ti.App.Properties.getString("GLEBUUID"), nameChatGroup, now.valueOf());
		} 
		else {
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Por favor, escriba un mensaje',
		    	ok: 'Ok',
		    	title: 'Aviso'
		  	}).show();
		}
	});
	
	/* ANDROID:BACK
	viewMessages.addEventListener('android:back',function() {
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

