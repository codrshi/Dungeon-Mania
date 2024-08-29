button=$(".button");
username=$('#username');
highScore=$('#highScore');

$(function(){
    $.get("/index/eph-config", {}, function (res) {
        const eph_config=res.eph_config;

        username.text(eph_config.username);
        highScore.text(eph_config.highScore);
    });
});

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