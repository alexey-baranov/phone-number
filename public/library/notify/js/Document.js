RegExp.quote = function(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

function searcher_searched(sender, arg) {
    if (sender.result.length) {
        var viewportHeight = $(window).height(); // Viewport Height
        var scrollTop = $(window).scrollTop(); // Scroll Top
        
        var y;
        if (sender.getCurrentResult() instanceof ClientGroup){
            y = $("#clientGroup" + sender.getCurrentResult().id).offset().top;
        }
        if (sender.getCurrentResult() instanceof Subscriber){
            y = $("#subscriber" + sender.getCurrentResult().id).offset().top;
        }

        //наверху
        if (y < scrollTop + 150) {
            $('html, body').animate({scrollTop: y - viewportHeight + (viewportHeight - 150) / 3}, 250);
        }
        //внизу
        else if (scrollTop + viewportHeight - 100 < y) {
            $('html, body').animate({scrollTop: y - 150 - (viewportHeight - 150) / 4}, 250);
        }
    }
}

function sender_sended(sender, arg) {
    console.debug(sender, arg);
    $("<tr><td>" + arg.subscriber.fullName + "</td><td>" + arg.textStatus + "</td></tr>").appendTo(document.$sendingLogData);
    document.$sendingProgress.progressbar({value: arg.SUBSCRIBER + 1});

    if (sender.subscribers.length == arg.SUBSCRIBER + 1) {
        console.debug("adding close button");
        document.$sending.dialog("option", "buttons", [document.sendingCloseButton]);
    }
}


document.sendingCancelButton = {
    text: "Отмена",
    click: function() {
        document.sender.abort();
        document.$sending.dialog("option", "buttons", [document.sendingCloseButton]);
    }};
document.sendingCloseButton = {
    text: "Закрыть",
    click: function() {
        $(this).dialog('close');
    }
};

function ready() {
    document.sender = new Sender();
    document.sender.sended.set(document, sender_sended);

    document.searcher = new Searcher();
    document.searcher.source= document.clientGroups;
    document.searcher.searched.add(document, searcher_searched);
    
    document.searcherView = new SearcherView(document.searcher);
    
    document.$messageView = $("#p_bottom_message")
            .keydown(function(event) {
        if (event.which== 13 && event.ctrlKey) {
            document.$smsView.click();
        }
    });
    document.$smsView = $("#p_bottom_sms")
            .button()
            .click(function() {
        var subscribers = [];
        $.each(document.clientGroups, function(EACH_CLIENT_GROUP, eachClientGroup) {
            $.each(eachClientGroup.children, function(i, eachChild) {
                if (eachChild.selectMode == TorObject.SelectMode.Selected) {
                    subscribers.push(eachChild);
                }
            })
        })

        document.$sending.parent().css({position: "fixed"}).end().dialog('open');

        document.$sendingProgress.progressbar({
            value: 0,
            max: subscribers.length
        });

        document.sender.send(subscribers, document.$messageView.val());
    });

    document.$sending = $("#p_sending")
            .dialog({
        autoOpen: false,
        closeOnEscape: true,
        closeText: "Закрыть",
        width: 800,
        resizable: true,
        title: "Отправка SMS",
        open: function() {
            document.$sendingLogData.html("");
            document.$sending.dialog("option", "buttons", [document.sendingCancelButton]);
        }
    });
    document.$sendingProgress = $("#p_sending_progress");
    document.$sendingLogData = $("#p_sending_log_data");


    $(document).keydown(function(event) {
//        console.log(JSON.stringify(event));
        switch (event.which) {
            case 9:
                break;
            default:
                document.searcherView.$termView.focus();
        }
    });

    $("#p_loading").hide(0);
}