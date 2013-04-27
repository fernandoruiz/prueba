Ti.include("chatConfig.js");
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

//GET_CHAT_CANDIDATES***********************************************************************

exports.getChatCandidates = function() {

	Ti.API.info('chatGLEB - POST to ' + getChatCandidates_url);
	
	//OBTENEMOS EL LISTADO DE CONTACTOS DE LA AGENDA*********************************
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
	
	var url = getChatCandidates_url;
	var params = {};
	var timeout = 30000; //miliseconds
	var headers = {
		"X-GLEBUUID": Ti.App.Properties.getString("GLEBUUID"),
		"X-TOKEN": Ti.App.Properties.getString("token")		
	};
	var body = data;
	
	var getChatCandidates_callback = function (obj,e){	
		if (e.error) {
		        Ti.App.fireEvent('getChatCandidates_error');
		}
		else {
		    var response =  JSON.parse(obj.responseText); 	
		    //Ti.App.fireEvent('getChatCandidates_done',response);
		    Ti.API.info('GLEB - volcando lista de candidatos a la BD');
			// Tenemos un objeto JSON con el listado de candidatos
			var db = Ti.Database.open('chatDB');
			db.execute('DELETE FROM CHAT_CANDIDATES');
			var valuesInsert = "";
			
			for(v in response.candidates) {
				//Construimos cada uno de los insert
				valuesInsert = "'" + response.candidates[v].glebId + "','" + response.candidates[v].name + "','" + response.candidates[v].image + "','" + response.candidates[v].telephone + "'";
				Ti.API.info('Insert BD'+valuesInsert);
				db.execute("INSERT INTO CHAT_CANDIDATES (id_gleb, name, image, telephone) VALUES(" + valuesInsert + ")");	
			};
			db.close();
			db = null;
			//Actualizamos el valor que indica la fecha de la última actualización de los contactos
			require('chat/settings')._setLastUpdatedCandidates();
		}
		
		url = null;
		params = null;
		timeout = null;
		headers = null;	
	}
	makePOST (url,timeout,body,'',headers,getChatCandidates_callback);	
}

//******************************************************************************************

/********************* POST *************************************/
var makePOST = function(url,tout,body,blob,headers,f_callback) {
	
		Ti.API.debug('GLEB - UPLOADER - POST to ' + url);
		
		// Creamos HTTP client
		var xhr = Ti.Network.createHTTPClient();
		// Establecemos el timeout
		xhr.setTimeout(tout);
		
		// Establecemos la funcion onload
		xhr.onload = function(e)
		{
			Ti.API.debug('GLEB - UPLOADER - onload called, HTTP status = '+this.status);
			f_callback (this, e);
			xhr = null;
		};
		
		// Establecemos la funcion onerror
		xhr.onerror = function(e)
		{
			Ti.API.debug('GLEB - UPLOADER -onerror: '+JSON.stringify(e));
			f_callback (this, e);
			xhr = null;
		};
		
		xhr.ondatastream = function(e) {
			Ti.API.debug('GLEB - UPLOADER - ondatastream called, readyState = '+this.readyState);
		};
		
		xhr.onsendstream = function(e) {
		        // function called as data is uploaded
		   // Ti.API.debug('GLEB - UPLOADER - onsendstream called, readyState = '+this.readyState);
		};
		
		xhr.onreadystatechange =  function(e) {
		    switch(this.readyState) {
		        case 0:
		            // after HTTPClient declared, prior to open()
		            // though Ti won't actually report on this readyState
		            Ti.API.debug('GLEB - UPLOADER - case 0, readyState = '+this.readyState);
		        break;
		        case 1:
		            // open() has been called, now is the time to set headers
		            Ti.API.debug('GLEB - UPLOADER - case 1, readyState = '+this.readyState);
		        break;
		        case 2:
		            // headers received, xhr.status should be available now
		            Ti.API.debug('GLEB - UPLOADER - case 2, readyState = '+this.readyState);
		        break;
		        case 3:
		            // data is being received, onsendstream/ondatastream being called now
		            Ti.API.debug('GLEB - UPLOADER - case 3, readyState = '+this.readyState);
		        break;
		        case 4:
		            // done, onload or onerror should be called now
		            Ti.API.debug('GLEB - UPLOADER - case 4, readyState = '+this.readyState);
		        break;
		        }
		}
		
		//Desactivamos la validación del certificado
		xhr.setValidatesSecureCertificate (false);
		
		xhr.open("POST", url);
		
		if (headers) {
			for (var header in headers){
				Ti.API.debug('GLEB - UPLOADER - '+header+':'+headers[header]);
				xhr.setRequestHeader(header,headers[header]);
			}
		}
		
		Ti.API.debug("GLEB - UPLOADER - BODY: " +body+" BLOB: " +blob);
		
		// Si tenemos body y file, tiene prioridad el file
		if (body!="" && blob !="") {
			Ti.API.debug('GLEB - UPLOADER - SENDING BINARY DATA');
			xhr.send({file:blob.read()});
		}
		else if (body=="" && blob !="") {
			Ti.API.debug('GLEB - UPLOADER - SENDING BINARY DATA');
			xhr.send({file:blob.read()});
		}
		else if (body!="" && blob =="") {
			Ti.API.debug('GLEB - UPLOADER - SENDING PLAIN/TEXT DATA');
			xhr.send(body);
		}
		else xhr.send();
		
}
/******************* FIN DEL POST  ******************************/


//SEND_CHAT_MESSAGES************************************************************************
var sendChatMessage = function(textMessage, glebIdFrom, nameGroupReceiver, timestamp) {

Ti.API.info('chatGLEB - POST to ' + sendChatMessage_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	var response =  JSON.parse(this.responseText); 		
	        //Comprobamos que el estado del response recibido es ok (code=200)
			if(response.meta.code == 200){
				Ti.App.fireEvent('sendChatMessage_done', {textMessage:textMessage,glebIdFrom:glebIdFrom,nameGroupReceiver:nameGroupReceiver,timestamp:timestamp});
			}
			else{
				var dialog = Ti.UI.createAlertDialog({
			    	message: 'Se ha detectado un error con el servidor [ERROR: 2020]',
			    	ok: 'Ok',
			    	title: 'Error de comunicación'
			  	}).show(); 
			}		    		
        }       
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - sendChatMessage Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('sendChatMessage_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("POST", sendChatMessage_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
var bodyContent = "message:" + textMessage + "id_from:" + glebIdFrom + "group_receiver:" + nameGroupReceiver;
Ti.API.info('bodyContent de getChatCandidates: ' + bodyContent);
xhr.send(bodyContent);  // request is actually sent with this statement
}
//******************************************************************************************


//GET_CHAT_MESSAGES*************************************************************************
var getChatMessages = function() {

Ti.API.info('chatGLEB - GET to ' + getChatMessages_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	Ti.API.debug('GLEB - PATH= '+Titanium.Filesystem.applicationDataDirectory);
        	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'json');
			if (!uiDir.exists()) {
    			uiDir.createDirectory();
			}
        	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "messages.json");
        	if (f.write(this.responseText)===false) {
 			   // handle write error
 			   alert ("Ha habido un error guardando el fichero 'messages.json'");
			}
    		// dispose of file handles
			imageFile = null;
			imageDir = null;    		    		
        }       
        var response =  JSON.parse(this.responseText); 		
        Ti.API.info('GLEB - Messages downloaded from server: '+response);
        //Comprobamos que el estado del response recibido es ok (code=200)
		if(response.meta.code == 200){
			Ti.App.fireEvent('getChatMessages_done',response);
		}
		else{
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Se ha detectado un error con el servidor [ERROR: 3030]',
		    	ok: 'Ok',
		    	title: 'Error de comunicación'
		  	}).show(); 
		}
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - getChatMessages Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('getChatMessages_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("GET", getChatMessages_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
xhr.send();  // request is actually sent with this statement
}
//******************************************************************************************


//GET_ALL_CHAT_MESSAGES*************************************************************************
var getAllChatMessages = function(nameGroup) {

Ti.API.info('chatGLEB - GET to ' + getAllChatMessages_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea     
        var response =  JSON.parse(this.responseText); 		
        Ti.API.info('GLEB - Messages downloaded from server: '+response);
        //Comprobamos que el estado del response recibido es ok (code=200)
		if(response.meta.code == 200){
			//En este caso, no se vuelca la información a BD. Sólo se muestra al usuario.
			Ti.App.fireEvent('getAllChatMessages_done',response);
		}
		else{
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Se ha detectado un error con el servidor [ERROR: 3131]',
		    	ok: 'Ok',
		    	title: 'Error de comunicación'
		  	}).show(); 
		}
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - getAllChatMessages Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('getAllChatMessages_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("GET", getAllChatMessages_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
xhr.setRequestHeader("GROUP_NAME",nameGroup);
xhr.send();  // request is actually sent with this statement
}
//******************************************************************************************


//CREATE_CHAT_GROUP*************************************************************************
var createChatGroup = function(groupId, groupName, arrayPartipatesId, timestampCreated) {

Ti.API.info('chatGLEB - POST to ' + createChatGroup_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	var response =  JSON.parse(this.responseText); 		
	        //Comprobamos que el estado del response recibido es ok (code=200)
			if(response.meta.code == 200){
				Ti.App.fireEvent('createChatGroup_done', {groupId:groupId,groupName:groupName,arrayPartipatesId:arrayPartipatesId,timestampCreated:timestampCreated});
			}
			else{
				var dialog = Ti.UI.createAlertDialog({
			    	message: 'Se ha detectado un error con el servidor [ERROR: 4040]',
			    	ok: 'Ok',
			    	title: 'Error de comunicación'
			  	}).show(); 
			}		    		
        }       
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - createChatGroup Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('createChatGroup_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("POST", createChatGroup_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
var bodyContent = "groupId:" + groupId + "groupName:" + groupName + "participate_ids:" + JSON.stringify(arrayPartipatesId) + "created_at:" + timestampCreated;
Ti.API.info('bodyContent de createChatGroup: ' + bodyContent);
xhr.send(bodyContent);  // request is actually sent with this statement
}
//******************************************************************************************


//ADD_CONTACT_TO_CHAT*************************************************************************
var addContactToChat = function(groupName, contactId, timestampUpdated) {

Ti.API.info('chatGLEB - POST to ' + addContactToChat_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	var response =  JSON.parse(this.responseText); 		
	        //Comprobamos que el estado del response recibido es ok (code=200)
			if(response.meta.code == 200){
				Ti.App.fireEvent('addContactToChat_done', {groupName:groupName,contactId:contactId,timestampUpdated:timestampUpdated});
			}
			else{
				var dialog = Ti.UI.createAlertDialog({
			    	message: 'Se ha detectado un error con el servidor [ERROR: 4141]',
			    	ok: 'Ok',
			    	title: 'Error de comunicación'
			  	}).show(); 
			}		    		
        }       
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - addContactToChat Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('addContactToChat_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("POST", addContactToChat_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
var bodyContent = "groupName:" + groupName + "contactId:" + contactId + "updated_at:" + timestampUpdated;
Ti.API.info('bodyContent de createChatGroup: ' + bodyContent);
xhr.send(bodyContent);  // request is actually sent with this statement
}
//******************************************************************************************


//GET_CHAT_GROUPS***************************************************************************
var getChatGroups = function() {

Ti.API.info('chatGLEB - GET to ' + getChatGroups_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	Ti.API.debug('GLEB - PATH= '+Titanium.Filesystem.applicationDataDirectory);
        	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'json');
			if (!uiDir.exists()) {
    			uiDir.createDirectory();
			}
        	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "groups.json");
        	if (f.write(this.responseText)===false) {
 			   // handle write error
 			   alert ("Ha habido un error guardando el fichero 'groups.json'");
			}
    		// dispose of file handles
			imageFile = null;
			imageDir = null;    		    		
        }       
        var response =  JSON.parse(this.responseText); 		
        Ti.API.info('GLEB - Groups downloaded from server: '+response);
        //Comprobamos que el estado del response recibido es ok (code=200)
		if(response.meta.code == 200){
			Ti.App.fireEvent('getChatGroups_done',response);
		}
		else{
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Se ha detectado un error con el servidor [ERROR: 5050]',
		    	ok: 'Ok',
		    	title: 'Error de comunicación'
		  	}).show(); 
		}
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - getChatGroups Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('getChatGroups_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("GET", getChatGroups_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
xhr.send();  // request is actually sent with this statement
}
//******************************************************************************************


//DELETE_CHAT_GROUP*************************************************************************
var deleteChatGroup = function(groupName) {

Ti.API.info('chatGLEB - POST to ' + deleteChatGroup_url);

var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onload called, readyState = '+this.readyState);
        Ti.API.info('GLEB - onload called, HTTP status = '+this.status);
        //Acctualizacion de la BD o lo que sea
        if (this.responseText) {
        	var response =  JSON.parse(this.responseText); 		
	        //Comprobamos que el estado del response recibido es ok (code=200)
			if(response.meta.code == 200){
				Ti.App.fireEvent('deleteChatGroup_done', {groupName:groupName});
			}
			else{
				var dialog = Ti.UI.createAlertDialog({
			    	message: 'Se ha detectado un error con el servidor [ERROR: 4040]',
			    	ok: 'Ok',
			    	title: 'Error de comunicación'
			  	}).show(); 
			}		    		
        }       
    },
    onerror: function(e) {
        // function called in readyState DONE (4)
        //Ti.API.info('GLEB - onerror called, readyState = '+this.readyState);
        Ti.API.info('chatGLEB - deleteChatGroup Error, HTTP status = '+this.status);        
        Ti.App.fireEvent('deleteChatGroup_error');
    },
    timeout:20000  // in milliseconds 
});

xhr.open("POST", deleteChatGroup_url);
xhr.setRequestHeader("Content-Type","application/json");
xhr.setRequestHeader("X-GLEBUUID",Ti.App.Properties.getString("GLEBUUID"));
var bodyContent = "name:" + groupName;
Ti.API.info('bodyContent de deleteChatGroup: ' + bodyContent);
xhr.send(bodyContent);  // request is actually sent with this statement
}
//******************************************************************************************
