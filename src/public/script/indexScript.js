
button=$(".button");

button.click(function(){
    switch($(this).attr("id")){
        case "simple-button":   window.location='/game?survivalMode=false';
                                break;
        case "survival-button": window.location='/game?survivalMode=true';
                                break;
        case "stats-button": break;
        case "guide-button": break;
    }
});