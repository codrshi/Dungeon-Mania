'use strict';

// === Declare DOM Element Variables ===
const button = $(".button");
const username = $('#username');
const highScore = $('#highScore');
const menuPanel = $('#menu-panel');
const buttonClickAudio = $('#button-click-audio')[0];

// Buttons live in a 2x2 grid (rows = 2, cols = 2). The DOM order matches:
//   index 0 = simple-button   (row 0, col 0)
//   index 1 = survival-button (row 0, col 1)
//   index 2 = stats-button    (row 1, col 0)
//   index 3 = guide-button    (row 1, col 1)
// We use this layout to translate arrow keys into focus moves with clamping
// at the edges (no wrap, since the menu is small).
const MENU_COLUMNS = 2;
const buttonElements = button.toArray();

$(function () {
    $.get("/index/username-highscore", {}, function (res) {
        username.text(res.username);
        highScore.text(res.highScore);
    });

    menuPanel.css('margin-top', menuPanel.css('margin-left'));

    if (buttonElements.length > 0) {
        buttonElements[0].focus();
    }
});

function navigateMenu(currentIdx, key) {
    if (currentIdx < 0) return 0;

    const row = Math.floor(currentIdx / MENU_COLUMNS);
    const col = currentIdx % MENU_COLUMNS;
    const totalRows = Math.ceil(buttonElements.length / MENU_COLUMNS);

    let nextRow = row, nextCol = col;
    if (key === 'ArrowLeft') nextCol = Math.max(0, col - 1);
    else if (key === 'ArrowRight') nextCol = Math.min(MENU_COLUMNS - 1, col + 1);
    else if (key === 'ArrowUp') nextRow = Math.max(0, row - 1);
    else if (key === 'ArrowDown') nextRow = Math.min(totalRows - 1, row + 1);

    const nextIdx = nextRow * MENU_COLUMNS + nextCol;
    return nextIdx < buttonElements.length ? nextIdx : currentIdx;
}

function pressButton($btn) {
    buttonClickAudio.currentTime = 0;
    buttonClickAudio.play();
    $btn.css('background-image', 'url(/static/asset/image/button_pressed.png)');
    // Schedule the visual release after a tick so the user sees the pressed
    // state even if the click handler synchronously navigates away (browsers
    // typically still paint queued style changes before unload).
    setTimeout(function () {
        $btn.css('background-image', 'url(/static/asset/image/button.png)');
    }, 100);
    $btn.trigger('click');
}

$(document).on('keydown', function (e) {
    const activeIdx = buttonElements.indexOf(document.activeElement);

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'
        || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = navigateMenu(activeIdx, e.key);
        if (nextIdx !== activeIdx) buttonElements[nextIdx].focus();
        return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
        // The browser would synthesise a click on the focused button for
        // Enter/Space, but that bypasses our mousedown handler (so the
        // pressed-state image + click audio never fire). Cancel the default
        // and trigger the full press sequence ourselves.
        if (activeIdx >= 0) {
            e.preventDefault();
            pressButton($(buttonElements[activeIdx]));
        }
    }
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
