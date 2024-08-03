rollDiceButton = $("#roll-dice-button");
score = $("#score");
cellImage = $(".cell-image");
knightCell = null;

diceNumber = -1;

rollDiceButton.click(function () {
  cellImage.addClass("disabled-cell-image");

  $.get("/game/roll-dice", {}, function (resData) {
    diceNumber = resData.diceNumber;
    $("#dice-number").text("you got " + String(resData.diceNumber));

    cellImage.each(function () {
      if ($(this).attr("src").endsWith("knight.png")) 
        knightCell = $(this).parent();

      resData.validNextPositions.forEach((validNextPosition) => {
        if (
          validNextPosition[0] === $(this).data("x") &&
          validNextPosition[1] === $(this).data("y")
        ) {
          $(this).removeClass("disabled-cell-image");
        }
      });
    });
  });
});

cellImage.on("click", function () {
  if (!$(this).hasClass("disabled-cell-image")) {
    cellImage.removeClass("disabled-cell-image");
    let newKnightCell = $(this).parent();
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
        knightCell.children('.cell-image').attr(
          "src",
          "/static/asset/image/" + res.prevPosCardId + ".png"
        );
        knightCell.children('.cell-attribute').text(res.prevPosNewAttribute);
        newKnightCell.children('.cell-image').attr("src", "/static/asset/image/knight.png");
        newKnightCell.children('.cell-attribute').text("");
      },
    });
  }
});
