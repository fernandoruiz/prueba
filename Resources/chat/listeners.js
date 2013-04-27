//REGISTRAR TODOS LOS LISTENERS DE LA APLICACION
exports.registerListeners = function() {

//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");
/*
	//GET_CHAT_CANDIDATES///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('getChatCandidates_begin', function(){
		
	Ti.API.info("LLAMADA A getChatCandidates_begin");
	
	//OBTENEMOS EL LISTADO DE CONTACTOS DE LA AGENDA///////////////////////////////////////////////////////////////////
	var people = Titanium.Contacts.getAllPeople();
	var data = [];
	for (var i = 0; i < people.length; i++) {

		Ti.API.info("People object is: "+people[i]);
		var phoneNumber = people[i].phone;
		var nameContact = people[i].fullName;
		var imageContact = people[i].image;
		
		for (var key in phoneNumber) {
	   		Ti.API.info('NameContact=' + nameContact + ' key=' + key + ' telephone=' + phoneNumber[key] + ' image=' + imageContact);
	   		var obj = {
		        name: nameContact,
		        key:key,
		        telephone: phoneNumber[key],
		        image:imageContact
		    };
		    data.push(obj);
		}
	}
	/////////////////////////////////////////////////////////////////////
	
	Ti.API.info('chatGLEB - POST to ' + getChatCandidates_url);

	var xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			// function called in readyState DONE (4)
			//Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
			Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
			//Acctualizacion de la BD o lo que sea
			if (this.responseText) {
				var response =  JSON.parse(this.responseText); 		
				Ti.API.info('GLEB - Candidates downloaded from server: '+JSON.stringify(response));
				//Comprobamos que el estado del response recibido es ok (code=200)
				if(response.meta.code == 200){
					Ti.App.fireEvent('getChatCandidates_done',response);
				}
				else{
					var dialog = Ti.UI.createAlertDialog({
						message: 'Se ha detectado un error con el servidor [ERROR: 1010]',
						ok: 'Ok',
						title: 'Error de comunicación'
					}).show(); 
				}		    		
			}
		},
		onerror: function(e) {
			// function called in readyState DONE (4)
			//Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
			Ti.API.info('chatGLEB - getChatCandidates Error, HTTP status = '+this.status);        
			Ti.App.fireEvent('getChatCandidates_error');
		},
		timeout:20000  // in milliseconds 
	});

	xhr.open("POST", getChatCandidates_url);
	xhr.setRequestHeader("Content-Type","application/json");
	xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
	Ti.API.info('bodyContent de getChatCandidates: ' + JSON.stringify(data));
	xhr.send(JSON.stringify(data));  // request is actually sent with this statement
	});
	/////////////////////////////////////////////////////////////////////


	//GET_CHAT_CANDIDATES///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('getChatCandidates_done', function(obj){			
		Ti.API.info('GLEB - volcando lista de candidatos a la BD');
		// Tenemos un objeto JSON con el listado de candidatos
		var db = Ti.Database.open('chatDB');
		db.execute('DELETE FROM CHAT_CANDIDATES');
		var valuesInsert = "";
		
		for(v in obj.candidates) {
			//Construimos cada uno de los insert
			valuesInsert = "'" + obj.candidates[v].glebId + "','" + obj.candidates[v].name + "','" + obj.candidates[v].image + "','" + obj.candidates[v].telephone + "'";
			Ti.API.info('Insert BD'+valuesInsert);
			db.execute("INSERT INTO CHAT_CANDIDATES (id_gleb, name, image, telephone) VALUES(" + valuesInsert + ")");	
		};
		db.close();
		db = null;
		//Actualizamos el valor que indica la fecha de la última actualización de los contactos
		var now = new Date();
		var dateString = convertMilisecondsToDate(now.valueOf());
		var timeString = convertMilisecondsToTime(now.valueOf());
		var lastUpdated = dateString + " " + timeString;
		Ti.App.Properties.setString("lastUpdatedCandidates",lastUpdated);
		Ti.API.info('FECHA SINCRONIZACION '+lastUpdated);
		
		//Ti.App.fireEvent('getChatCandidates_end');
	});
	/////////////////////////////////////////////////////////////////////

	//SEND_CHAT_MESSAGES///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('sendChatMessage_done', function(obj){			
		Ti.API.info('GLEB - guardando el mensaje enviado al servidor en la BD del dispositivo móvil');
		
		var db = Ti.Database.open('chatDB');
		var valuesInsert = "";
					
		//Construimos el insert
		var queryIdGroup = db.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + obj.nameGroupReceiver + '"');
		var idGroup = queryIdGroup.fieldByName('id_group');
		var queryNameSender = db.execute('SELECT * FROM CHAT_CANDIDATES WHERE ID_GLEB="' + obj.glebIdFrom + '"');
		var nameSender = queryNameSender.fieldByName('name');
		if(queryIdGroup.rowCount >= 1 && queryNameSender.rowCount == 1){
			valuesInsert = "'" + obj.nameGroupReceiver + "','" + idGroup + "','" + obj.glebIdFrom + "','" + nameSender + "','" + obj.textMessage + "','" + "'SEND_OK'," + obj.timestamp;
			db.execute("INSERT INTO CHAT_MESSAGES (id_group, name_group, id_participate_user, name_participate_user, text_message, status, timestamp) VALUES("+valuesInsert+")");	
		}
		else{
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Se ha detectado una inconsistencia en la Base de Datos',
		    	ok: 'Ok',
		    	title: 'Error de BD'
		  	}).show(); 
		}
		
		db.close();
		db = null;
	});
	/////////////////////////////////////////////////////////////////////
	
	//GET_CHAT_MESSAGES///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('getChatMessages_done', function(obj){			
		Ti.API.info('GLEB - volcando lista de mensajes nuevos a la BD');
		// Tenemos un objeto JSON con el listado de mensajes sin leer
		var db = Ti.Database.open('chatDB');
		var valuesInsert = "";
		
		for(v in obj.messages) {
			//Construimos cada uno de los insert
			valuesInsert = "'" + obj.candidates[v].glebId + "','" + obj.candidates[v].name + "','" + obj.candidates[v].image + "','" + obj.candidates[v].telephone + "'";
			db.execute("INSERT INTO CHAT_MESSAGES (glebId, name, image, telephone) VALUES(" + valuesInsert + ")");	
		};
		db.close();
		db = null;
	});
	/////////////////////////////////////////////////////////////////////
	
	//CREATE_CHAT_GROUP///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('createChatGroup_done', function(obj){			
		Ti.API.info('GLEB - insertando nuevo grupo en la BD');
		// Tenemos un objeto JSON con el nuevo grupo que se ha creado
		var db = Ti.Database.open('chatDB');
		var valuesInsert = "";
		
		for(var i=0;i<obj.arrayPartipatesId.length;i++){
			//Construimos cada uno de los insert
			valuesInsert = "'" + obj.groupId + "','" + obj.groupName + "','" + obj.arrayPartipatesId[i] + "'," + obj.timestampCreated + "," + obj.timestampCreated;
			db.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES(" + valuesInsert + ")");	
		};
		db.close();
		db = null;
	});
	/////////////////////////////////////////////////////////////////////
	
	//ADD_CONTACT_TO_CHAT///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('addContactToChat_done', function(obj){			
		Ti.API.info('GLEB - insertando contacto a grupo en la BD');
		// Tenemos un objeto con el nuevo contacto que debrá de añadir a un determinado grupo
		var db = Ti.Database.open('chatDB');
		
		//Obtenemos el id y la fecha de creación del grupo al que le tenemos que añadir un contacto
		var queryGroup = db.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + obj.groupName + '"');
		if(queryGroup.rowCount >= 1){
			//Construimos el insert
			var groupId = queryGroup.fieldByName('id_group');
			var created = queryGroup.fieldByName('created');
			var valuesInsert = "'" + groupId + "','" + obj.groupName + "','" + obj.contactId + "'," + created + "," + obj.timestampUpdated;
			db.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES(" + valuesInsert + ")");	
		}

		db.close();
		db = null;
	});
	/////////////////////////////////////////////////////////////////////
	
	//GET_CHAT_GROUPS///////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('getChatGroups_done', function(obj){			
		Ti.API.info('GLEB - volcando lista de grupos a la BD');
		// Tenemos un objeto JSON con el listado de grupos
		var db = Ti.Database.open('chatDB');
		db.execute('DELETE FROM CHAT_GROUPS');
		var valuesInsert = "";
		
		for(v in obj.chat_groups) {
			for(w in obj.chat_groups[v].participate_users) {
				//Construimos cada uno de los insert
				valuesInsert = "'" + obj.chat_groups[v].id + "','" + obj.chat_groups[v].name + "','" + obj.chat_groups[v].participate_users[w] + "'," + obj.chat_groups[v].created_at + "," + obj.chat_groups[v].updated_at;
				db.execute("INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES(" + valuesInsert + ")");	
			};
		};
		db.close();
		db = null;
		Ti.App.fireEvent('getChatGroups_end');
	});
	/////////////////////////////////////////////////////////////////////
	
	//DELETE_CHAT_GROUP////////////////////////////////////////////////////////////////////
	Ti.App.addEventListener('deleteChatGroup_done', function(obj){			
		Ti.API.info('GLEB - borrando grupo de la BD');
		// Tenemos un objeto JSON con el grupo del que nos queremos borrar
		var db = Ti.Database.open('chatDB');
		var valuesInsert = "";
		
		var queryGroup = db.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + obj.groupName + '"');
		if(queryGroup.rowCount == 2){
			db.execute('DELETE FROM CHAT_GROUPS WHERE NAME_GROUP="' + obj.groupName + '"');	
		}
		else if(queryGroup.rowCount > 2){
			db.execute('DELETE FROM CHAT_GROUPS WHERE NAME_GROUP="' + obj.groupName + '" AND ID_PARTICIPATE_USER="' + Ti.App.Properties.getString("GLEBUUID") + '"');	
		}
		else{
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Se ha detectado una inconsistencia en la Base de Datos',
		    	ok: 'Ok',
		    	title: 'Error de BD'
		  	}).show(); 
		}
		db.close();
		db = null;
	});
	///////////////////////////////////////////////////////////////////		
	*/
};