//INCLUDES
Ti.include(Titanium.Filesystem.resourcesDirectory+"chat/utils.js");

var headerChat;
var buttonChats;
var buttonNewGroup;
var buttonSettings;

exports._get = function(){
	return headerChat;
};

exports._set = function(){
	
	var tamanoTexto = 12;
	
	headerChat = Titanium.UI.createView({
	backgroundColor:'#3C3C3C',
	top:_p(0),
	height:_p(60),
	left:_p(0),
	width:_p(320),
	})
	
	buttonChats = Titanium.UI.createButton({
		top:_p(5),
		backgroundImage:Titanium.Filesystem.resourcesDirectory+'images/chatsSelect.png',
		color:'white',
		font:{fontSize:_p(tamanoTexto),fontWeight:'normal', fontFamily:'Arial'},
		bottom:_p(0),
		left:_p(20),
		width:_p(80),
		title:'Chats',
		verticalAlign:Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	 
	buttonNewGroup = Titanium.UI.createButton({
		top:_p(5),
		backgroundImage:Titanium.Filesystem.resourcesDirectory+'images/addGroup.png',
		color:'white',
		font:{fontSize:_p(tamanoTexto),fontWeight:'normal', fontFamily:'Arial'},
		bottom:_p(0),
		left:_p(120),
		width:_p(80),
		title:'Nuevo Grupo',
		verticalAlign:Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	 
	buttonSettings = Titanium.UI.createButton({
		top:_p(5),
		backgroundImage:Titanium.Filesystem.resourcesDirectory+'images/ajustes.png',
		color:'white',
		font:{fontSize:_p(tamanoTexto),fontWeight:'normal', fontFamily:'Arial'},
		bottom:_p(0),
		left:_p(220),
		width:_p(80),
		title:'Ajustes',
		verticalAlign:Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	
	buttonChats.addEventListener('click',function(){
		Ti.API.info("CHAT - PINCHAMOS EL BOTON CHAT DEL HEADER");
		buttonChats.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/chatsSelect.png';
		buttonNewGroup.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/addGroup.png';
		buttonSettings.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/ajustes.png';
		Ti.App.fireEvent('chat_winChats_show');
	});
	
	buttonNewGroup.addEventListener('click',function(){
		Ti.API.info("CHAT - PINCHAMOS EL BOTON NEW GROUP DEL HEADER");
		buttonNewGroup.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/addGroupSelect.png';
		buttonChats.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/chats.png';
		buttonSettings.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/ajustes.png';
		Ti.App.fireEvent('chat_winNewGroup_show');
	});
	
	buttonSettings.addEventListener('click',function(){
		Ti.API.info("CHAT - PINCHAMOS EL BOTON SETTINGS DEL HEADER");
		buttonSettings.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/ajustesSelect.png';
		buttonChats.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/chats.png';
		buttonNewGroup.backgroundImage = Titanium.Filesystem.resourcesDirectory+'images/addGroup.png';
		Ti.App.fireEvent('chat_winSettings_show');
	});  
	
	headerChat.add(buttonChats);
	headerChat.add(buttonNewGroup);
	headerChat.add(buttonSettings); 
};
