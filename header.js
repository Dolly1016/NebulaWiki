async function getAssignablesMap(){
    const assignables = decodeURI(await fetch("allAssignables.dat").then((response) => response.text())).replaceAll('\r','').split('\n')
    const assignablesMap = new Map();

    var currentArray = []
    for(var text of assignables){
        if(text.length < 2 || text.startsWith('##'))continue;

        if(text.startsWith('*')){
            currentArray = []
            assignablesMap.set(text.substring(1), currentArray)
        }else{
            var splitted = text.split(';')
            if(splitted.length == 2){
                currentArray.push(splitted)
            }
        }
    }

    return assignablesMap;
}

function getAssignablesMenu(assignablesMap){
    tryGetAssignableMenu = function(category, display){
        if(assignablesMap.has(category)){
            const inner = assignablesMap.get(category).map(entry => '<li><a class="dropdown-item" href="assignable.html?' + entry[1] + '">' + replaceTags(entry[0]) + '</a></li>').join('');
            return '<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">' + display + '</a><ul class="dropdown-menu">' + inner + '</ul></li>';
        }
        return '';
    }

    return tryGetAssignableMenu('crewmates', 'クルーメイト役職') + tryGetAssignableMenu('impostors', 'インポスター役職') + tryGetAssignableMenu('neutral', '第三陣営役職') + tryGetAssignableMenu('modifiers', 'モディファイア') + tryGetAssignableMenu('ghostRoles', '幽霊役職')
}

var headerString;
var assignables;
Promise.all([fetch("header.temp").then((response) => response.text()).then((text) => headerString = text), getAssignablesMap().then((result) => assignables = result)])
.then(()=> {
    document.querySelector("#header").innerHTML = headerString.replace('$ROLES$', getAssignablesMenu(assignables));
})