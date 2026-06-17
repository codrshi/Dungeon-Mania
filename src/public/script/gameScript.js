'use strict';

// === Declare DOM Element Variables ===
const rollDiceImage = $(".roll-dice-image");
const pauseButton = $("#pause-button");
const modalDialog = $("#modal-dialog");
const modalDialogOverlay = $("#modal-dialog-overlay");
const username = $('#username');
const modalButtons = $("#modal-buttons");
const score = $("#score");
const cell = $(".cell");
const weaponMicroPanel = $("#weapon-micro-panel");
const activePanelMicroPanel = $("#active-poison-micro-panel");
const auraMicroPanel = $("#aura-micro-panel");
let knightCell = null;
const screenLogStack = $('#screen-log-stack');
const button = $('.button');
const buttonClickAudio = $('#button-click-audio')[0];
const bombExplodeAudio = $('#bomb-explode-audio')[0];
const gameLostAudio = $('#game-lost-audio')[0];
const gameWonAudio = $('#game-won-audio')[0];
const mageAppearsAudio = $('#mage-appears-audio')[0];
const monsterKilledAudio = $('#monster-killed-audio')[0];
const potionDrinkAudio = $('#potion-drink-audio')[0];
const weaponGrabbedAudio = $('#weapon-grabbed-audio')[0];
const manaStoneAudio = $('#mana-stone-audio')[0];
const enigmaElixirAudio = $('#enigma-elixir-audio')[0];
const chaosOrbAudio = $('#chaos-orb-audio')[0];
const doorOpenAudio = $('#door-open-audio')[0];
const doorCloseAudio = $('#door-close-audio')[0];
const rollDiceAudio = $('#roll-dice-audio')[0];
const weaponForgerAudio = $('#weapon-forger-audio')[0];

// === Local Variables Declaration ===
let diceNumber = -1;

// Target wall-clock duration of the dice-roll phase. The roll_dice_animation.gif
// is a longer loop, but we cut to the dice face after this many ms - the GIF
// just plays its first DICE_ROLL_ANIMATION_DURATION_MS worth of frames as
// "spin" feedback.
const DICE_ROLL_ANIMATION_DURATION_MS = 1000;

// Grid is laid out as ROWS x COLUMNS, matching the server (see
// config.game.grid). Hard-coded here because the EJS template doesn't expose
// the values to JS; if the grid ever becomes configurable, surface it via a
// data-attribute on #grid-panel instead.
const GRID_ROWS = 7;
const GRID_COLUMNS = 7;

// Direction keys for movement after a dice roll. The grid uses (x = row, y =
// column) with x growing downward, so "north" decreases x. We accept both
// arrow keys / WASD (familiar to most players) and Q/E/Z/C for diagonals
// (visually arranged around WASD like the corners of a numpad). Server-side
// rules (aura threshold gating diagonals, wall/door blocks, dice validation)
// still apply because we only complete the move if the resolved tile is
// currently enabled.
const DIRECTION_KEYS = {
    'ArrowUp':    [-1,  0], 'w': [-1,  0], 'W': [-1,  0],
    'ArrowDown':  [ 1,  0], 's': [ 1,  0], 'S': [ 1,  0],
    'ArrowLeft':  [ 0, -1], 'a': [ 0, -1], 'A': [ 0, -1],
    'ArrowRight': [ 0,  1], 'd': [ 0,  1], 'D': [ 0,  1],
    'q': [-1, -1], 'Q': [-1, -1],
    'e': [-1,  1], 'E': [-1,  1],
    'z': [ 1, -1], 'Z': [ 1, -1],
    'c': [ 1,  1], 'C': [ 1,  1],
};

// === Logic to execute when page loads ===
$(function () {
  const auraMicroPanelHeadingHeight = auraMicroPanel.children('.aura-micro-panel-heading').css('height');
  const auraMicroPanelImageHeight = auraMicroPanel.children('.aura-micro-panel-image').css('height');

  //setting the location of aura-overlay based on the position of aura-micro-panel-heading
  auraMicroPanel.children('.aura-overlay').css('top', parseFloat(auraMicroPanelHeadingHeight));
  auraMicroPanel.children('.aura-overlay').css('height', parseFloat(auraMicroPanelImageHeight));

  // Start the dice bobbing immediately so the player knows where to click.
  rollDiceImage.addClass('idle');

  $.get("/game/eph-config", {}, function (res) {
    const eph_config = res.eph_config;

    username.text(res.username);
    score.text(eph_config.score);

    if (eph_config.knightWeapon != null) {
      weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/" + eph_config.knightWeapon.id + ".png");
      weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.damage);
    }

    renderActivePoisons(eph_config.activePoisons);
    updateAura(eph_config.aura);
    if (eph_config.currentGameStatus !== "ongoing")
      displayEndGamePanel(eph_config.currentGameStatus);
    setScreenLogs(eph_config.screenLogs);
  });
});

// Notify the server to end the game when the player exits or refreshes the page.
// We use sendBeacon because $.post is cancelled by the browser as soon as
// navigation starts, so the server-side cleanup would otherwise be skipped.
function exitCurrentGame() {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/game/exit');
  } else {
    $.ajax({ url: '/game/exit', type: 'POST', async: false });
  }
}

$(window).on('beforeunload', function () {
  exitCurrentGame();
});

// Start the dice-roll SFX, sped up so it finishes inside the animation window
// instead of being cut off mid-stream. We measure the clip's natural duration
// (available because the <audio> tag has preload="auto") and scale playbackRate
// so the audio ends right around DICE_ROLL_ANIMATION_DURATION_MS. preservesPitch
// keeps it from sounding chipmunk-y.
function startDiceRollAudio() {
  rollDiceAudio.pause();
  rollDiceAudio.currentTime = 0;

  const targetSeconds = DICE_ROLL_ANIMATION_DURATION_MS / 1000;
  const naturalDuration = rollDiceAudio.duration;
  if (Number.isFinite(naturalDuration) && naturalDuration > targetSeconds) {
    rollDiceAudio.playbackRate = naturalDuration / targetSeconds;
  } else {
    rollDiceAudio.playbackRate = 1;
  }
  rollDiceAudio.preservesPitch = true;

  rollDiceAudio.play();
}

function stopDiceRollAudio() {
  rollDiceAudio.pause();
  rollDiceAudio.currentTime = 0;
  rollDiceAudio.playbackRate = 1;
}

//logic to execute when player clicks on dice button
rollDiceImage.on('click', function () {

  if (diceNumber != -1)
    return;

  //diable interaction with all cells
  cell.children().addClass("disabled-cell-image");
  // Clear the previous turn's knight highlight; the correct cell gets
  // re-marked once the server response lands and we re-discover the
  // knight in the grid.
  cell.removeClass('knight-cell');
  // Stop the idle bob while the dice is spinning -- otherwise the bob and
  // the rolling GIF compete for the same translate transform.
  rollDiceImage.removeClass('idle');
  startDiceRollAudio();

  $.get("/game/roll-dice", {}, function (res) {
    diceNumber = res.diceNumber;
    const validNextPositions = res.validNextPositions;

    rollDiceImage.attr('src', '/static/asset/image/roll_dice_animation.gif');

    setTimeout(function () {
      stopDiceRollAudio();
      rollDiceImage.attr('src', '/static/asset/image/dice_face_' + diceNumber + '.png');

      //if no available position to move, then reset dice number and allow player to re-roll the dice
      if (validNextPositions.length == 0) {
        // One entry per roll: the no-moves branch carries the reason
        // inline so the player doesn't see two stack lines for the
        // same dice click.
        appendScreenLogs(["Rolled " + diceNumber + " (no valid moves)."]);
        cell.children().removeClass("disabled-cell-image");
        diceNumber = -1;
        // No legal moves -- back to idle dice bob immediately.
        rollDiceImage.addClass('idle');
      } else {
        appendScreenLogs(["Rolled " + diceNumber + "."]);
      }

      cell.each(function () {
        if ($(this).children('.cell-image').attr("src").includes("knight")) {
          knightCell = $(this);
          // Tag the knight's cell so CSS can un-fade it and draw the
          // distinct blue "you are here" pulse around it during the
          // move-selection phase.
          knightCell.addClass('knight-cell');
        }

        //enable interaction with cell which can be reached by knight card
        validNextPositions.forEach((validNextPosition) => {
          if (
            validNextPosition.x === $(this).data("x") &&
            validNextPosition.y === $(this).data("y")
          ) {
            $(this).children().removeClass("disabled-cell-image");
          }
        });
      });

      // The grid is now in "pick a tile" mode (unless we already rolled
      // back to idle on the no-valid-moves branch above). The CSS uses
      // body.move-selection to apply the gold pulse on legal tiles and
      // the blue pulse on the knight's tile.
      if (validNextPositions.length > 0) {
        $('body').addClass('move-selection');
      }
    }, DICE_ROLL_ANIMATION_DURATION_MS);
  }).fail(function () {
    // Defensive: if /game/roll-dice ever 500s (e.g. server-side state
    // got wedged), we'd otherwise leave the player stranded -- cells
    // are already disabled, diceNumber is still -1, so every re-click
    // would play the SFX and re-fire the same broken request without
    // any visible progress. Restore the board, stop the SFX, and
    // surface the crash modal so the player can Replay out of it.
    stopDiceRollAudio();
    cell.children().removeClass("disabled-cell-image");
    rollDiceImage.attr('src', '/static/asset/image/dice_face_1.png');
    rollDiceImage.addClass('idle');
    diceNumber = -1;
    displayEndGamePanel('crashed');
  });
});

//logic to execute when user clicks on a card after rolling dice
cell.on("click", function () {
  // Misclicks on disabled cells must be no-ops. Previously `diceNumber = -1`
  // ran unconditionally at the end of this handler, so any misclick (on a
  // faded cell, on the knight, between cells) silently consumed the roll and
  // stranded the player until they re-rolled.
  if ($(this).children('.cell-image').hasClass("disabled-cell-image") || diceNumber === -1)
    return;

  // Consume the roll immediately so a fast double-click during the network
  // round-trip can't fire a second /process-move with a stale dice number.
  const consumedDiceNumber = diceNumber;
  diceNumber = -1;

  //remove disabled-cell-image from all cell
  cell.children().removeClass("disabled-cell-image");
  // The roll has been consumed; drop the "pick a tile" state and the dice
  // returns to its idle bob immediately.
  $('body').removeClass('move-selection');
  rollDiceImage.addClass('idle');
  const newKnightCell = $(this);
  const newKnightCoordinate = [
    Number($(this).data("x")),
    Number($(this).data("y")),
  ];

  // Remember the previous score so we can bump the score element when it
  // grows in the success callback.
  const previousScore = Number(score.text()) || 0;

  $.post({
    url: "/game/process-move",
    contentType: "application/json",
    dataType: "json",

    data: JSON.stringify({
      newKnightCoordinate: newKnightCoordinate,
      diceNumber: consumedDiceNumber,
    }),

    success: function (res) {
      const prevPosCardId = res.prevPosCardId;
      const prevPosNewAttribute = res.prevPosNewAttribute;
      const eph_config = res.eph_config;

      playAudioList(eph_config.audioList);

      //spawn a new card at previous location of knight card
      knightCell.children('.cell-image').attr("src", "/static/asset/image/" + prevPosCardId + ".png");
      knightCell.children('.cell-attribute').text(prevPosNewAttribute);

      //update the location of knight card with the position of card clicked by player
      if (eph_config.activeEnigma != null)
        newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight_enigma.png");
      else
        newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight.png");
      newKnightCell.children('.cell-attribute').text(eph_config.knightHealth);

      if (eph_config.currentGameStatus !== "ongoing")
        displayEndGamePanel(eph_config.currentGameStatus);

      if (eph_config.knightWeapon != null) {
        weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/" + eph_config.knightWeapon.id + ".png");
        weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.damage);
      }
      else {
        weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/weapon_placeholder.png");
        weaponMicroPanel.children(".weapon-micro-panel-attribute").text("");
      }

      if (eph_config.newGrid.length != 0)
        renderNewGrid(eph_config.newGrid);

      if (eph_config.newCardLocations.length != 0)
        renderNewCards(eph_config.newCardLocations);

      renderActivePoisons(eph_config.activePoisons);

      // Bump the score plate if the player scored on this move. Toggling
      // the .bump class on then off the next frame lets the keyframe
      // animation replay even when the score goes 0 -> 0 -> 0.
      if (eph_config.score !== previousScore) {
        score.removeClass('bump');
        // Force reflow so the animation restarts on every score change.
        void score[0].offsetWidth;
        score.addClass('bump');
      }
      score.text(eph_config.score);
      updateAura(eph_config.aura);
      appendScreenLogs(eph_config.screenLogs);
    },

    error: function (xhr) {
      displayEndGamePanel("crashed");
    }
  });
});

//open the pause dialog box when player clicks on pause button
pauseButton.click(function () {
  openModal();
});

function openModal() {
  modalDialog.show();
  modalDialogOverlay.show();
  // Re-trigger the CSS pop-in animation every time the modal opens, not
  // just on its first display. Removing the class + bouncing through a
  // requestAnimationFrame before re-adding it is the most reliable
  // cross-browser way to "replay" a CSS animation.
  modalDialog.removeClass('pop-in');
  requestAnimationFrame(function () {
    modalDialog.addClass('pop-in');
  });
  // Move focus into the modal so keyboard users can immediately act on
  // Replay/Exit without first hunting for it via Tab.
  modalButtons.children('#replay-button').focus();
}

//if player clicks outside the pause dialog box, then resume the game if it's in ongoing status.
modalDialogOverlay.click(function () {
  $.get("/game/eph-config", {}, function (res) {
    if (res.eph_config.currentGameStatus === 'ongoing') {
      modalDialog.hide();
      modalDialogOverlay.hide();
    }
  });
});

//if player clicks on replay button, then exit from current game and start a new game by reloading the current page
modalButtons.children('#replay-button').click(function () {
  exitCurrentGame();
  window.location = window.location;
});

//if player clicks on exit button, then exit from current game and load the home page
modalButtons.children('#exit-button').click(function () {
  exitCurrentGame();
  window.location = '/';
});

function renderNewGrid(grid) {
  cell.each(function () {
    const x = Number($(this).data("x")), y = Number($(this).data("y"));
    $(this).children('.cell-image').attr("src", grid[x][y].imageSource);
    $(this).children('.cell-attribute').text(grid[x][y].attribute);
  });
}

function renderNewCards(newCardLocations) {
  const newCardLocationsMap = new Map();
  newCardLocations.forEach(newCardLocation => {
    newCardLocationsMap.set(newCardLocation.coordinate.x + " " + newCardLocation.coordinate.y, { "cardId": newCardLocation.cardId, "cardAttribute": newCardLocation.cardAttribute });
  });

  cell.each(function () {
    const key = $(this).data("x") + " " + $(this).data("y");
    if (newCardLocationsMap.has(key)) {
      const $cell = $(this);
      $cell.children('.cell-image').attr("src", "/static/asset/image/" + newCardLocationsMap.get(key).cardId + ".png");
      $cell.children('.cell-attribute').text(newCardLocationsMap.get(key).cardAttribute);
      // Pop the new card in. Re-add the class on the next frame so the
      // keyframe animation re-runs even when the same cell is rewritten
      // on consecutive turns (e.g. the mage hopping around).
      $cell.removeClass('card-spawned');
      void $cell[0].offsetWidth;
      $cell.addClass('card-spawned');
    }
  });
}

function renderActivePoisons(activePoisons) {

  if (activePoisons.length === 0) {
    activePanelMicroPanel.children('.active-poison-micro-panel-image').addClass("disabled-cell-image");
    activePanelMicroPanel.children('.active-poison-micro-panel-attribute').text("");
    return;
  }

  const activePoisonDamage = activePoisons.reduce((totalDamage, activePoison) => {
    return totalDamage + activePoison.damage;
  }, 0);

  activePanelMicroPanel.children('.active-poison-micro-panel-image').removeClass("disabled-cell-image");
  activePanelMicroPanel.children('.active-poison-micro-panel-attribute').text(activePoisonDamage);
}

function updateAura(auraAmount) {
  const auraMicroPanelImageHeight = auraMicroPanel.children('.aura-micro-panel-image').css('height');
  const updatedAuraHeight = parseFloat(auraMicroPanelImageHeight) * (1 - (auraAmount / 1000));

  auraMicroPanel.children('.aura-overlay').css('height', updatedAuraHeight);
  auraMicroPanel.children('.aura-micro-panel-attribute').text(auraAmount);
}

function displayEndGamePanel(gameStatus) {
  if (gameStatus === 'ongoing')
    return;

  let modalHeading = '', modalBody = '';

  if (gameStatus === 'won') {
    modalHeading = "GAME WON!";
    modalBody = "you won with a score of " + score.text();
  }
  else if (gameStatus === 'lost') {
    modalHeading = "GAME OVER!";
    modalBody = "you lost with a score of " + score.text();
  }
  else {
    modalHeading = "GAME CRASHED!";
    modalBody = "an unexpected error occured";
  }

  modalDialog.children('#modal-content').children('#modal-heading').text(modalHeading);
  modalDialog.children('#modal-content').children('#modal-body').text(modalBody);

  openModal();
}

// === Screen log stack ===================================================
//
// The screen log is an animated, capped stack of recent events. New entries
// are PREPENDED into a column-reverse flex container so they appear at the
// visual BOTTOM and push older entries up. When the entry count exceeds
// MAX_SCREEN_LOG_ENTRIES the visually-topmost (DOM-last) entry fades out
// and is removed. This is the same shape as a chat / console feed and
// keeps a running history across moves -- the server resets its
// screenLogs each move, so accumulation is the front-end's job.

const MAX_SCREEN_LOG_ENTRIES = 8;
// Should match the --transition-smooth duration in theme.css; we wait this
// long before removing the DOM node so the fade-out is visible.
const SCREEN_LOG_LEAVE_MS = 320;

// Classify a message for colour-coding the left accent bar. The patterns
// look at the literal wording rather than relying on the server to send a
// type field -- keeps the server-side touch minimal.
function classifyScreenLog(message) {
  const lower = message.toLowerCase();
  // Gain-side: explicit "+N" delta or any of the helping-verb keywords.
  // Tested BEFORE damage so "Weapon forged (+N damage)." reads as a gain
  // even though it contains the word "damage".
  if (/\+\d/.test(message)
    || /(healed|picked up|stored|activated|forged|new high|opened|maxed|awakened|slain|slew|obtained)/.test(lower)) {
    return 'log-gain';
  }
  if (/-\d+\s*hp|drained|shattered|exhausted|depleted|erupted|detonated|faded|sealed|bit back/.test(lower)) {
    return 'log-damage';
  }
  return 'log-neutral';
}

// Reset the stack and seed it with `messages`. Used on initial page load
// where there's no prior history worth animating out.
function setScreenLogs(messages) {
  screenLogStack.empty();
  appendScreenLogs(messages);
}

// Add `newMessages` to the stack with the slide-up entry animation and
// prune anything that pushes us past the cap.
function appendScreenLogs(newMessages) {
  if (!newMessages || newMessages.length === 0) return;

  newMessages.forEach(function (message) {
    const $entry = $('<div></div>')
      .addClass('screen-log-entry')
      .addClass(classifyScreenLog(message))
      .text(message);

    // column-reverse + prepend = visually appears at the bottom.
    screenLogStack.prepend($entry);

    // Force a reflow so the browser sees the resting state (opacity 0,
    // translated down) before .entering flips it on -- otherwise the
    // transition is collapsed and the slide-in doesn't play.
    void $entry[0].offsetWidth;
    $entry.addClass('entering');
  });

  // Cap the stack. With column-reverse the DOM-last child is visually
  // at the TOP, so anything beyond MAX is the oldest -- fade them out
  // and remove.
  const children = screenLogStack.children();
  for (let i = MAX_SCREEN_LOG_ENTRIES; i < children.length; i++) {
    const $entry = children.eq(i);
    if ($entry.hasClass('leaving')) continue;
    $entry.addClass('leaving');
    setTimeout(function () { $entry.remove(); }, SCREEN_LOG_LEAVE_MS);
  }
}

button.on('mousedown', function () {
  buttonClickAudio.currentTime = 0;
  buttonClickAudio.play();
  $(this).css('background-image', 'url(/static/asset/image/button_pressed.png)');
});

button.on('mouseup mouseleave', function () {
  $(this).css('background-image', 'url(/static/asset/image/button.png)');
});

function playAudio(audio) {
  audio.currentTime = 0;
  audio.play();
}

function playAudioList(audioList) {

  audioList.forEach(audioName => {
    if (audioName.startsWith("weapon_forger") || audioName.endsWith("weapon_forger")) {
      playAudio(weaponForgerAudio);
    }
    else if (audioName.startsWith("weapon")) {
      playAudio(weaponGrabbedAudio);
    }
    else if (audioName.endsWith("mage")) {
      playAudio(mageAppearsAudio);
    }
    else if (audioName.startsWith("monster")) {
      playAudio(monsterKilledAudio);
    }
    else if (audioName.endsWith("bomb")) {
      playAudio(bombExplodeAudio);
    }
    else if (audioName.endsWith("mana_stone")) {
      playAudio(manaStoneAudio);
    }
    else if (audioName.endsWith("enigma_elixir")) {
      playAudio(enigmaElixirAudio);
    }
    else if (audioName.endsWith("chaos_orb")) {
      playAudio(chaosOrbAudio);
    }
    else if (audioName.endsWith("close_door")) {
      playAudio(doorCloseAudio);
    }
    else if (audioName.endsWith("open_door")) {
      playAudio(doorOpenAudio);
    }
    else if (audioName.endsWith("potion")) {
      playAudio(potionDrinkAudio);
    }
    else if (audioName === "won") {
      playAudio(gameWonAudio);
    }
    else if (audioName === "lost") {
      playAudio(gameLostAudio);
    }
  });
}

// === Keyboard Navigation ===

// Synthesise the same press-feedback that mousedown does (audio + pressed
// background image) and then fire the actual click. Used when the player
// activates a button via Enter/Space so the experience matches a real click.
function pressButton($btn) {
  buttonClickAudio.currentTime = 0;
  buttonClickAudio.play();
  $btn.css('background-image', 'url(/static/asset/image/button_pressed.png)');
  setTimeout(function () {
    $btn.css('background-image', 'url(/static/asset/image/button.png)');
  }, 100);
  $btn.trigger('click');
}

// Resolve a movement key into a cell click. We compute the target tile using
// the same `(coord + delta * diceNumber) mod size` wrap that the server uses
// when assembling validNextPositions, then click it only if it's actually
// enabled. That keeps every server-side rule (aura threshold for diagonals,
// walls/doors, dice consumption) authoritative; keyboard input is just a
// different surface on top of the existing click handler.
function moveInDirection(dx, dy) {
  if (knightCell === null || diceNumber === -1) return;

  const kx = Number(knightCell.data('x'));
  const ky = Number(knightCell.data('y'));
  const targetX = (kx + dx * diceNumber + GRID_ROWS) % GRID_ROWS;
  const targetY = (ky + dy * diceNumber + GRID_COLUMNS) % GRID_COLUMNS;

  const targetCell = $('.cell').filter(function () {
    return Number($(this).data('x')) === targetX
      && Number($(this).data('y')) === targetY;
  });

  if (targetCell.length === 0) return;
  if (targetCell.children('.cell-image').hasClass('disabled-cell-image')) return;
  targetCell.trigger('click');
}

function handleModalKeydown(e) {
  const replayBtn = modalButtons.children('#replay-button')[0];
  const exitBtn = modalButtons.children('#exit-button')[0];
  const modalBtns = [replayBtn, exitBtn];
  const activeIdx = modalBtns.indexOf(document.activeElement);

  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = activeIdx <= 0 ? modalBtns.length - 1 : activeIdx - 1;
    modalBtns[next].focus();
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    const next = activeIdx >= modalBtns.length - 1 ? 0 : activeIdx + 1;
    modalBtns[next].focus();
    return;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    // Browser would auto-click on Enter/Space; drive the full press feedback
    // ourselves so the modal buttons feel identical to mouse use.
    if (activeIdx >= 0) {
      e.preventDefault();
      pressButton($(modalBtns[activeIdx]));
    }
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    // Defer to the existing overlay-click handler so the "only resume if
    // game is ongoing" rule stays in one place.
    modalDialogOverlay.trigger('click');
  }
}

$(document).on('keydown', function (e) {
  if (modalDialog.is(':visible')) {
    handleModalKeydown(e);
    return;
  }

  // Roll-dice phase.
  if (diceNumber === -1) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      rollDiceImage.trigger('click');
      return;
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      pressButton(pauseButton);
    }
    return;
  }

  // Movement phase.
  if (Object.prototype.hasOwnProperty.call(DIRECTION_KEYS, e.key)) {
    e.preventDefault();
    const [dx, dy] = DIRECTION_KEYS[e.key];
    moveInDirection(dx, dy);
    return;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    e.preventDefault();
    pressButton(pauseButton);
  }
});
