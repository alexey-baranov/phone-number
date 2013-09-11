/**
 * Отправляет сообщение по очереди всем клиентам и 
 * после каждого отправления вызывает колбэк
 * 
 * Автоматически обрывает предыдущую очередь перед выполнением следующей
 * 
 * @returns {Sender}
 */

function Sender(){
    this.subscribers= [];
    this.SUBSCRIBER= undefined;
    this.message=undefined;
    this.ajax= null;
//    this.state= Sender.State.Ready;
    //только очередь, которая получает этот ключ отправляет СМС-ки
    //присвоение нового случайного key автоматически останавливает все предыдущие очереди, т.е. равносильно abort();
    this.key= undefined;
    
    this.sended= new MulticastDelegate();
}

Sender.State={
    Ready: "ready",
    Sending: "sending",
    Aborting: "aborting"
}


/**
 * отправляет сообщение всем клиентам по очереди
 * Автоматически обрывает предыдущую очередь
 * 
 * @param {type} subscribers
 * @param {type} message
 * @returns {undefined}
 */
Sender.prototype.send= function(subscribers, message){
    this.subscribers= subscribers;
    this.message= message;
    this.key= new Date().getTime();
    
    this.SUBSCRIBER=0;
    this.sendSafe(this.key);
}

/**
 * отправляет сообщение всем после текущего клиента синхронизированно
 * @returns {undefined}
 */
Sender.prototype.sendSafe= function(key){
    if (this.key== key && this.SUBSCRIBER < this.subscribers.length){
        var subscriber= this.subscribers[this.SUBSCRIBER];
        this.ajax= $.ajax({
            context: this,
            url: "http://217.114.191.210/sms2/public/REST/1.0/index.php",
//            data:{method:'send', phoneNumber: subscriber.phoneNumber, message:this.message},
            data:{message:this.message},
            dataType: "xml",
/*            
            success: function(data, textStatus, jqXHR){
                this.successed.call(this, {SUBSCRIBER: this.SUBSCRIBER, subscriber:subscriber, textStatus: textStatus});
            },
            error: function(jqXHR, textStatus, errorThrown){
                this.errored.call(this, {SUBSCRIBER: this.SUBSCRIBER, subscriber:subscriber, textStatus: textStatus});
            },
            */
            complete: function(jqXHR, textStatus){
                this.sended.call(this, {SUBSCRIBER: this.SUBSCRIBER, subscriber:subscriber, textStatus: textStatus});
                this.SUBSCRIBER++;
                this.sendSafe(key);
            }
        });
    }
}

Sender.prototype.abort= function(){
    this.key= undefined;
}