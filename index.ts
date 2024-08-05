const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (canvas === null) throw new Error("Canvas element not found in document.");

const FRAME_RATE = 20;
const FRAME_INTERVAL = 1000 / FRAME_RATE;

const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 800;
const COLUMNS = 100;
const ROWS = 100;
const CELL_HEIGHT = CANVAS_HEIGHT / ROWS;
const CELL_WIDTH = CANVAS_WIDTH / COLUMNS;
const RECT_SIZE = CELL_HEIGHT;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// CONWAY'S GAME OF LIFE
// Any live cell with fewer than two live neighbours dies.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies.
// Any dead cell with exactly three live neighbours becomes a live cell.

/* ************************* */

type CanvasStyle = string | CanvasGradient | CanvasPattern;

type StyleOptions = {
  fillStyle?: CanvasStyle;
  strokeStyle?: CanvasStyle;
};

type LineOptions = {
  color: CanvasStyle;
  width: number;
};

const Paint2D = function (canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("2D Rendering context is not supported.");
  }

  return {
    background: function (style: CanvasStyle) {
      this.rectangle(0, 0, canvas.width, canvas.height, { fillStyle: style });
    },
    withinPath: function (path: () => void) {
      ctx.beginPath();
      path();
      ctx.closePath();
    },
    grid: function (
      columns: number,
      rows: number,
      { color, width }: LineOptions
    ) {
      for (let x = 1; x < columns; x++) {
        const lineLength = (canvas.width / columns) * x;
        this.line(lineLength, 0, lineLength, canvas.height, {
          color,
          width,
        });
      }

      for (let y = 1; y < rows; y++) {
        const lineLength = (canvas.height / rows) * y;
        this.line(0, lineLength, canvas.width, lineLength, {
          color,
          width,
        });
      }
    },
    circle: function (
      x: number,
      y: number,
      radius: number,
      options: StyleOptions
    ) {
      this.withinPath(() => {
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (options.fillStyle) {
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
        } else if (options.strokeStyle) {
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
        } else if (options.fillStyle && options.strokeStyle) {
          console.log("TODO");
        }
      });
    },
    rectangle: function (
      x: number,
      y: number,
      width: number,
      height: number,
      options: StyleOptions
    ) {
      this.withinPath(() => {
        ctx.rect(x, y, width, height);
        if (options.fillStyle) {
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
        } else if (options.strokeStyle) {
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
        } else if (options.fillStyle && options.strokeStyle) {
          console.log("TODO");
        }
      });
    },
    line: function (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      options: LineOptions
    ) {
      this.withinPath(() => {
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.width;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    },
    render: function (draw: () => void) {
      ctx.reset();
      draw();
    },
  };
};
/* ****************************** */

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
        paint.rectangle(sizeX * x, sizeY * y, RECT_SIZE, RECT_SIZE, {
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
