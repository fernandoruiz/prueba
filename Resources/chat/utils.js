

var _p = function (value) {
	//return parseInt(value*Ti.Platform.displayCaps.platformWidth/320);	
	platformWidth = Ti.Platform.displayCaps.platformWidth;	
	return parseInt(value*platformWidth/320);
};  


//Esta función nos devuelve si el mensaje es de hoy o de ayer. 
//Si la diferencia es de más de 2 días, nos devuelve la fecha en formato DD/MM/YYYY.
var compareDateWithNow = function (miliseconds) {
	var datetime = new Date(miliseconds);
	var date = datetime.getDate();
	var month = datetime.getMonth() + 1;
	var year = datetime.getFullYear();
	var dateTimeString = date + "/" + month + "/" +  year;
	
	var now = new Date();
	var dateNow = now.getDate();
	var monthNow = now.getMonth() + 1;
	var yearNow = now.getFullYear();
	
	if(year == yearNow){
		if(month == monthNow){
			if(date == dateNow){
				dateTimeString = "Hoy";
			}
			else if(date == dateNow-1){
				dateTimeString = "Ayer";
			}
		}
	}
	
	return dateTimeString;
};

//Esta función nos devuelve la fecha en formato DD/MM/YYYY de los milisegundos pasados como argumento de entrada.
var convertMilisecondsToDate = function (miliseconds) {
	var fullDate = new Date(miliseconds);
	
	var date = fullDate.getDate();
	var month = fullDate.getMonth() + 1;
	var year = fullDate.getFullYear();
	
	var dateString = date + "/" + month + "/" +  year;
	return dateString;
};

//Esta función nos devuelve la fecha en formato "DD de MM de YYYY" de los milisegundos pasados como argumento de entrada.
var convertMilisecondsToDateString = function (miliseconds) {
	var fullDate = new Date(miliseconds);
	
	var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
	
	var date = fullDate.getDate();
	var month = fullDate.getMonth();
	var year = fullDate.getFullYear();
	
	var dateString = date + " de " + monthNames[month] + " de " +  year;
	return dateString;
};

//Esta función nos devuelve la hora en formato HH/MM de los milisegundos pasados como argumento de entrada.
var convertMilisecondsToTime = function (miliseconds) {
	var fullDate = new Date(miliseconds);
	
	var hours = fullDate.getHours();
	var minutes = fullDate.getMinutes();
	if(hours <= 9){
		hours = "0" + hours;
	}
	if(minutes <= 9){
		minutes = "0" + minutes;
	}
	
	var timeString = hours + ":" + minutes;
	return timeString;
};

//Esta función nos devuelve la fecha actual del sistema en formato DD/MM/YYYY.
var formatNow = function () {
	var datetime = new Date();
	
	var date = datetime.getDate();
	var month = datetime.getMonth() + 1;
	var year = datetime.getFullYear();
	
	var dateTimeString = date + "/" + month + "/" +  year;
	return dateTimeString;
};

//ANOTACIONES FORMATO FECHAS
/*	
	var now = new Date();
	
	var miliseconds = now.valueOf();
	
	var date = now.getDate();
	var month = now.getMonth() + 1;
	var year = now.getFullYear();
		 
	Ti.API.info("DateTimeMiliseconds - " + miliseconds);
	Ti.API.info("DateTime - " + date + "-" + month + "-" +  year);
	
	var datetime = new Date(miliseconds);
	Ti.API.info("DateTimeFINAL - " + datetime);
*/	

//Devuelve un array con todos los teléfonos de nuestra agenda
var getListPhoneAllPeople = function () {
	var people = Titanium.Contacts.getAllPeople();
	var rows = [];
	var index = 0;
	for (var i = 0; i < people.length; i++) {
		//Ti.API.info("People object is: "+people[i]);
		var phoneNumber = people[i].phone;
		var nameContact = people[i].fullName;
		
		for (var key in phoneNumber) {
	   		//Ti.API.info('NameContact=' + nameContact + ' key=' + key + ' value=' + phoneNumber[key]);
	   		rows[index] = phoneNumber;
	   		index++;
		}
	}
	return rows;
};
//EJEMPLO DE LLAMADA A LA FUNCION getListPhoneAllPeople
/*var tableview = Ti.UI.createTableView({
	data:listPhoneAllPeople()
});*/

//Devuelve un array con todos los nombres de los contactos de nuestra agenda
var getListAllPeople = function () {
	var people = Titanium.Contacts.getAllPeople();
	var rows = [];
	for (var i = 0; i < people.length; i++) {
		var nameContact = people[i].fullName;
		rows[i] = nameContact;
	}
	return rows;
};


//Devuelve un array con todos los contactos de nuestra agenda. 
//El array será un conjunto de objetos, cada uno de ello con el nombre y teléfono del contacto correspondiente. 
var getListContacts = function () {
	var people = Titanium.Contacts.getAllPeople();
	var array = [];
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
		    array.push(obj);
		}
	}
	return array;
};


//Devuelve un true si el grupo pasado como argumento es un chat uno a uno
var isIndividualChat = function (nameGroup) {
	
	var rowCount = 0;
	var isIndividual = false;
	
	//Conocer si la conversación es con una o varias personas
	var db = Ti.Database.open('chatDB');
	var listParticipants = db.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + nameGroup + '"');
	
	if (Ti.Platform.name === 'android') {
		rowCount = listParticipants.rowCount;
	} else {
		rowCount = listParticipants.rowCount();
	}
	db.close();
	db = null;
	
	if(rowCount == 1){
		isIndividual = true;
	}
	
	return isIndividual;
};

//Nos devuelve la lista de participantes de un determinado chat
var listParticipatesOfAGroup = function (nameGroup) {
	
	var stringParticipates = "Yo";
	
	//Guardamos el listado de participantes del chat seleccionado y la fecha de creación del mismo
	var db = Ti.Database.open('chatDB');
	
	Ti.API.info('nameGroup ' + nameGroup);
	
	var listaPartipantes = db.execute('SELECT DISTINCT name_participate_user FROM CHAT_MESSAGES WHERE NAME_GROUP="' + nameGroup + '" AND ID_PARTICIPATE_USER NOT IN ("' + myId + '") ORDER BY name_participate_user DESC');
	
	db.close();
	db = null;
	
	Ti.API.info('LENGHT listaPartipantes' + listaPartipantes.getRowCount());
	
	while(listaPartipantes.isValidRow()){
		stringParticipates = stringParticipates + ', ' + listaPartipantes.fieldByName('name_participate_user');
		listaPartipantes.next();
	};
	
	return stringParticipates;
};

//Nos devuelve la fecha de creación de un determinado chat
var createdDateOfAGroup = function (nameGroup) {
	
	var stringCreatedDate = "";
	
	//Guardamos el listado de participantes del chat seleccionado y la fecha de creación del mismo
	var db = Ti.Database.open('chatDB');
	
	Ti.API.info('nameGroup ' + nameGroup);
	
	var queryFechaCreacion = db.execute('SELECT * FROM CHAT_GROUPS WHERE NAME_GROUP="' + nameGroup + '"');
	
	db.close();
	db = null;
	
	Ti.API.info('LENGHT queryFechaCreacion ' + queryFechaCreacion.getRowCount());
	
	while(queryFechaCreacion.isValidRow()){
		stringCreatedDate = queryFechaCreacion.fieldByName('created');
		queryFechaCreacion.next();
	};
	stringCreatedDate = convertMilisecondsToDateString(stringCreatedDate);
	
	return stringCreatedDate;
};
