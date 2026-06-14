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
const screenLogSubPanelText = $('#screen-log-sub-panel-text');
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

// === Logic to execute when page loads ===
$(function () {
  const auraMicroPanelHeadingHeight = auraMicroPanel.children('.aura-micro-panel-heading').css('height');
  const auraMicroPanelImageHeight = auraMicroPanel.children('.aura-micro-panel-image').css('height');

  //setting the location of aura-overlay based on the position of aura-micro-panel-heading
  auraMicroPanel.children('.aura-overlay').css('top', parseFloat(auraMicroPanelHeadingHeight));
  auraMicroPanel.children('.aura-overlay').css('height', parseFloat(auraMicroPanelImageHeight));

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
    populateScreenLogs(eph_config.screenLogs);
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
  startDiceRollAudio();

  $.get("/game/roll-dice", {}, function (res) {
    diceNumber = res.diceNumber;
    const validNextPositions = res.validNextPositions;

    rollDiceImage.attr('src', '/static/asset/image/roll_dice_animation.gif');

    setTimeout(function () {
      stopDiceRollAudio();
      screenLogSubPanelText.text("- you got " + String(diceNumber) + ".");
      rollDiceImage.attr('src', '/static/asset/image/dice_face_' + diceNumber + '.png');

      //if no available position to move, then reset dice number and allow player to re-roll the dice
      if (validNextPositions.length == 0) {
        cell.children().removeClass("disabled-cell-image");
        diceNumber = -1;
      }

      cell.each(function () {
        if ($(this).children('.cell-image').attr("src").includes("knight"))
          knightCell = $(this);

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

    }, DICE_ROLL_ANIMATION_DURATION_MS);
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
  const newKnightCell = $(this);
  const newKnightCoordinate = [
    Number($(this).data("x")),
    Number($(this).data("y")),
  ];

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

      score.text(eph_config.score);
      updateAura(eph_config.aura);
      populateScreenLogs(eph_config.screenLogs);
    },

    error: function (xhr) {
      displayEndGamePanel("crashed");
    }
  });
});

//open the pause dialog box when player clicks on pause button
pauseButton.click(function () {
  modalDialog.show();
  modalDialogOverlay.show();
});

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
      $(this).children('.cell-image').attr("src", "/static/asset/image/" + newCardLocationsMap.get(key).cardId + ".png");
      $(this).children('.cell-attribute').text(newCardLocationsMap.get(key).cardAttribute);
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

  modalDialog.show();
  modalDialogOverlay.show();
}

function populateScreenLogs(screenLogs) {
  screenLogSubPanelText.text('');

  screenLogs.forEach(function (screenLog) {
    screenLogSubPanelText.append(screenLog + '<br>');
  })
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