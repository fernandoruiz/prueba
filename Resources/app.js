//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Espacio de nombres global
/////////////////////////////////////////////////////////////////////////////////////////////////////////	

(function() {		
//ventana principal
mainWin = null;

/*
mainWin.addEventListener('postlayout',function(){	
	Ti.App.fireEvent('gleb_closeActivityIndicator');
});
*/


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Background Window inicial
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Titanium.UI.setBackgroundImage('images/background.png');	

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBAL UTILS - _p , textoClaro, machaca ...
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.App.glebUtils = require("utils/utils");

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// SETUP Inicial - Poniendo valores buenos en algunas properties
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.include('config/initial.js');

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// SETUP Inicial
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
//Cargamos los eventos de los botones
require("events/events");
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// MODULO MONITOR BATERIA
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.API.info("GLEB - Añadiendo modulo de bateria");
require('plugins/battery').init();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// MODULO GPS
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.API.info("GLEB - Añadiendo modulo de geolocalización");
require('plugins/gps').init();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// MODULO BRUJULA
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.API.info("GLEB - Añadiendo modulo de orientacion");
require('plugins/heading').init();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// COLA HTTP
/////////////////////////////////////////////////////////////////////////////////////////////////////////   
require ('plugins/colaHTTP').init();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// globalListeners
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
Ti.include('listeners/globalListeners.js');

Ti.App.addEventListener('gleb_registerClient_error', function(){	
	require("plugins/pushACS").pushACS();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Evento que se ejecuta cdo se finaliza el Wizard 
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
	var f_gleb_wizard_end = function(){
		Ti.App.fireEvent('gleb_closeActivityIndicator');
		Ti.App.fireEvent("gleb_openActivityIndicator",{"text":"Cargando ..."});	
		//si aun no tenemos usuario pushACS
		//if (Ti.App.Properties.hasProperty('pushUser') && Ti.App.Properties.hasProperty('pushUserPassword') && Ti.App.Properties.hasProperty('pushUserId'))
		if (!Ti.App.Properties.getBool('registered')) {
				require("plugins/pushACS").pushACS();
				return
		}				
		var ts = Math.round((new Date()).getTime());
		var date = new Date(ts);
		var mes = date.getMonth();		
		var dia = date.getDate();				
		var prev = Ti.App.Properties.getString('lastUIDownload');		
		var dateP = new Date(parseInt(prev));
		var mesP = dateP.getMonth();		
		var diaP = dateP.getDate();		
		Ti.API.info("GLEB - Fecha actual:"+dia+" - "+mes+" Fecha previa:"+diaP+" - "+mesP);		
		
		
		if (false) {
		//if (mes==mesP && dia==diaP) {			
			// Si existe fichero local
	    	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'ui');						
	    	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "gui.json");
	    	if (f.exists()){
	    		Ti.App.fireEvent("gleb_getMenus_local");
	    	}	
			else require("plugins/glebAPI").getMenus();	
		}
		else require("plugins/glebAPI").getMenus();		
	}	
	Ti.App.addEventListener('gleb_wizard_end', f_gleb_wizard_end);	
/////////////////////////////////////////////////////////////////////////////////////////////////////////	


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Evento que se ejecuta cdo ocurre un error descargando los Menus
/////////////////////////////////////////////////////////////////////////////////////////////////////////	
var gleb_getMenus_error_f = function(obj){
		Ti.App.fireEvent('gleb_closeActivityIndicator');
		Ti.API.info('GLEB - Error descargando Main Window');
		var alertDialog = Titanium.UI.createAlertDialog({
			title: 'Error',
			message:'Ha ocurrido un error descargando los datos gleb. Compruebe que tiene cobertura de red. ¿Desea reintentarlo?. Si pulsa NO se intentaran cargar los últimos datos disponibles',
		    buttonNames: ['SI','NO']
		});				
		alertDialog.addEventListener('click', function(e)
				{
				if (e.index==0) {
				        Ti.App.fireEvent("gleb_wizard_end");			    	
				}
				else {
				   		Ti.App.fireEvent('gleb_openActivityIndicator',{"text":"Cargando ..."});
						Ti.API.debug('GLEB - PATH= '+Titanium.Filesystem.applicationDataDirectory);
				    	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'ui');						
				    	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "gui.json");
				    	if (f.exists()){
				    		Ti.App.fireEvent("gleb_getMenus_local");
				    	}
				    	else {				    		
							var alertDialog2 = Titanium.UI.createAlertDialog({
								title: 'Error',
								message:'No existen datos previos, reintente la descarga de nuevo.',
							    buttonNames: ['REINTENTAR']
							});				
							alertDialog2.addEventListener('click', function(e)
									{
									if (e.index==0) {	
										Ti.App.addEventListener('gleb_wizard_end');
									}
							});
							alertDialog2.show();			    		
				    	}
				    }
			});	
			alertDialog.show();		
	}

	Ti.App.addEventListener('gleb_getMenus_error', gleb_getMenus_error_f);
/////////////////////////////////////////////////////////////////////////////////////////////////////////	


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Evento que se ejecuta cdo se detecta una copia actualizada del UI en local
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var gleb_getMenus_local_f= function(obj){
		//Ti.App.fireEvent('gleb_closeActivityIndicator');
		Ti.API.info('GLEB - Se ha detectado un UI reciente');
		/*
		var alertDialog = Titanium.UI.createAlertDialog({
			title: 'AVISO',
			message:'Se ha detectado una BD local reciente ¿desea usarla en vez de descargarla de nuevo?',
		    buttonNames: ['Usarla','Descargarla']
		});				
		alertDialog.addEventListener('click', function(e)
				{
				if (!e.index==0) {	
					Ti.App.fireEvent("gleb_openActivityIndicator",{"text":"Cargando ..."});
					require("plugins/glebAPI").getMenus();	
				}
				else {
				   		Ti.App.fireEvent('gleb_openActivityIndicator',{"text":"Leyendo ..."});
						Ti.API.debug('GLEB - PATH= '+Titanium.Filesystem.applicationDataDirectory);
				    	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'ui');						
				    	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "gui.json");
				    	if (f.exists()){
				    		var content = f.read();
				    		var json = JSON.parse(content.text); //UI JSON
		    				Ti.API.info('GLEB - UI Local: '+content.text);				    		
				    		Ti.App.fireEvent("gleb_getMenus_done",json);
				    	}
				    }
			});	
			alertDialog.show();		
			*/
		//Ti.App.fireEvent('gleb_openActivityIndicator',{"text":"Leyendo ..."});
		Ti.API.debug('GLEB - PATH= '+Titanium.Filesystem.applicationDataDirectory);
    	var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'ui');						
    	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "gui.json");
    	if (f.exists()){
    		var content = f.read();
    		var json = JSON.parse(content.text); //UI JSON
			//Ti.API.info('GLEB - UI Local: '+content.text);				    		
    		Ti.App.fireEvent("gleb_getMenus_done",json);
    	}	
			
	}

	Ti.App.addEventListener('gleb_getMenus_local', gleb_getMenus_local_f);
/////////////////////////////////////////////////////////////////////////////////////////////////////////	


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Evento que se ejecuta cdo ya se ha cargado el UI local o de internet
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var gleb_getMenus_done_f = function(){	
		Ti.API.info('GLEB - getMenus Callback');
        var uiDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'ui');						
    	var f = Titanium.Filesystem.getFile(uiDir.resolve(), "gui.json");
    	if (f.exists()){
    		var content = f.read();
    		var json = JSON.parse(content.text); //UI JSON
    	}
		Ti.API.info('GLEB - Abriendo main window');
		if(json.windows[0]){
			if(typeof(mainWin) != "undefined" && mainWin !== null) {
				mainWin.close();
				mainWin = null;
			}
			mainWin = new require('ui/mainWindow')._get(json.windows[0]);
			require('modules/NavigationController').open(mainWin);			
			Ti.API.info('GLEB - Abriendo main window');
			//////// REMOVEMOS TODOS LOS LISTENERS INCESARIOS UNA VEZ ARRANCADA LA APP		
			if (f_gleb_wizard_end != null){	
				Ti.App.removeEventListener('gleb_wizard_end', f_gleb_wizard_end);	
				f_gleb_wizard_end = null;
		    }
			if (gleb_getMenus_error_f != null){
				Ti.App.removeEventListener('gleb_getMenus_error', gleb_getMenus_error_f);
				gleb_getMenus_error_f = null;
			}
			if (gleb_getMenus_local_f != null){
				Ti.App.removeEventListener('gleb_getMenus_local', gleb_getMenus_local_f);
				gleb_getMenus_local_f = null;
			}			
			
			//Ti.App.removeEventListener ('gleb_getMenus_done', gleb_getMenus_done_f);
			//gleb_getMenus_done_f = null;					
		}	
	}	
Ti.App.addEventListener('gleb_getMenus_done', gleb_getMenus_done_f);
/////////////////////////////////////////////////////////////////////////////////////////////////////////

		
		
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// ARRANQUE DE LA APP
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lo primero es pillar los endpoints
Ti.API.info("GLEB - Comprobando si hay endpoints nuevos");
require("plugins/glebAPI").getGlebURLs();

var gleb_init_app_f = function(){  
    Ti.API.info("GLEB - Checking wizard status:"+Ti.App.Properties.getString("WIZARD"));
    // PARA ACTIVAR EL WIZARD SIEMPRE   	
    if (Ti.App.Properties.getString("WIZARD") != "done") {	
    	Ti.API.info("GLEB - Iniciando Wizard");	
    	require('ui/wizard')._set();
        require('ui/wizard')._open();
    } 
    else{
    	Ti.App.fireEvent("gleb_wizard_end");
    }
}
Ti.App.addEventListener('gleb_init_app', gleb_init_app_f);

 
/////////////////////////////////////////////////////////////////////////////////////////////////////////
	
})();
