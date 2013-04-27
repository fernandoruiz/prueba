
//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/comunication.js");
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var	viewChats;
var	viewNewGroup;
var	viewSettings;
var chatHeader;

var mainWin = Titanium.UI.createWindow({
	//backgroundColor:'#E1E1E1'
});


//Generación del GLEBUUID en el caso de que no hubiera sido generado en el arranque de la aplicación
if (!Ti.App.Properties.getString("GLEBUUID")) {
	Ti.API.info("GLEB - Generando GLEBUUID");
	var UUID = Titanium.Platform.id;
	var glebUUID = Ti.Utils.base64encode(Ti.Utils.sha1(Titanium.Platform.macaddress+UUID));
	Ti.App.Properties.setString("GLEBUUID",glebUUID);
}
Ti.API.info("Mi ID es = " + Ti.App.Properties.getString("GLEBUUID"));

exports._getMainWin = function() {
	return mainWin;	
};

exports.GlebChat = function() {

	Ti.API.info("chatGLEB - Iniciando app.js");
		
	//CREAMOS LA BD Y LAS TABLAS ASOCIADAS A DICHA BD
	Ti.API.info("INSTALAMOS LA BD");
	//Si al ejecutar el método install, la BD ya está instalada, entonces el método install actuará igual que el método open.
	var dbChat = Ti.Database.install(Titanium.Filesystem.resourcesDirectory+'chat/bd/chatGLEB.sqlite','chatDB');
	dbChat.execute('DELETE FROM CHAT_CANDIDATES');
	dbChat.execute('DELETE FROM CHAT_GROUPS');
	dbChat.execute('DELETE FROM CHAT_MESSAGES');
	Ti.API.info("INSTALADA LA BD: " + dbChat.getName());
	dbChat.close();
	dbChat = null;
	
	
	//TODO - AL ARRANCAR LA APLICACION, SE SOLICITARA AL SERVIDOR EL LISTADO DE CHATS QUE TIENE DADOS DE ALTA EL USUARIO
	//getChatGroups();
	
	
	//TODO - DESCOMENTAR ESTA LINEA     Ti.App.addEventListener('getChatGroups_end', function(){
		
		var tamanoTexto = 12;
	
		Ti.App.fireEvent('gleb_openActivityIndicator',{"text":"Cargando ..."});
		
		
		//CREAMOS EL HEADER DEL CHAT
		require('chat/header');
		require('chat/header')._set();
		chatHeader = require('chat/header')._get();
		
		mainWin.add(chatHeader);	
			
		//CREAMOS LAS 3 VENTANAS QUE COMPONEN EL CHAT
		require('chat/chatList')._set();
		viewChats = require('chat/chatList')._get();
		 
		require('chat/insertGroups')._set();
		viewNewGroup = require('chat/insertGroups')._get();
		
		require('chat/settings');
		require('chat/settings')._set();
		viewSettings = require('chat/settings')._get();

		viewChats.show();		
		mainWin.add(viewChats);

		
		
		mainWin.addEventListener('open', function(){
			Ti.App.Properties.setBool('isChatOpen', true);			
		});
		mainWin.addEventListener('close', function(){
			Ti.App.Properties.setBool('isChatOpen', false);			
		});
		
		require('modules/NavigationController').open(mainWin);
		Ti.App.fireEvent('gleb_closeActivityIndicator');
		
		Ti.App.addEventListener ('gleb_closeChat', function(){
			mainWin.close();		
		});
		
		mainWin.addEventListener('android:back',function() {
			Ti.App.fireEvent ('gleb_closeChat');
		});

		//AL ARRANCAR EL CHAT, SE LE PEDIRÁ AL SERVIDOR EL JSON CON LA LISTA DE CONTACTOS CON LOS QUE PODREMOS CHATEAR.
		require('chat/comunication').getChatCandidates();

		//TODO - DESCOMENTAR ESTA LINEA     });

};

Ti.App.addEventListener ('chat_winChats_show', function(){
	Ti.API.info("CHAT - chat_winChats_show");
	viewNewGroup.hide();
	viewSettings.hide();
	viewChats.show();	
	mainWin.add(viewChats);		
	mainWin.add(require('chat/header')._get());
});

Ti.App.addEventListener ('chat_winNewGroup_show', function(){
	Ti.API.info("CHAT - chat_winNewGroup_show");	
	viewSettings.hide();
	viewChats.hide();
	viewNewGroup.show();
	mainWin.add(viewNewGroup);
	mainWin.add(require('chat/header')._get());
});

Ti.App.addEventListener ('chat_winSettings_show', function(){
	Ti.API.info("CHAT - chat_winSettings_show");
	viewChats.hide();
	viewNewGroup.hide();
	viewSettings.show();	
	mainWin.add(viewSettings);	
	mainWin.add(require('chat/header')._get());
});