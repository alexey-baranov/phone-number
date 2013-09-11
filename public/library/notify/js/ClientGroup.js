function ClientGroup(){
    this.groupName= undefined;
    this.children= []; //иначе будет общий чилдрен на все группы!
    
    //делегаты нужно переопределять, чтобы они не были общими для всех экземпляров
    this.expandedModeChanged= new MulticastDelegate();
    this.searchModeChanged= new MulticastDelegate();
    this.selectModeChanged= new MulticastDelegate();
    this.selectCountChanged= new MulticastDelegate();
}


ClientGroup.prototype= new TorObject();


ClientGroup.prototype.getSelectCount= function(sender){
    var result=0;
    
    this.eachChild(function(subscriber){
        if (subscriber.selectMode==TorObject.SelectMode.Selected){
            result++;
        }
    });
    return result;
}

ClientGroup.prototype.subscriber_selectModeChanged= function(sender){
    var selectedChildCount= this.getSelectCount();
    
    if (!selectedChildCount){
        this.setSelectMode(TorObject.SelectMode.None);
    }
    else if (selectedChildCount== this.children.length){
        this.setSelectMode(TorObject.SelectMode.Selected);
    }
    else{
        this.setSelectMode(TorObject.SelectMode.PartialSelected);
    }
    this.selectCountChanged.call(this, null);
}

ClientGroup.prototype.setSelectMode= function(value){
    if (this.selectMode!= value){
        if (value== TorObject.SelectMode.Selected){
            this.eachChild(function(subscriber){
                subscriber.setSelectMode(TorObject.SelectMode.Selected);
            })
        }
        else if (value== TorObject.SelectMode.None){
            this.eachChild(function(subscriber){
                subscriber.setSelectMode(TorObject.SelectMode.None);
            })
        }
        
        TorObject.prototype.setSelectMode.call(this, value);
    } 
}

/**
 * 
 * @param {type} model
 * @param {ClientGroupView | jQuery} parent
 * @returns {ClientGroupView}
 */
function ClientGroupView(model, parent){
    this.parent= parent;
    this.$= null;
    this.$groupNameView= null;
    this.$contentView= null; //таблица с персоналом

    this.setModel(model);
}

ClientGroupView.prototype.initialize= function(){
    var this2= this;
    
    this.$= $("#clientGroup"+this.model.id);
    this.$selectView= $("#clientGroup"+this.model.id+"_select");
    this.$groupNameView= $("#clientGroup"+this.model.id+"_groupName");
    this.$countView= $("#clientGroup"+this.model.id+"_count");
    this.$contentView= $("#clientGroup"+this.model.id+"_content");
    
    this.$groupNameView.click(function(event){
        if (this2.model.expandedMode==TorObject.ExpandedMode.Collapsed){
            this2.model.setExpandedMode(TorObject.ExpandedMode.Expanded);
        }
        else{
            this2.model.setExpandedMode(TorObject.ExpandedMode.Collapsed);
        }
        event.stopPropagation();
    });
    
    this.$selectView.click(function(event){
        if (this2.model.selectMode==TorObject.SelectMode.Selected){
            this2.model.setSelectMode(TorObject.SelectMode.None);
        }
        else{
            this2.model.setSelectMode(TorObject.SelectMode.Selected);
        }
        setTimeout(function(){
            this2.$selectView.prop("checked", this2.model.selectMode== TorObject.SelectMode.Selected);
        })
    });
}

ClientGroupView.prototype.setModel= function(model){
    this.model= model;
    this.model.expandedModeChanged.add(this, this.model_expandedModeChanged);
    this.model.searchModeChanged.add(this, this.model_searchModeChanged);
    this.model.selectModeChanged.add(this, this.model_selectModeChanged);
    this.model.selectCountChanged.add(this, this.model_selectCountChanged);
    this.initialize();
}

ClientGroupView.prototype.model_expandedModeChanged= function(sender, arg){
    if (this.model.expandedMode== TorObject.ExpandedMode.Collapsed){
        this.$contentView.css("display","none");
    }
    else{
        this.$contentView.css("display","block");
    }
}
ClientGroupView.prototype.model_selectCountChanged= function(sender, arg){
    this.$countView.html("("+this.model.getSelectCount()+" из "+this.model.children.length+")");
}

ClientGroupView.prototype.model_selectModeChanged= function(sender, arg){
    if (this.model.selectMode== TorObject.SelectMode.Selected){
        this.$selectView.prop("checked",true);
        this.$groupNameView.addClass("selected");
    }
    else{
        this.$selectView.prop("checked",false);
        this.$groupNameView.removeClass("selected");
    }
}

ClientGroupView.prototype.model_searchModeChanged= function(sender, arg){
    switch(this.model.searchMode){
        case TorObject.SearchMode.None:
            this.$groupNameView.removeClass("search_result search_result-current");
            break;
        case TorObject.SearchMode.Result:
            this.$groupNameView.addClass("search_result").removeClass("search_result-current");
            break;
        case TorObject.SearchMode.CurrentResult:
            this.$groupNameView.addClass("search_result search_result-current");
            break;            
    }
}