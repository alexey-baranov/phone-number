
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function MulticastDelegate(){
    this.delegates=[];
}

MulticastDelegate.prototype.empty= function(){
    this.delegates.length=0;
}

MulticastDelegate.prototype.add= function(context, method){
    for (var EACH_DELEGATE in this.delegates){
        if (this.delegates[EACH_DELEGATE].method== method){
            return;
        }
    }
    this.delegates.push(
        {
            context:context,
            method:method
        }
    );
}

MulticastDelegate.prototype.set= function(context, method){
    this.empty();
    this.add(context, method);
}

MulticastDelegate.prototype.remove= function(method){
    for (var EACH_DELEGATE in this.delegates){
        if (this.delegates[EACH_DELEGATE].method== method){
            delete this.delegates[EACH_DELEGATE];
            return;
        }
    }
}

MulticastDelegate.prototype.call= function(){ 
    for (var EACH_DELEGATE in this.delegates){
        this.delegates[EACH_DELEGATE].method.apply(this.delegates[EACH_DELEGATE].context, arguments);
    }
}