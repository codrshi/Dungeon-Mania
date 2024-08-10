rollDiceButton = $("#roll-dice-button");
score = $("#score");
cell = $(".cell");
weaponSubPanel = $("#weapon-sub-panel");
activePanelMicroPanel = $(".active-poison-micro-panel");
knightCell = null;

diceNumber = -1;

rollDiceButton.click(function () {
  cell.children('.cell-image').addClass("disabled-cell-image");

  $.get("/game/roll-dice", {}, function (res) {
    diceNumber = res.diceNumber;
    const validNextPositions=res.validNextPositions;

    $("#dice-number").text("you got " + String(diceNumber));

    cell.each(function () {
      if ($(this).children('.cell-image').attr("src").endsWith("knight.png")) 
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

        knightCell.children('.cell-image').attr(
          "src",
          "/static/asset/image/" + prevPosCardId + ".png"
        );
        knightCell.children('.cell-attribute').text(prevPosNewAttribute);
        newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight.png");
        newKnightCell.children('.cell-attribute').text(eph_config.knightHealth);
        
        if(eph_config.knightWeapon!=null){
          weaponSubPanel.children(".weapon-sub-panel-image").attr("src", "/static/asset/image/"+eph_config.knightWeapon.weapon.id+".png");
          weaponSubPanel.children(".weapon-sub-panel-attribute").text(eph_config.knightWeapon.weapon.damage);
        }
        else{
          weaponSubPanel.children(".weapon-sub-panel-image").attr("src", "");
          weaponSubPanel.children(".weapon-sub-panel-attribute").text("");
        }

        if(eph_config.shuffledGrid.length!=0)
          renderGrid(eph_config.shuffledGrid);

        if(eph_config.manaStoneRes.length!=0)
          renderManaStoneEffect(eph_config.manaStoneRes);

        renderActivePoisons(eph_config.activePoisons);

        score.text(eph_config.score);
      },
    });
  }
  diceNumber=-1
});

function renderGrid(grid){
    cell.each(function () {
      const x=Number($(this).data("x")),y=Number($(this).data("y"));
      $(this).children('.cell-image').attr("src",grid[x][y].imageIcon.imageSource);
      $(this).children('.cell-attribute').text(grid[x][y].imageIcon.attribute);
    });
  }

function renderManaStoneEffect(manaStoneEffectiveLocations){

  const manaStoneMap=new Map();
  manaStoneEffectiveLocations.forEach(manaStoneEffectiveLocation => {
    manaStoneMap.set(manaStoneEffectiveLocation[0],manaStoneEffectiveLocation.slice(1));
  });

  cell.each(function () {
    const key=$(this).data("x")+" "+$(this).data("y");
    if(manaStoneMap.has(key)){
      $(this).children('.cell-image').attr("src","/static/asset/image/"+manaStoneMap.get(key)[0]+".png");
      $(this).children('.cell-attribute').text(manaStoneMap.get(key)[1]);
    }
  });
}

function renderActivePoisons(activePoisons){

  activePanelMicroPanel.each(function() {
    const position=Number($(this).data("position"));

    if(position<activePoisons.length){
      $(this).children('.active-poison-micro-panel-image').attr("src","/static/asset/image/artifact_poison_potion.png");
      $(this).children('.active-poison-micro-panel-attribute').text(activePoisons[position].activePoison.damage);
    }
    else{
      $(this).children('.active-poison-micro-panel-image').attr("src","");
      $(this).children('.active-poison-micro-panel-attribute').text("");
    }
  });
}