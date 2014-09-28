var stored_data = {
    username : self.options.username,
    password : self.options.password
};

self.port.on("update-credentials", function (data){
    console.log("Recieved update data; username: "+data.username+"; pass: "+data.password);
    stored_data.username = data.username;
    stored_data.password = data.password;

    normal_authenticate();
});

self.port.on("override", function (){
    console.log("Overriding..");
    force_authenticate();
});

var force_authenticate = function(){
    self.port.emit("request-credentials");

    if ($('#ft_un').size() == 0) {
        alert("Please open the authentication page before you use the Authenticate button.");
        return false;
    } else {
        $('#ft_un').val(stored_data.username);
        $('#ft_pd').val(stored_data.password);

        if (stored_data.username != '' && stored_data.password != '')
            $('#ft_un').parents('form').submit();
    }
}

var normal_authenticate = function(){

    if ($('body .oc .ic h1').size() > 0 && $('body .oc .ic h1').html().match('Campus Networking Centre')) {
        if ($('#ft_un').size() > 0) {
            var message = $('body').find('form').find('h2').html();
            var header_message = $('body .oc .ic h1').html();

            if (message.match('failed') || header_message.match('Authentication Failed')) {

                if (sessionStorage.getItem("fail") >= 1) {
                    $('#ft_un').val(stored_data.username);
                    $('#ft_pd').val(stored_data.password);

                    return false;
                }

                var fail = sessionStorage.getItem("fail");

                if (isNaN(parseInt(fail)))
                    fail = 0;
                else
                    fail = parseInt(fail);

                fail++;

                sessionStorage.setItem("fail", fail);

                self.port.emit("last-fail", "yes");
            }

            $('#ft_un').val(stored_data.username);
            $('#ft_pd').val(stored_data.password);

            if (stored_data.username != '' && stored_data.password != '')
                $('#ft_un').parents('form').submit();
        }
    } else if ($('body .oc .ic h1').size() > 0 && $('body .oc .ic h1').html().match('Authentication Keepalive')) {
        var message = $('body').find('form').find('h2').html();

        if (message.match('authentication session active')) {

            self.port.emit("last-fail", "no");

            sessionStorage.setItem("fail", 0);

            if (sessionStorage.getItem("new_window") == "open")
                return false;

            window.open($('body').find('form').find('h2').find('a').prop('href'));
            sessionStorage.setItem("new_window", "open");
        }
    } 
}

$(function() {
    self.port.emit("request-credentials");
});