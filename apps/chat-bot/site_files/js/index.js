function sendMessage() {
    alert('message sended')
}


function loadMessages() {

    if (busy) {
        return;
    }

    if (typeof (Mustache) == 'undefined') {
        return;
    }

    if (busy) return;
    busy = true;
    $('.messages-loading').remove();
    $('#messages').append('<p class="messages-loading"> <img src="/images/loading.gif"> </p>');

    busy = true;

    site.postData({
        url: '/api/chat-messages/all',
        method: 'POST',
        data: {}
    }, function (res) {

        if (res.done && res.list.length == 0) {
            busy = true;
        } else {
            busy = false;
        }


        if (!res.done || res.list.length == 0) return;

        let messages = res.list;

        var rendered = '';
        var message_template = $('#message-template').html();

        Mustache.parse(message_template);

        for (var i = 0; i < messages.length; i++) {
            try {
                var post = messages[i];

                rendered += Mustache.render(post_template, post);

            } catch (error) {

            }
        }

        $('#messages').append(rendered);

        busy = false;
        $('.messages-loading').remove();

    });


};

document.querySelector('.input').focus()
loadMessages();