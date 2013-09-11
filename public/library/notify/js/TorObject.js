function TorObject(){
    this.id=undefined;
    this.parent = null;
    this.children=[];
    this.expandedMode= TorObject.ExpandedMode.Collapsed;
    this.serchMode= TorObject.SearchMode.None;
    this.selectMode= TorObject.SelectMode.None;

    this.expandedModeChanged= new MulticastDelegate();
    this.searchModeChanged= new MulticastDelegate();
    this.selectModeChanged= new MulticastDelegate();
}

TorObject.SearchMode= {
    None: "none",
    Result: "result",
    CurrentResult: "current result"
};

TorObject.ExpandedMode={
    Collapsed: "-collapsed",
    Expanded: "+expanded"
}


TorObject.SelectMode={
    None: "none",
    Selected: "selected",
    PartialSelected: "partial selected"
}

/**
 * Вызывает колбэк для себя и каждого вложенного объекта
 * 
 * @param {type} callback
 * @returns {undefined}
 */
TorObject.prototype.each= function(callback){
    callback(this);
    
    for (var EACH_CHILD in this.children) {
        this.children[EACH_CHILD].each(callback);
    }
}

/**
 * Вызывает колбэк для каждого вложенного объекта
 * 
 * @param {type} callback
 * @returns {undefined}
 */
TorObject.prototype.eachChild= function(callback){
    for (var EACH_CHILD in this.children) {
        this.children[EACH_CHILD].each(callback);
    }
}

TorObject.prototype.setSelectMode= function(value){
    if (this.selectMode!= value){
        this.selectMode= value;
        this.selectModeChanged.call(this);
    }
}

TorObject.prototype.setSearchMode= function(value){
    if (this.searchMode!= value){
        this.searchMode= value;
        this.searchModeChanged.call(this, null);
    }
}

TorObject.prototype.setCheckMode= function(value){
    if (this.checkMode!= value){
        this.checkMode= value;
        this.checkModeChanged.call(this, null);
    }
}

TorObject.prototype.setExpandedMode= function(value){
    if (this.expandedMode==value){
        return;
    }
    this.expandedMode= value;
    
    switch(value){
        case TorObject.ExpandedMode.Collapsed:
            break;
        case TorObject.ExpandedMode.Expanded:
            break;
    }

    this.expandedModeChanged.call(this);
}

TorObject.prototype.expandParents= function(){
    for(var currentParent= this.parent; currentParent; currentParent= currentParent.parent){
        currentParent.setExpandedMode(TorObject.ExpandedMode.Expanded);
    }
}