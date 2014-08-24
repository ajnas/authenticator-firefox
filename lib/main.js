var data = require("sdk/self").data;
// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var text_entry = require("sdk/panel").Panel({
  position:{
  	top:0,
  	right:0,
  },
  width:550,
  height:550,
  contentURL: data.url("authenticate.html"),
//  contentScriptFile: data.url("get-text.js")
});

// Create a button
require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

// Show the panel when the user clicks the button.
function handleClick(state) {
  text_entry.show();
}

// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
text_entry.on("show", function() {
  text_entry.port.emit("show");
});

// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.
// In this implementation we'll just log the text to the console.
text_entry.port.on("text-entered", function (text) {
  console.log(text);
  text_entry.hide();
});

window.ondragstart = function() { return false; } 

$(function() {

    chrome.storage.sync.get(function(item){
        $('#username').val(item.username);
        $('#password').val(item.password);

        if(item.last_error == 'true'){
            $('#message').html("The last attempt failed due to invalid username/password.");
        }
    });

    function saveChanges() {
        var username = $('#username').val(),
            password = $('#password').val();

        chrome.storage.sync.set({
            'username': username,
            'password': password,
        }, function() {
            $('#submit').removeClass('submit').addClass('success');
            $('#submit').html('SAVED');

            setTimeout(function(){
                $('#submit').removeClass('success').addClass('submit');
                $('#submit').html('Save Credentials');
            },1000);
        });
    }


    $('#submit').on('click', function(event) {
        event.preventDefault();
        saveChanges();

        return false;
    });

    $('#authenticate').on('click', function(event) {
        event.preventDefault();
        
        saveChanges();

        chrome.tabs.executeScript(null, {
            file: "jquery.js"
        });

        chrome.tabs.executeScript({
            code: 'sessionStorage.setItem("override", "yes")'
        });

        chrome.tabs.executeScript(null, {
            file: "authenticate.js"
        });
    });
});