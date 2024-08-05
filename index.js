var canvas = document.getElementById("canvas");
if (canvas === null)
    throw new Error("Canvas element not found in document.");
var FRAME_RATE = 20;
var FRAME_INTERVAL = 1000 / FRAME_RATE;
var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH = 800;
var COLUMNS = 100;
var ROWS = 100;
var CELL_HEIGHT = CANVAS_HEIGHT / ROWS;
var CELL_WIDTH = CANVAS_WIDTH / COLUMNS;
var RECT_SIZE = CELL_HEIGHT;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
var Paint2D = function (canvas) {
    var ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("2D Rendering context is not supported.");
    }
    return {
        background: function (style) {
            this.rectangle(0, 0, canvas.width, canvas.height, { fillStyle: style });
        },
        withinPath: function (path) {
            ctx.beginPath();
            path();
            ctx.closePath();
        },
        grid: function (columns, rows, _a) {
            var color = _a.color, width = _a.width;
            for (var x = 1; x < columns; x++) {
                var lineLength = (canvas.width / columns) * x;
                this.line(lineLength, 0, lineLength, canvas.height, {
                    color: color,
                    width: width,
                });
            }
            for (var y = 1; y < rows; y++) {
                var lineLength = (canvas.height / rows) * y;
                this.line(0, lineLength, canvas.width, lineLength, {
                    color: color,
                    width: width,
                });
            }
        },
        circle: function (x, y, radius, options) {
            this.withinPath(function () {
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                if (options.fillStyle) {
                    ctx.fillStyle = options.fillStyle;
                    ctx.fill();
                }
                else if (options.strokeStyle) {
                    ctx.strokeStyle = options.strokeStyle;
                    ctx.stroke();
                }
                else if (options.fillStyle && options.strokeStyle) {
                    console.log("TODO");
                }
            });
        },
        rectangle: function (x, y, width, height, options) {
            this.withinPath(function () {
                ctx.rect(x, y, width, height);
                if (options.fillStyle) {
                    ctx.fillStyle = options.fillStyle;
                    ctx.fill();
                }
                else if (options.strokeStyle) {
                    ctx.strokeStyle = options.strokeStyle;
                    ctx.stroke();
                }
                else if (options.fillStyle && options.strokeStyle) {
                    console.log("TODO");
                }
            });
        },
        line: function (x1, y1, x2, y2, options) {
            this.withinPath(function () {
                ctx.strokeStyle = options.color;
                ctx.lineWidth = options.width;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        },
        render: function (draw) {
            ctx.reset();
            draw();
        },
    };
};
/* ****************************** */
var paint = Paint2D(canvas);
var createCells = function (number) {
    var cells = [];
    for (var i = 0; i < COLUMNS; i++) {
        var row = [];
        for (var j = 0; j < ROWS; j++) {
            row.push(number);
        }
        cells.push(row);
    }
    return cells;
};
var prevGeneration = createCells(0);
// Math.random will generate a number between 0 and 1,
// and Math.round will turn either to 0 or 1.
// This random offset will weigh the chance to more or less cells.
// This should be between 0 (50% of 0 and 1s) and 0.5 (0% chance of 1s)
var RANDOM_OFFSET = 0.25;
for (var i = 0; i < COLUMNS; i++) {
    for (var j = 0; j < ROWS; j++) {
        prevGeneration[i][j] = Math.round(Math.random() - RANDOM_OFFSET);
    }
}
var drawCells = function (generation) {
    for (var x = 0; x < COLUMNS; x++) {
        for (var y = 0; y < ROWS; y++) {
            if (generation[x][y]) {
                var sizeX = CANVAS_WIDTH / COLUMNS;
                var sizeY = CANVAS_WIDTH / ROWS;
                paint.rectangle(sizeX * x, sizeY * y, RECT_SIZE, RECT_SIZE, {
                    fillStyle: "white",
                });
            }
        }
    }
};
var countNeighbours = function (generation, x, y) {
    var neighbours = 0;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i === 0 && j === 0)
                continue;
            var col = (x + i + COLUMNS) % COLUMNS;
            var row = (y + j + COLUMNS) % COLUMNS;
            neighbours += generation[col][row];
        }
    }
    return neighbours;
};
paint.render(function () {
    paint.background("black");
    paint.grid(COLUMNS, ROWS, { color: "#ffffff36", width: 1.5 });
    drawCells(prevGeneration);
});
var prevTimestamp = 0;
var runGame = function (timestamp) {
    if (timestamp - prevTimestamp < FRAME_INTERVAL) {
        requestAnimationFrame(runGame);
        return;
    }
    prevTimestamp = timestamp;
    var nextGeneration = createCells(0);
    for (var x = 0; x < COLUMNS; x++) {
        for (var y = 0; y < ROWS; y++) {
            var state = prevGeneration[x][y];
            var neighbours = countNeighbours(prevGeneration, x, y);
            if (state == 0 && neighbours == 3) {
                nextGeneration[x][y] = 1;
            }
            else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
                nextGeneration[x][y] = 0;
            }
            else {
                nextGeneration[x][y] = state;
            }
        }
    }
    prevGeneration = nextGeneration;
    paint.render(function () {
        paint.background("black");
        paint.grid(COLUMNS, ROWS, { color: "#ffffff36", width: 1.5 });
        drawCells(nextGeneration);
    });
    requestAnimationFrame(runGame);
};
var startButton = document.getElementById("start-button");
if (startButton === null) {
    throw new Error("Button could not be found in document.");
}
startButton.addEventListener("click", function () {
    startButton.disabled = true;
    requestAnimationFrame(function (time) { return runGame(time); });
});
