(function() {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBAL LISTENERS
// Estos se usan cdo se recibe una notificacion PUSH. Pendiente de reubicación y/o utilizacion
/////////////////////////////////////////////////////////////////////////////////////////////////////////


Ti.App.addEventListener ('gleb_message', function(){		
	Ti.API.info("chatGLEB - MESSAGE");
	alert ("NUEVO MENSAJE");
});

Ti.App.addEventListener ('gleb_newMessage', function(){
Ti.API.info("chatGLEB - NEW MESSAGE");
var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_MAIN,
        url : 'app.js',
        flags : Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
    });
    intent.addCategory(Titanium.Android.CATEGORY_LAUNCHER);
 
    // Create the pending intent that will launch our app when selected
    var pending = Ti.Android.createPendingIntent({        
        intent : intent,
        flags : Ti.Android.FLAG_UPDATE_CURRENT
    }); 
 	// Create the notification
    var notification = Ti.Android.createNotification({
        contentIntent : pending,
        contentTitle : 'GLEB',
        contentText : 'new Chat arrived',
        tickerText : 'Marikita',
        when : new Date().getTime(),
        icon : Ti.App.Android.R.drawable.appicon,
        flags : Titanium.Android.ACTION_DEFAULT | Titanium.Android.FLAG_AUTO_CANCEL | Titanium.Android.FLAG_SHOW_LIGHTS
    });
    Ti.Android.NotificationManager.notify(1, notification);
    var chat = require  ("chat");
	chat.GlebChat();
});


})();