var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var ss = require("sdk/simple-storage");

if(typeof(ss.storage.username)==='undefined')
	ss.storage.username = "";

if(typeof(ss.storage.password)==='undefined')
	ss.storage.password = "";

if(typeof(ss.storage.last_error)==='undefined')
	ss.storage.last_error = "false";


var authenticatorUI = require("sdk/panel").Panel({
	  width: 550,
  	height: 480,
  	position: {
  	    top: 0,
  	    right: 20,
  	},
  	contentURL: data.url("authenticate.html"),
  	contentScriptFile: [data.url("jquery.js"),data.url("page.js")],
  	contentScriptOptions: {
  	    username : ss.storage.username,
  	    password : ss.storage.password,
  	    last_error : ss.storage.last_error
  	},
  	contentScriptWhen: "ready"

});

require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "NITC Authenticator",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: showAuthenticator
});

function showAuthenticator(state) {
  console.log("Authenticator Shown");
  authenticatorUI.show();
  authenticatorUI.port.emit("last_error", ss.storage.last_error);
}

authenticatorUI.port.on("update-data", function (data) {
  console.log('Update username: '+data.username+'; password: '+data.password);
  ss.storage.username = data.username;
  ss.storage.password = data.password;

  authenticatorUI.port.emit("update-success");
});

authenticatorUI.port.on("request-credentials", function () {
  var data = {
    username : ss.storage.username,
    password : ss.storage.password,
  };
  console.log("Sending new data.");
  authenticatorUI.port.emit("update-credentials", data);
});

var global_worker;

authenticatorUI.port.on("override", function () {
  console.log("Sending override signal");

  if(typeof(global_worker)=='object')
    global_worker.port.emit("override");
});


function attach_authenticator(){
  pageMod.PageMod({
    include: /http.*/,
    contentScriptFile: [data.url("jquery.js"),data.url("authenticate.js")],
    contentScriptOptions: {
        username : ss.storage.username,
        password : ss.storage.password,
    },
    onAttach: function(worker) {
      console.log("Worker attached.");
      global_worker = worker;

      worker.port.on("request-credentials", function(){
        var data = {
          username : ss.storage.username,
          password : ss.storage.password,
        };
        console.log("Sending new data: username:" +data.username+"; pass:"+data.password);
        worker.port.emit("update-credentials", data);
      });

      worker.port.on("last-fail", function(data){
        console.log("fail status: "+data)
        if(data == "yes"){
          ss.storage.last_error = "true";
        }else{
          ss.storage.last_error = "false";
        }
      });

    }
  });  
}

attach_authenticator();
