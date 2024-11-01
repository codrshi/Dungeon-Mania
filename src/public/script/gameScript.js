// === Declare DOM Element Variables ===
rollDiceImage = $(".roll-dice-image");
pauseButton = $("#pause-button");
modalDialog = $("#modal-dialog");
modalDialogOverlay = $("#modal-dialog-overlay");
username = $('#username')
modalButtons = $("#modal-buttons");
score = $("#score");
cell = $(".cell");
weaponMicroPanel = $("#weapon-micro-panel");
activePanelMicroPanel = $("#active-poison-micro-panel");
auraMicroPanel = $("#aura-micro-panel");
knightCell = null;
screenLogSubPanelText = $('#screen-log-sub-panel-text');
button = $('.button');
buttonClickAudio = $('#button-click-audio')[0];
bombExplodeAudio = $('#bomb-explode-audio')[0];
gameLostAudio = $('#game-lost-audio')[0];
gameWonAudio = $('#game-won-audio')[0];
mageAppearsAudio = $('#mage-appears-audio')[0];
monsterKilledAudio = $('#monster-killed-audio')[0];
potionDrinkAudio = $('#potion-drink-audio')[0];
weaponGrabbedAudio = $('#weapon-grabbed-audio')[0];
manaStoneAudio = $('#mana-stone-audio')[0];
enemaElixirAudio = $('#enema-elixir-audio')[0];
chaosOrbAudio = $('#chaos-orb-audio')[0];
doorOpenAudio = $('#door-open-audio')[0];
doorCloseAudio = $('#door-close-audio')[0];
rollDiceAudio = $('#roll-dice-audio')[0];
weaponForgerAudio = $('#weapon-forger-audio')[0];

// === Local Variables Declaration ===
diceNumber = -1;

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
      weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/" + eph_config.knightWeapon.weapon.id + ".png");
      weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.weapon.damage);
    }

    renderActivePoisons(eph_config.activePoisons);
    updateAura(eph_config.aura);
    if (eph_config.currentGameStatus !== "ongoing")
      displayEndGamePanel(eph_config.currentGameStatus);
    populateScreenLogs(eph_config.screenLogs);
  });
});

// notify the server to end the game when the player exits or refreshes the page.
$(window).on('beforeunload', function () {
  $.post({
    url: "/game/exit",
    contentType: "application/json",
    dataType: "json",
  });
});

//logic to execute when player clicks on dice button
rollDiceImage.on('click', function () {

  if (diceNumber != -1)
    return;

  //diable interaction with all cells
  cell.children().addClass("disabled-cell-image");
  rollDiceAudio.startTime = 0;
  rollDiceAudio.play();

  $.get("/game/roll-dice", {}, function (res) {
    diceNumber = res.diceNumber;
    const validNextPositions = res.validNextPositions;

    rollDiceImage.attr('src', '/static/asset/image/roll_dice_animation.gif');

    setTimeout(function () {
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
            validNextPosition.coordinate.x === $(this).data("x") &&
            validNextPosition.coordinate.y === $(this).data("y")
          ) {
            $(this).children().removeClass("disabled-cell-image");
          }
        });
      });

    }, 3500);
  });
});

//logic to execute when user clicks on a card after rolling dice
cell.on("click", function () {
  if (!$(this).children('.cell-image').hasClass("disabled-cell-image") && diceNumber != -1) {
    //remove disabled-cell-image from all cell
    cell.children().removeClass("disabled-cell-image");
    let newKnightCell = $(this);
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
        diceNumber: diceNumber,
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
        if (eph_config.activeEnema != null)
          newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight_enema.png");
        else
          newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight.png");
        newKnightCell.children('.cell-attribute').text(eph_config.knightHealth);

        if (eph_config.currentGameStatus !== "ongoing")
          displayEndGamePanel(eph_config.currentGameStatus);

        if (eph_config.knightWeapon != null) {
          weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/" + eph_config.knightWeapon.weapon.id + ".png");
          weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.weapon.damage);
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
  }
  diceNumber = -1
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
  $.post({
    url: "/game/exit",
    contentType: "application/json",
    dataType: "json",
  });

  window.location = window.location;
});

//if player clicks on exit button, then exit from current game and load the home page
modalButtons.children('#exit-button').click(function () {
  $.post({
    url: "/game/exit",
    contentType: "application/json",
    dataType: "json",
  });

  window.location = '/';
});

function renderNewGrid(grid) {
  cell.each(function () {
    const x = Number($(this).data("x")), y = Number($(this).data("y"));
    $(this).children('.cell-image').attr("src", grid[x][y].imageIcon.imageSource);
    $(this).children('.cell-attribute').text(grid[x][y].imageIcon.attribute);
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

  const activePoisonDamage = activePoisons.reduce((totalDamage, activePoisonDao) => {
    return totalDamage + activePoisonDao.activePoison.damage;
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
  buttonClickAudio.startTime = 0;
  buttonClickAudio.play();
  $(this).css('background-image', 'url(/static/asset/image/button_pressed.png)');
});

button.on('mouseup mouseleave', function () {
  $(this).css('background-image', 'url(/static/asset/image/button.png)');
});

function playAudioList(audioList) {

  audioList.forEach(audioName => {
    if (audioName.startsWith("weapon")) {
      weaponGrabbedAudio.startTime = 0;
      weaponGrabbedAudio.play();
    }
    else if (audioName.endsWith("mage")) {
      mageAppearsAudio.startTime = 0;
      mageAppearsAudio.play();
    }
    else if (audioName.startsWith("monster")) {
      monsterKilledAudio.startTime = 0;
      monsterKilledAudio.play();
    }
    else if (audioName.endsWith("bomb")) {
      console.log(bombExplodeAudio);
      bombExplodeAudio.startTime = 0;
      bombExplodeAudio.play();
    }
    else if (audioName.endsWith("potion")) {
      console.log(potionDrinkAudio);
      potionDrinkAudio.startTime = 0;
      potionDrinkAudio.play();
    }
    else if (audioName.endsWith("mana_stone")) {
      console.log(manaStoneAudio);
      manaStoneAudio.startTime = 0;
      manaStoneAudio.play();
    }
    else if (audioName.endsWith("weapon_forger")) {
      console.log(weaponForgerAudio);
      weaponForgerAudio.startTime = 0;
      weaponForgerAudio.play();
    }
    else if (audioName.endsWith("enema_elixir")) {
      console.log(enemaElixirAudio);
      enemaElixirAudio.startTime = 0;
      enemaElixirAudio.play();
    }
    else if (audioName.endsWith("chaos_orb")) {
      console.log(chaosOrbAudio);
      chaosOrbAudio.startTime = 0;
      chaosOrbAudio.play();
    }
    else if (audioName.endsWith("close_door")) {
      console.log(doorCloseAudio);
      doorCloseAudio.startTime = 0;
      doorCloseAudio.play();
    }
    else if (audioName.endsWith("open_door")) {
      console.log(doorOpenAudio);
      doorOpenAudio.startTime = 0;
      doorOpenAudio.play();
    }
    else if (audioName === "won") {
      gameWonAudio.startTime = 0;
      gameWonAudio.play();
    }
    else if (audioName === "lost") {
      gameLostAudio.startTime = 0;
      gameLostAudio.play();
    }
  });
}