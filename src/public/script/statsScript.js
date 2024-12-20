// === Declare DOM Element Variables ===
monsterStatsTable = $("#monster-stats-table");
weaponStatsTable = $("#weapon-stats-table");
button = $(".button");
buttonClickAudio = $("#button-click-audio")[0];

$(function () {
    if (monsterStatsTable.children().eq(7).text().startsWith("-"))
        monsterStatsTable.children().eq(7).text("-");
    if (weaponStatsTable.children().eq(3).text().startsWith("-"))
        weaponStatsTable.children().eq(3).text("-");
});

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