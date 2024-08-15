import Paint2D from "./Paint2D.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (canvas === null) throw new Error("Canvas element not found in document.");

const FRAME_RATE = 20;
const FRAME_INTERVAL = 1000 / FRAME_RATE;

const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 800;
const COLUMNS = 100;
const ROWS = 100;
const CELL_SIZE = CANVAS_HEIGHT / ROWS;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// CONWAY'S GAME OF LIFE
// Any live cell with fewer than two live neighbours dies.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies.
// Any dead cell with exactly three live neighbours becomes a live cell.

/* ************************* */

const paint = Paint2D(canvas);

const createCells = (number: number) => {
  const cells = [];

  for (let i = 0; i < COLUMNS; i++) {
    const row = [];
    for (let j = 0; j < ROWS; j++) {
      row.push(number);
    }
    cells.push(row);
  }

  return cells;
};

let prevGeneration = createCells(0);

// Math.random will generate a number between 0 and 1,
// and Math.round will turn either to 0 or 1.
// This random offset will weigh the chance to more or less cells.
// This should be between 0 (50% of 0 and 1s) and 0.5 (0% chance of 1s)
const RANDOM_OFFSET = 0.25;

for (let i = 0; i < COLUMNS; i++) {
  for (let j = 0; j < ROWS; j++) {
    prevGeneration[i][j] = Math.round(Math.random() - RANDOM_OFFSET);
  }
}

const drawCells = (generation: number[][]) => {
  for (let x = 0; x < COLUMNS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (generation[x][y]) {
        const sizeX = CANVAS_WIDTH / COLUMNS;
        const sizeY = CANVAS_WIDTH / ROWS;
        paint.rectangle(sizeX * x, sizeY * y, CELL_SIZE, CELL_SIZE, {
          fillStyle: "white",
        });
      }
    }
  }
};

const countNeighbours = (generation: number[][], x: number, y: number) => {
  let neighbours = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const col = (x + i + COLUMNS) % COLUMNS;
      const row = (y + j + COLUMNS) % COLUMNS;
      neighbours += generation[col][row];
    }
  }
  return neighbours;
};

paint.render(() => {
  paint.background("black");
  paint.grid(COLUMNS, ROWS, { color: "#ffffff36", width: 1.5 });
  drawCells(prevGeneration);
});

let prevTimestamp = 0;

const runGame = (timestamp: number) => {
  if (timestamp - prevTimestamp < FRAME_INTERVAL) {
    requestAnimationFrame(runGame);
    return;
  }

  prevTimestamp = timestamp;

  let nextGeneration = createCells(0);
  for (let x = 0; x < COLUMNS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const state = prevGeneration[x][y];

      let neighbours = countNeighbours(prevGeneration, x, y);

      if (state == 0 && neighbours == 3) {
        nextGeneration[x][y] = 1;
      } else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
        nextGeneration[x][y] = 0;
      } else {
        nextGeneration[x][y] = state;
      }
    }
  }

  prevGeneration = nextGeneration;

  paint.render(() => {
    paint.background("black");
    paint.grid(COLUMNS, ROWS, { color: "#ffffff36", width: 1.5 });
    drawCells(nextGeneration);
  });

  requestAnimationFrame(runGame);
};

const startButton = document.getElementById(
  "start-button"
) as HTMLButtonElement;
if (startButton === null) {
  throw new Error("Button could not be found in document.");
}

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  requestAnimationFrame((time) => runGame(time));
});
