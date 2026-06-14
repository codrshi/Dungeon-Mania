'use strict';

// === Declare DOM Element Variables ===
const button = $(".button");
const backButton = $("#back-button");
const guidePanelContent = $("#guide-panel-content");
const buttonClickAudio = $('#button-click-audio')[0];

// The guide is a long scrollable read; arrow keys nudge ~1 line and PageUp/
// PageDown jump roughly one screenful, mirroring native browser scrolling.
const SCROLL_STEP_PX = 60;
const PAGE_SCROLL_STEP_PX = 360;

$(function () {
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
        if (document.activeElement === backButton[0]) {
            // Drive the full press sequence (audio + pressed image) instead of
            // letting the browser fire a bare click.
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
        guidePanelContent.scrollTop(guidePanelContent.scrollTop() + SCROLL_STEP_PX);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        guidePanelContent.scrollTop(guidePanelContent.scrollTop() - SCROLL_STEP_PX);
    } else if (e.key === 'PageDown') {
        e.preventDefault();
        guidePanelContent.scrollTop(guidePanelContent.scrollTop() + PAGE_SCROLL_STEP_PX);
    } else if (e.key === 'PageUp') {
        e.preventDefault();
        guidePanelContent.scrollTop(guidePanelContent.scrollTop() - PAGE_SCROLL_STEP_PX);
    } else if (e.key === 'Home') {
        e.preventDefault();
        guidePanelContent.scrollTop(0);
    } else if (e.key === 'End') {
        e.preventDefault();
        guidePanelContent.scrollTop(guidePanelContent[0].scrollHeight);
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
