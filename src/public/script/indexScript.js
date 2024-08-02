
button=$(".button");

button.click(function(){
    switch(button.attr("id")){
        case "simple-button":   window.location='/game';
                                break;
        case "survival-button": break;
        case "stats-button": break;
        case "guide-button": break;
    }
});