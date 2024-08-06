rollDiceButton = $("#roll-dice-button");
score = $("#score");
cell = $(".cell");
weaponSubPanel = $("#weapon-sub-panel");
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

        if(eph_config.shuffledGrid!=0)
          renderGrid(eph_config.shuffledGrid);

        score.text(eph_config.score);
      },
    });
  }
  diceNumber=-1
});

function renderGrid(grid){
    cell.each(function () {
      const x=Number($(this).data("x")),y=Number($(this).data("y"));
      let currentCell=$(this);
      currentCell.children('.cell-image').attr("src",grid[x][y].imageIcon.imageSource);
      currentCell.children('.cell-attribute').text(grid[x][y].imageIcon.attribute);
    });
  }
