window.ondragstart = function() { return false; } 


self.port.on("update-success", function(){
    $('#nitc_submit').removeClass('submit').addClass('success');
    $('#nitc_submit').html('SAVED');

    setTimeout(function(){
        $('#nitc_submit').removeClass('success').addClass('submit');
        $('#nitc_submit').html('Save Credentials');
    },1000);
});

var last_error = self.options.last_error;

self.port.on("last_error", function (data){
    last_error = data;
    
    if(last_error == "true"){
        $('#nitc_message').html("The last attempt failed, probably due to an invalid username/password.");
    }
});


$(function() {
    $('#nitc_username').val(self.options.username);
    $('#nitc_password').val(self.options.password);

    if(last_error == "true"){
        $('#nitc_message').html("The last attempt failed, probably due to an invalid username/password.");
    }

    function saveChanges() {
        var username = $('#nitc_username').val(),
            password = $('#nitc_password').val();

        self.port.emit("update-data", {username: username, password: password });
    }

    $('#nitc_submit').on('click', function(event) {
        event.preventDefault();
        saveChanges();

        return false;
    });

    $('#nitc_authenticate').on('click', function(event) {
        event.preventDefault();
        saveChanges();

        self.port.emit("override");
    });
});