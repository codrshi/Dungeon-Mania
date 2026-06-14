'use strict';

// === Declare DOM Element Variables ===
const button = $(".button");
const username = $('#username');
const highScore = $('#highScore');
const menuPanel = $('#menu-panel');
const buttonClickAudio = $('#button-click-audio')[0];

$(function () {
    $.get("/index/username-highscore", {}, function (res) {
        username.text(res.username);
        highScore.text(res.highScore);
    });

    menuPanel.css('margin-top', menuPanel.css('margin-left'));
});

button.click(function () {
    switch ($(this).attr("id")) {
        case "simple-button": window.location = '/game?survivalMode=false';
            break;
        case "survival-button": window.location = '/game?survivalMode=true';
            break;
        case "stats-button": window.location = '/stats';
            break;
        case "guide-button": window.location = '/guide';
            break;
    }
});

button.on('mousedown', function () {
    buttonClickAudio.currentTime = 0;
    buttonClickAudio.play();
    $(this).css('background-image', 'url(/static/asset/image/button_pressed.png)');
});

button.on('mouseup mouseleave', function () {
    $(this).css('background-image', 'url(/static/asset/image/button.png)');
});
