
function Searcher() {
    this.term = ""; //не undefined потому что пустой input value=""
    this.isExecuted= false;
    this.elementTerm="";
    this.termAsRegExp= //;
    this.elementTermAsRegExp= //;
    
    //источник (массив групп)
    this.source= [];
    //объекты, удовлетворяющие поиску
    this.result=[];
    //элементы объектов, удовлетворяющие поиску (ФИО, телефон...)
    this.elements=[];
    this.RESULT=undefined;
    
    this.searching= new MulticastDelegate();
    this.searched= new MulticastDelegate();
    this.SEARCHChanged= new MulticastDelegate();
}

Searcher.keyMap=[['q','й'],['w','ц'],['e','у'],['r','к'],['t','е'],['y','н'],['u','г'],['i','ш'],['o','щ'],['p','з'],['[','х'],[']','ъ'],['a','ф'],['s','ы'],['d','в'],['f','а'],['g','п'],['h','р'],['j','о'],['k','л'],['l','д'],[';','ж'],['','э'],/*['\\','\\'],*/['z','я'],['x','ч'],['c','с'],['v','м'],['b','и'],['n','т'],['m','ь'],[',','б'],['.','ю'],['/','.']];

Searcher.prototype.getTranslated = function(source) {
    source= source.toLowerCase();
    var result="";
    for(var i=0; i< source.length; i++){
        var eachSourceLetter= source.charAt(i);
        var eachResultLetter= source.charAt(i);
        for(var EACH_KEY_MAP_PAIR in Searcher.keyMap){
            var eachKeyMapPair= Searcher.keyMap[EACH_KEY_MAP_PAIR];
            if (eachSourceLetter== eachKeyMapPair[0]){
                eachResultLetter= eachKeyMapPair[1];
                break;
            }
            else if (eachSourceLetter== eachKeyMapPair[1]){
                eachResultLetter= eachKeyMapPair[0];
                break;
            }
        }
        result+= eachResultLetter;
    }
    
    return result;
}
/**
 * term="" приравнивается к "сбросить поиск" и поэтому поиск ничего не находит
 * @param {type} term
 * @returns {unresolved}
 */
Searcher.prototype.search = function(term, isPrevMode) {
    this.searching.call(this, false);
    
    var this2= this;

    if (term== this.term && this.isExecuted){
        if (!this.result.length){
            //на нет и суда нет/ никуда не двигаем
        }
        else {
            //сбросить .currentResult
            this.getCurrentResult().setSearchMode(TorObject.SearchMode.Result);
            
            if (isPrevMode){
                if (this.RESULT==0) {
                    this.RESULT= this.result.length - 1;
                }
                else {
                    this.RESULT--;
                }
            }
            else{
                if (this.RESULT < this.result.length - 1) {
                    this.RESULT++;
                }
                else {
                    this.RESULT = 0;
                }
            }
        }
    }
    else{
        this.term= term;
        this.isExecuted= true;
        
        if (term==""){
            this.termAsRegExp=/сбросить поиск/;
        }
        else{
            this.termAsRegExp= new RegExp(RegExp.quote(term)+"|"+RegExp.quote(this.getTranslated(term)), "i");
        }
        this.result = [];
        this.elements= [];
        
//        for (var EACH_TOP_DEPARTMENT in document.topDepartments) {
//            var eachTopDepartment = document.topDepartments[EACH_TOP_DEPARTMENT];
//            this.searchInDepartment(eachTopDepartment);
//        }
        
        $.each(this.source, function(i, eachSource){
            this2.searchIn(eachSource);
        })

        if (this.result.length){
            this.RESULT=0;
        }
        else{
            this.RESULT= undefined;
        }
    }
    
    if (this.RESULT!== undefined){
        this.getCurrentResult().expandParents();
        this.getCurrentResult().setSearchMode(TorObject.SearchMode.CurrentResult);
    }
    
    this.SEARCHChanged.call(this, null);
    this.searched.call(this, null);
    return this.result;
}

/**
 * Соответствует ли терму subject
 * и возвращает элемент если соответствует
 * 
 * @param {type} element
 * @returns {undefined}
 */
Searcher.prototype.match = function(subject) {
    if (subject instanceof ClientGroup){
        if (subject.groupName.match(this.termAsRegExp)){
            return subject.groupName;
        }
    }
    else if (subject instanceof Subscriber){
        if (subject.fullName.match(this.termAsRegExp)){
            return subject.fullName;
        }
        else if (subject.physicalAddress.match(this.termAsRegExp)){
            return subject.physicalAddress;
        }
        else if (subject.phoneNumber.match(this.termAsRegExp)){
            return subject.phoneNumber;
        }
    }
}

Searcher.prototype.searchIn = function(source) {
    var element= undefined;
    if (element= this.match(source)) {
        this.result.push(source);
        source.setSearchMode(TorObject.SearchMode.Result);
        
        if ($.inArray(element, this.elements) == -1) {
            this.elements.push(element);
        }
    }
    else{
        source.setSearchMode(TorObject.SearchMode.None);
    }
    
    for (var EACH_CHILD in source.children) {
        var eachChild = source.children[EACH_CHILD];
        this.searchIn(eachChild);
    }
}

Searcher.prototype.getCurrentResult = function() {
    return this.result[this.RESULT];
}

/**
 * Установливает терм без поиска. Происходит сброс если старый терм не совпадает с новым
 * 
 * @param {type} value
 * @returns {undefined}
 */
Searcher.prototype.setTerm = function(value) {
    if (this.term != value){
        this.search("");
        this.term= value;
        this.isExecuted= false;
    }
    
    this.searched.call(this, null);
}