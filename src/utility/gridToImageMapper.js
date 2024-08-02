export function mapGrid(grid){
    const imageGrid=[...grid];

    imageGrid.forEach((row, i) => {
        row.forEach((value, j) => {
          imageGrid[i][j] = "/static/asset/image/"+value.getId()+".png";
        });
      });

    return imageGrid;
}