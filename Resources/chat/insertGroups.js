//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/comunication.js");
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var insertGroupsView;
var tamanoTexto = 14;
var lenghtMaxName = 20;
var numMaxParticipates = 15;

exports._get = function() {
	return insertGroupsView;	
};

exports._set = function() {
	
	insertGroupsView = Titanium.UI.createView({
		top:_p(60),
		backgroundColor:'#E1E1E1'
	});
	
	var labelName = Ti.UI.createLabel({
	  color: '#000000',
	  font: { fontSize:_p(tamanoTexto) },
	  shadowColor: '#aaa',
	  shadowOffset: {x:_p(5), y:_p(5)},
	  text: 'ASUNTO DEL GRUPO',
	  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	  top: _p(10),
	  left: _p(10),
	  height: _p(20),
	  width: _p(190)
	});
	
	insertGroupsView.add(labelName);
	
	var lengthName = 0;
	var validationLengthName = Ti.UI.createLabel({
		  color: '#000000',
		  clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ALWAYS,
		  font: { fontSize:_p(tamanoTexto) },
		  shadowColor: '#aaa',
		  shadowOffset: {x:_p(5), y:_p(5)},
		  text: lengthName + '/' + lenghtMaxName,
		  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		  top: _p(10),
		  left: _p(220),
		  height: _p(20),
		  width: _p(40)
	});
	
	insertGroupsView.add(validationLengthName);
	
	var name = Ti.UI.createTextField({
		color:'#336699',
		font: { fontSize:_p(tamanoTexto+1) },
		top:_p(45),
		left:_p(10),
		width:_p(250),
		height: _p(45),
		hintText:'asunto...',
		keyboardType:Ti.UI.KEYBOARD_DEFAULT,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	
	insertGroupsView.add(name);
	
	var btnClearName = Ti.UI.createButton({
		top: _p(55),
		left: _p(230),
		width: _p(20),
		height: _p(20),
		visible: false,
		backgroundImage:'../images/clearTextField.png'
	});
	
	insertGroupsView.add(btnClearName);
	
	btnClearName.addEventListener('click', function(e){
	    	name.setValue("");
	});
	
	//Evento para validar que el asunto no supere un nº de caracteres determinado
	name.addEventListener('change', function(e){
	    lengthName = e.source.value.length;
		validationLengthName.setText(lengthName + '/' + lenghtMaxName);
		if(lengthName > lenghtMaxName){
			e.source.value = e.source.value.slice(0,lenghtMaxName);
			name.setEditable(false);
		}
	});
	
	//Acciones a ejecutar cuando se hace click sobre el textField para introducir el nombre del grupo
	name.addEventListener('focus', function(e){
		name.setEditable(true);
	});
	
	
	//Acciones a ejecutar cuando el textField para introducir el nombre del grupo OBTIENE el foco
	name.addEventListener('focus', function(e){
		btnClearName.show();
	});
	
	//Acciones a ejecutar cuando el textField para introducir el nombre del grupo PIERDE el foco
	name.addEventListener('blur', function(e){
		btnClearName.hide();
	});
	
	
	
	var labelParticipates = Ti.UI.createLabel({
		  color: '#000000',
		  font: { fontSize:_p(tamanoTexto) },
		  shadowColor: '#aaa',
		  shadowOffset: {x:_p(5), y:_p(5)},
		  text: 'PARTICIPANTES DEL GRUPO',
		  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		  top: _p(100),
		  left: _p(10),
		  height: _p(20),
		  width: _p(200)
	});
	
	insertGroupsView.add(labelParticipates);
	
	var numParticipates = 0;
	var countParticipates = Ti.UI.createLabel({
		  color: '#000000',
		  font: { fontSize:_p(tamanoTexto) },
		  shadowColor: '#aaa',
		  shadowOffset: {x:_p(5), y:_p(5)},
		  text: numParticipates + '/' + numMaxParticipates,
		  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		  top: _p(100),
		  left: _p(220),
		  height: _p(20),
		  width: _p(40)
	});
	
	insertGroupsView.add(countParticipates);
	
	var participates = Ti.UI.createTextArea({
		color:'#336699',
		font: { fontSize:_p(tamanoTexto+1) },
		top: _p(125),
		left: _p(10),
		width: _p(250),
		height: _p(80),
		editable:false,
		hintText:'nombre del contacto...',
		keyboardType:Ti.UI.KEYBOARD_DEFAULT,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	
	insertGroupsView.add(participates);
	
	var btnClearParticipates = Ti.UI.createButton({
		top: _p(175),
		left: _p(230),
		width: _p(20),
		height: _p(20),
		visible: false,
		backgroundImage:'../images/clearTextField.png'
	});
	
	insertGroupsView.add(btnClearParticipates);
	
	btnClearParticipates.addEventListener('click', function(e){
	    	participates.setValue("");
	});
	
	//Evento para validar que el nº de participantes no supere un límite determinado
	participates.addEventListener('change', function(e){
	    var listParticipates = participates.value.split(",");
		numParticipates = listParticipates.length-1;
		countParticipates.setText(numParticipates + '/' + numMaxParticipates);
		if(numParticipates >= numMaxParticipates){
			btnAddParticipate.setEnabled(false);
		}
		else{
			btnAddParticipate.setEnabled(true);
		}
	});
	
	//Acciones a ejecutar cuando el textArea para introducir los participantes del grupo OBTIENE el foco
	participates.addEventListener('focus', function(e){
		btnClearParticipates.show();
	});
	
	//Acciones a ejecutar cuando el textArea para introducir los participantes del grupo PIERDE el foco
	participates.addEventListener('blur', function(e){
		btnClearParticipates.hide();
	});
	
	
	var btnAddParticipate = Ti.UI.createButton({
		top: _p(125),
		left: _p(270),
		width: _p(35),
		height: _p(35),
		borderRadius:1,
		borderWidth:2,
		backgroundImage:'../images/addParticipate.png'
	});
	
	insertGroupsView.add(btnAddParticipate);
	
	btnAddParticipate.addEventListener('click',function(e) {
	
		var win = Ti.UI.createWindow({
			modal:true,
			url:'contactsList.js',
			title:'LISTA DE CONTACTOS'
		});
			
		require('modules/NavigationController').open(win);
	});
	
	var btnCreate = Ti.UI.createButton({
		title:'Crear',
		top: _p(215),
		left: _p(10),
		width: _p(65),
		height: _p(45),
		borderRadius:1,
		font:{fontFamily:'Arial',fontWeight:'bold',fontSize:_p(tamanoTexto)}
	});
	
	insertGroupsView.add(btnCreate);
	
	btnCreate.addEventListener('click',function(e) {
		if (name.value != '' && participates.value != '') {
			var now = new Date();
			var arrayPartipatesIds = [];
			var dbChat = Ti.Database.open('chatDB');
			
			var listParticipates = participates.value.split(",");
			for(var i = 0;i<listParticipates.length-1;i++){
				Ti.API.info('Cada participante del nuevo grupo: ' + listParticipates[i]);
			  	var queryParticipateId = dbChat.execute('SELECT * FROM CHAT_CANDIDATES WHERE NAME="' + listParticipates[i] + '"');
				var participateId = queryParticipateId.fieldByName('id_gleb');
				if(queryParticipateId.rowCount == 1){
					arrayPartipatesIds.push(participateId);
				}
			}
			dbChat.close();
			dbChat = null;
			
			//Generamos el id del nuevo grupo
			Ti.API.info("GLEB - Generando GroupID");
			var idGroup = Ti.Utils.base64encode(name.value+now.valueOf());
			
			//Realizamos el POST al servidor
			createChatGroup(idGroup, name.value, arrayPartipatesIds, now.valueOf());
		} 
		else {
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Por favor, rellene todos los campos',
		    	ok: 'Ok',
		    	title: 'Aviso'
		  	}).show();
		}
	});
	
	/* ANDROID:BACK
	insertGroupsView.addEventListener('android:back',function() {
		Ti.API.info("GLEB - Pressing Back Will Not Close The Activity/Window");	  	
	});
	*/
};

function insertRows(dbData) {
	var dbChat = Ti.Database.open('chatDB');

	//Lo primero que haremos será comprobar que no existe otro grupo con el mismo nombre.
	var selectNameGroup = dbChat.execute('SELECT * FROM CHAT_GROUPS WHERE name_group="' + name.value + '"');
	var rowCount;
	if (Ti.Platform.name === 'android') {
	    rowCount = selectNameGroup.rowCount;
	} else {
	    rowCount = selectNameGroup.rowCount();
	}
	
	if (rowCount >= 1){
		dbChat.close();
		dbChat = null;
		var dialog = Ti.UI.createAlertDialog({
	    	message: 'El grupo que intenta crear, ya existe',
	    	ok: 'Ok',
	    	title: 'Aviso'
	  	}).show();	
	}
	else{
		//TODO - AHORA COMO ID_GROUP LE PASAMOS EL NOMBRE DEL GRUPO, PERO LO COGEREMOS DE LA TABLA QUE TENGO QUE CREAR CON LOS POSIBLES PARTICIPANTES

		var now = new Date();
		var miliseconds = now.valueOf();
		
		var listParticipates = participates.value.split(",");
		for(var i = 0;i<listParticipates.length-1;i++){
			Ti.API.info('Cada Participates ' + listParticipates[i]);
		  	var sentenciaSQL = "INSERT INTO CHAT_GROUPS (id_group, name_group, id_participate_user, created, last_updated) VALUES('" + name.value + "','" + name.value + "','" + listParticipates[i] + "'," + miliseconds + "," + miliseconds + ");";
			dbChat.execute(sentenciaSQL);
		}
		dbChat.close();	
		dbChat = null;
		
		var dialog = Ti.UI.createAlertDialog({
	    	message: 'El nuevo grupo "' + name.value + '"se ha creado correctamente',
	    	ok: 'Ok',
	    	title: 'Aviso'
	  	}).show();	
	  	//Resetear campos de texto
	  	name.value = "";
	  	participates.value = "";
	  	
		//TODO - Si el nuevo grupo se ha insertado correctamente, entonces se deberá de refrescar la lista de grupos de la pestaña correspondiente.
		Ti.App.fireEvent('refresh_chat_list');	
		
	}
};

Ti.App.addEventListener('contactSelected',function(e)
{
  Titanium.API.info("Contacto seleccionado = " + e.contactName);
  //Asignamos el valor recuperado al textFiels de los participantes del grupo
  var findString = e.contactName + ",";
  var location = participates.value.search(findString);
  Titanium.API.info("LOCATION = " + location);
  if(location >= 0){
  	var dialog = Ti.UI.createAlertDialog({
    	message: 'No puede seleccionar el contacto "' + e.contactName + '"más de una vez',
    	ok: 'Ok',
    	title: 'Aviso'
  	}).show();	
  }
  else{
  	var participantsString = participates.getValue('value');
	  participantsString = participantsString + e.contactName + ",";
	  Ti.API.info("El string con la lista de participantes del grupo es = " + participantsString);
	  participates.value = participantsString; 
  }
});