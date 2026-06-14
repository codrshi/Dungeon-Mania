'use strict';

// === Declare DOM Element Variables ===
const monsterStatsTable = $("#monster-stats-table");
const weaponStatsTable = $("#weapon-stats-table");
const button = $(".button");
const backButton = $("#back-button");
const buttonClickAudio = $("#button-click-audio")[0];
const statsPanelContent = $("#stats-panel-content");

// Vertical scroll step (px) for arrow-key scrolling of the stats panel.
// Sized to roughly one row of stats so each tap of Down feels like a
// meaningful jump without flying past the section.
const SCROLL_STEP_PX = 60;
const PAGE_SCROLL_STEP_PX = 240;

$(function () {
    if (monsterStatsTable.children().eq(7).text().startsWith("-"))
        monsterStatsTable.children().eq(7).text("-");
    if (weaponStatsTable.children().eq(3).text().startsWith("-"))
        weaponStatsTable.children().eq(3).text("-");

    backButton.focus();
});

function pressButton($btn) {
    buttonClickAudio.currentTime = 0;
    buttonClickAudio.play();
    $btn.css('background-image', 'url(/static/asset/image/button_pressed.png)');
    setTimeout(function () {
        $btn.css('background-image', 'url(/static/asset/image/button.png)');
    }, 100);
    $btn.trigger('click');
}

$(document).on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        // Browser would auto-click the focused button, but skip the audio +
        // pressed-image feedback. Drive the full press path ourselves.
        if (document.activeElement === backButton[0]) {
            e.preventDefault();
            pressButton(backButton);
        }
        return;
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        pressButton(backButton);
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        statsPanelContent.scrollTop(statsPanelContent.scrollTop() + SCROLL_STEP_PX);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        statsPanelContent.scrollTop(statsPanelContent.scrollTop() - SCROLL_STEP_PX);
    } else if (e.key === 'PageDown') {
        e.preventDefault();
        statsPanelContent.scrollTop(statsPanelContent.scrollTop() + PAGE_SCROLL_STEP_PX);
    } else if (e.key === 'PageUp') {
        e.preventDefault();
        statsPanelContent.scrollTop(statsPanelContent.scrollTop() - PAGE_SCROLL_STEP_PX);
    } else if (e.key === 'Home') {
        e.preventDefault();
        statsPanelContent.scrollTop(0);
    } else if (e.key === 'End') {
        e.preventDefault();
        statsPanelContent.scrollTop(statsPanelContent[0].scrollHeight);
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

button.click(function () {
    if ($(this).attr("id") === "back-button")
        window.location = '/';
});
