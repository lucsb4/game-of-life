type CanvasStyle = string | CanvasGradient | CanvasPattern;

type StyleOptions = {
  fillStyle?: CanvasStyle;
  strokeStyle?: CanvasStyle;
};

type LineOptions = {
  color: CanvasStyle;
  width: number;
};

/** A function that instantiates a 2D context 
 * and provides some utility functions to draw
 * common shapes like rectangles and circles,
 * and to also accept rendering callbacks. */
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

export default Paint2D;

