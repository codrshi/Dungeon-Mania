// === Declare DOM Element Variables ===
button = $(".button");
guidePanelContent = $("#guide-panel-content");
buttonClickAudio = $('#button-click-audio')[0];

button.on('mousedown', function () {
    buttonClickAudio.currentTime = 0;
    buttonClickAudio.play();
    $(this).css('background-image', 'url(/static/asset/image/button_pressed.png)');
});

button.on('mouseup mouseleave', function () {
    $(this).css('background-image', 'url(/static/asset/image/button.png)');
});

button.click(function () {
    if ($(this).attr("id") === "back-button")
        window.location = '/';
});