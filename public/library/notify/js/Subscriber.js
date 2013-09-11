function Subscriber() {
    this.fullName = undefined
    this.physicalAddress = undefined;
    this.phoneNumber = undefined;
    this.smsPhoneNumber= undefined;

    //делегаты нужно переопределять, чтобы они не были общими для всех экземпляров
//    this.checkModeChanged= new MulticastDelegate();
    this.searchModeChanged = new MulticastDelegate();
    this.selectModeChanged = new MulticastDelegate();
}
Subscriber.prototype = new TorObject();

//
//Subscriber.prototype.setSelectMode = function(value) {
//    if (this.selectMode != value) {
//        TorObject.prototype.setSelectMode.call(this, value);
//
//        if (value == TorObject.SelectMode.None) {
//            this.parent.setSelectMode(TorObject.SelectMode.PartialSelected);
//        }
//    }
//}

function SubscriberView(model, parent) {
    this.parent = parent;
    this.$ = null;
    this.setModel(model);
}

SubscriberView.prototype.initialize = function() {
    var this2 = this;

    this.$ = $("#subscriber" + this.model.id);

    this.$.click(function(event) {
        if (this2.model.selectMode == TorObject.SelectMode.None) {
            this2.model.setSelectMode(TorObject.SelectMode.Selected);
        }
        else {
            this2.model.setSelectMode(TorObject.SelectMode.None);
        }
        event.stopPropagation()
    })
}

SubscriberView.prototype.setModel = function(model) {
    this.model = model;
    this.model.searchModeChanged.add(this, this.model_searchModeChanged);
    this.model.selectModeChanged.add(this, this.model_selectModeChanged);
    this.initialize();
}

SubscriberView.prototype.model_searchModeChanged = function(sender, arg) {
    switch (this.model.searchMode) {
        case TorObject.SearchMode.None:
            this.$.removeClass("search_result search_result-current");
            break;
        case TorObject.SearchMode.Result:
            this.$.addClass("search_result").removeClass("search_result-current");
            break;
        case TorObject.SearchMode.CurrentResult:
            this.$.addClass("search_result search_result-current");
            break;
    }
}

SubscriberView.prototype.model_selectModeChanged = function(sender, arg) {
    switch (this.model.selectMode) {
        case TorObject.SelectMode.None:
            this.$.removeClass("selected");
            break;
        case TorObject.SelectMode.Selected:
            this.$.addClass("selected");
            break;
    }
}