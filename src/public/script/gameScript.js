rollDiceButton = $("#roll-dice-button");
score = $("#score");
cell = $(".cell-image");
knightCell = null;

diceNumber = -1;

rollDiceButton.click(function () {
  cell.addClass("disabled-cell-image");

  $.get("/game/roll-dice", {}, function (resData) {
    diceNumber = resData.diceNumber;
    $("#dice-number").text("you got " + String(resData.diceNumber));

    cell.each(function () {
      if ($(this).attr("src").endsWith("knight.png")) knightCell = $(this);

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

cell.on("click", function () {
  if (!$(this).hasClass("disabled-cell-image")) {
    cell.removeClass("disabled-cell-image");
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
        knightCell.attr(
          "src",
          "/static/asset/image/" + res.prevPosCardId + ".png"
        );
        newKnightCell.attr("src", "/static/asset/image/knight.png");
      },
    });
  }
});
