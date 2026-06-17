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

    // Numeric stat values count up from zero on page load -- a small
    // touch of game-show drama. Only run on values that are *pure*
    // numbers (skip names, dashes, things like "Sword of 8 DMG").
    animateNumericValues();
});

// All stat values live in the right column of each .table grid -- i.e.
// every even-indexed <span>. We count the integer ones up from 0 over
// COUNT_DURATION_MS using a request-animation-frame loop.
const COUNT_DURATION_MS = 700;

function animateNumericValues() {
    $('.table span:nth-child(2n)').each(function () {
        const $el = $(this);
        const raw = $el.text().trim();
        if (!/^-?\d+$/.test(raw)) return;
        const target = parseInt(raw, 10);
        if (target === 0) return;
        countUp($el, target, COUNT_DURATION_MS);
    });
}

function countUp($el, target, durationMs) {
    const start = performance.now();
    function tick(now) {
        const t = Math.min(1, (now - start) / durationMs);
        // ease-out cubic: fast at the start, gentle landing.
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(target * eased);
        $el.text(current);
        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            $el.text(target);
        }
    }
    requestAnimationFrame(tick);
}

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
