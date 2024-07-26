async function deserializeAsasignableData(assignable){
    const splittedText = decodeURI(await fetch("assignables/" + assignable + ".dat").then((response) => response.text())).replaceAll('\r','').split('\n').map(t => replaceTags(t))

    var currentAction = null;
    var summary = []
    var winCond = []
    var ability = []
    var tips = []
    var configurations = []
    var abstract = {
        nameJp : '未設定',
        nameEn : 'Undefined',
        color : '#FFFFFF',
        blurb : 'Undefined'
    }

    var lastTag = ''
    function deserializeAbstract(text){
        if(text.startsWith('$')){
            lastTag = text.substring(1);
        }else{
            switch(lastTag){
            case 'nameJp':
                abstract.nameJp = text;
                break;
            case 'nameEn':
                abstract.nameEn = text;
                break;
            case 'color':
                abstract.color = '#' + text.split(',').map((numStr) => Number(numStr).toString(16)).join();
                break;
            case 'blurb':
                abstract.blurb = text;
                break;
            }
        }
    }

    var currentWithImageTemp = null;
    function deserializeAbility(text){
        if(text.startsWith('$')){
            lastTag = text.substring(1);
            currentWithImageTemp = null;
        }else{
            switch(lastTag){
            case 'withImage':
                if(currentWithImageTemp == null){
                    currentWithImageTemp = [text,[]]
                    ability.push(currentWithImageTemp)
                }else{
                    currentWithImageTemp[1].push(text)
                }
                break;
            }
        }
    }

    var currentTipsTemp = null;
    function deserializeTips(text){
        if(text.startsWith('$')){
            lastTag = text.substring(1);
            currentTipsTemp = null;
        }else{
            switch(lastTag){
            default:
                if(currentTipsTemp == null){
                    currentTipsTemp = []
                    tips.push(currentTipsTemp)
                }
                currentTipsTemp.push(text)
            }
        }
    }


    for(var text of splittedText){
        console.log(text)
        if(text.length < 2 || text.startsWith('##'))continue;

        if(text.startsWith('*')){
            switch(text.substring(1)){
            case 'abstract':
                currentAction = deserializeAbstract;
                break;
            case 'ability':
                currentAction = deserializeAbility
                break;
            case 'tips':
                currentAction = deserializeTips
                break;
            case 'configurations':
                currentAction = (text) => configurations.push(text.split('|',2))
                break;
            case 'summary':
                currentAction = (text) => summary.push(text)
                break;
            case 'winCond':
                currentAction = (text) => winCond.push(text);
                break;
            default:
                currentAction = null;
            }
        }else if(currentAction != null){
            currentAction(text);
        }
    }

    return {
        summary : summary.join('<br>'),
        configurations : configurations,
        abstract : abstract,
        abilities : ability,
        tips: tips,
        winCond: winCond
    }
}

var thenables = []
var lastTempNum = 0;
function getAssignableContent(assignableData){
    const head = '<h1 class="display-3">' + assignableData.abstract.nameJp + '</h1><p class="lead">' + assignableData.abstract.nameEn + '</p><br><br>' + assignableData.summary;
    const configurations = assignableData.configurations.length == 0 ? '' : '<h2>オプション</h2><br><table class="table table-hover"><thead><tr><th scope="col">オプション名</th><th scope="col">概要</th></tr></thead><tbody>' + assignableData.configurations.map(config => '<tr><th scope="row">' + config[0] + '</th><td>' + config[1] + '</td></tr>').join('') + '</tbody></table>'
    const abilities = assignableData.abilities.length == 0 ? '' : '<h2>能力</h2>' + assignableData.abilities.map((ability) => {
        if(ability.length == 2){
            lastTempNum++;
            const copiedTempNum = lastTempNum;
            thenables.push(()=>{
                fetch(ability[0]).then((response) => response.blob()).then((blob)=>{
                    const url = (window.URL || window.webkitURL).createObjectURL(blob)
                    document.querySelector('#temp' + copiedTempNum).innerHTML = '<img src="'+url+'" class="img-fluid">';
                })
            })
            return '<div class="container"><div class="row"><div class="col-3 text-center"><p id=temp' + lastTempNum + '></p>' + '</div><div class="col-9 text-left">' + ability[1].join('<br>') + '</div></div></div>';
        }
    }).join('')
    const winCond = assignableData.winCond.length == 0 ? '' : '<h2>勝利条件</h2><br>' + assignableData.winCond.join('<br>');
    const tips = assignableData.tips.length == 0 ? '' : ('<h2>Tips</h2><br>' + assignableData.tips.map(tip => '・' + tip.join('<br>')).join(''));
    return [head, winCond, abilities, configurations, tips].filter(t => t.length > 0).join('<br><br><br>') + '<br><br><br>'
}

var queryStr = window.location.search;
if(queryStr.length > 1) {
    queryStr = queryStr.slice(1);
}

deserializeAsasignableData(queryStr).then((data)=>{
    document.getElementById('assignable').innerHTML = getAssignableContent(data)
    for(var thenable of thenables) thenable();
});
