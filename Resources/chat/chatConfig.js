// Fichero de configuración

//Endpoints
var protocol = "http";
var host = "thinetic.com";
var port = "80";

//URL's
getChatCandidates_url = protocol +"://"+host+":"+port+"/gleb/chat/getChatCandidates.php";

sendChatMessage_url = protocol +"://"+host+":"+port+"/gleb/sendChatMessages.php";

getChatMessages_url = protocol +"://"+host+":"+port+"/gleb/getChatMessages.php";

createChatGroup_url = protocol +"://"+host+":"+port+"/gleb/createChatGroup.php";

getChatGroups_url = protocol +"://"+host+":"+port+"/gleb/getChatGroups.php";

deleteChatGroup_url = protocol +"://"+host+":"+port+"/gleb/deleteChatGroup.php";
