rollDiceButton = $("#roll-dice-button");
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

diceNumber = -1;

$(function() {
  const auraMicroPanelHeadingHeight = auraMicroPanel.children('.aura-micro-panel-heading').css('height');
  const auraMicroPanelImageHeight = auraMicroPanel.children('.aura-micro-panel-image').css('height');
  
  auraMicroPanel.children('.aura-overlay').css('top', parseFloat(auraMicroPanelHeadingHeight ));
  auraMicroPanel.children('.aura-overlay').css('height', parseFloat(auraMicroPanelImageHeight));

  $.get("/game/eph-config", {}, function (res) {
    const eph_config=res.eph_config;

    username.text(eph_config.username);
    score.text(eph_config.score);

    if(eph_config.knightWeapon!=null){
      weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/"+eph_config.knightWeapon.weapon.id+".png");
      weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.weapon.damage);
    }

    renderActivePoisons(eph_config.activePoisons);
    updateAura(eph_config.aura);
    checkIfStatusChanged(eph_config.currentGameStatus);
  });
});

rollDiceButton.click(function () {

  if(diceNumber!=-1)
    return;

  cell.children('.cell-image').addClass("disabled-cell-image");

  $.get("/game/roll-dice", {}, function (res) {
    diceNumber = res.diceNumber;
    const validNextPositions=res.validNextPositions;

    $("#dice-number").text("you got " + String(diceNumber));

    if(validNextPositions.length==0){
      cell.children('.cell-image').removeClass("disabled-cell-image");
      diceNumber=-1;
    }

    cell.each(function () {
      if ($(this).children('.cell-image').attr("src").includes("knight")) 
        knightCell = $(this);

      validNextPositions.forEach((validNextPosition) => {
        if (
          validNextPosition.coordinate.x === $(this).data("x") &&
          validNextPosition.coordinate.y === $(this).data("y")
        ) {
          $(this).children('.cell-image').removeClass("disabled-cell-image");
        }
      });
    });
  });
});

cell.on("click", function () {
  if (!$(this).children('.cell-image').hasClass("disabled-cell-image") && diceNumber!=-1) {
    cell.children('.cell-image').removeClass("disabled-cell-image");
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
        const prevPosCardId=res.prevPosCardId;
        const prevPosNewAttribute=res.prevPosNewAttribute;
        const eph_config=res.eph_config;

        knightCell.children('.cell-image').attr("src","/static/asset/image/" + prevPosCardId + ".png");
        knightCell.children('.cell-attribute').text(prevPosNewAttribute);        

        if(eph_config.activeEnema!=null)
          newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight_enema.png");
        else
          newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight.png");
        newKnightCell.children('.cell-attribute').text(eph_config.knightHealth);
        
        checkIfStatusChanged(eph_config.currentGameStatus);

        if(eph_config.knightWeapon!=null){
          weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/"+eph_config.knightWeapon.weapon.id+".png");
          weaponMicroPanel.children(".weapon-micro-panel-attribute").text(eph_config.knightWeapon.weapon.damage);
        }
        else{
          weaponMicroPanel.children(".weapon-micro-panel-image").attr("src", "/static/asset/image/placeholder.png");
          weaponMicroPanel.children(".weapon-micro-panel-attribute").text("");
        }

        if(eph_config.newGrid.length!=0)
          renderNewGrid(eph_config.newGrid);

        if(eph_config.newCardLocations.length!=0)
          renderNewCards(eph_config.newCardLocations);

        renderActivePoisons(eph_config.activePoisons);

        score.text(eph_config.score);
        updateAura(eph_config.aura);
      },
    });
  }
  diceNumber=-1
});

pauseButton.click(function(){
  modalDialog.show();
  modalDialogOverlay.show();
});

modalDialogOverlay.click(function(){
  $.get("/game/eph-config", {}, function (res) {
    if(res.eph_config.currentGameStatus==='ongoing'){
      modalDialog.hide();
      modalDialogOverlay.hide();
    }
  });
});

modalButtons.children('#replay-button').click(function(){
  $.post({
    url: "/game/exit",
    contentType: "application/json",
    dataType: "json",
  });

  window.location=window.location;
});

modalButtons.children('#exit-button').click(function(){
  $.post({
    url: "/game/exit",
    contentType: "application/json",
    dataType: "json",
  });

  window.location = '/';
});

function renderNewGrid(grid){
    cell.each(function () {
      const x=Number($(this).data("x")),y=Number($(this).data("y"));
      $(this).children('.cell-image').attr("src",grid[x][y].imageIcon.imageSource);
      $(this).children('.cell-attribute').text(grid[x][y].imageIcon.attribute);
    });
  }

function renderNewCards(newCardLocations){

  const newCardLocationsMap=new Map();
  newCardLocations.forEach(newCardLocation => {
    newCardLocationsMap.set(newCardLocation[0],newCardLocation.slice(1));
  });

  cell.each(function () {
    const key=$(this).data("x")+" "+$(this).data("y");
    if(newCardLocationsMap.has(key)){
      $(this).children('.cell-image').attr("src","/static/asset/image/"+newCardLocationsMap.get(key)[0]+".png");
      $(this).children('.cell-attribute').text(newCardLocationsMap.get(key)[1]);
    }
  });
}

function renderActivePoisons(activePoisons){

  if(activePoisons.length===0){
    activePanelMicroPanel.children('.active-poison-micro-panel-image').addClass("disabled-cell-image");
    activePanelMicroPanel.children('.active-poison-micro-panel-attribute').text("");
    return;
  }

  const activePoisonDamage = activePoisons.reduce((totalDamage,activePoisonDao) =>{
                              return totalDamage+activePoisonDao.activePoison.damage;
                            },0);

  activePanelMicroPanel.children('.active-poison-micro-panel-image').removeClass("disabled-cell-image");
  activePanelMicroPanel.children('.active-poison-micro-panel-attribute').text(activePoisonDamage);                        
}

function updateAura(auraAmount){
  const auraMicroPanelImageHeight = auraMicroPanel.children('.aura-micro-panel-image').css('height'); 
  const updatedAuraHeight = parseFloat(auraMicroPanelImageHeight) * (1-(auraAmount/1000));

  auraMicroPanel.children('.aura-overlay').css('height',updatedAuraHeight);
  auraMicroPanel.children('.aura-micro-panel-attribute').text(auraAmount);
}

function checkIfStatusChanged(gameStatus){
  if(gameStatus==='ongoing')
    return;
  
  let modalHeading='',modalBody='';

  if(gameStatus==='won'){
    modalHeading="GAME WON!";
    modalBody="you won with a score of "+score.text();
  }
  else{
    modalHeading="GAME OVER!";
    modalBody="you lost with a score of "+score.text();
  }

  modalDialog.children('#modal-content').children('#modal-heading').text(modalHeading);
  modalDialog.children('#modal-content').children('#modal-body').text(modalBody);

  modalDialog.show();
  modalDialogOverlay.show();
}