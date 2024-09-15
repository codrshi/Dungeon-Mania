button=$(".button");
username=$('#username');
highScore=$('#highScore');
menuPanel=$('#menu-panel');

$(function(){
    $.get("/index/username-highscore", {}, function (res) {
        username.text(res.username);
        highScore.text(res.highScore);
    });

    menuPanel.css('margin-top',menuPanel.css('margin-left'));
});

button.click(function(){
    switch($(this).attr("id")){
        case "simple-button":   window.location='/game?survivalMode=false';
                                break;
        case "survival-button": window.location='/game?survivalMode=true';
                                break;
        case "stats-button":    window.location='/stats';
                                break;
        case "guide-button": break;
    }
});

button.on('mousedown', function() {
    $(this).css('background-image', 'url(/static/asset/image/button_pressed.png)');
});

button.on('mouseup mouseleave', function() {
    $(this).css('background-image', 'url(/static/asset/image/button.png)');
});