const Paint2D = function (canvas) {
    const ctx = canvas.getContext("2d");
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
        grid: function (columns, rows, { color, width }) {
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
        circle: function (x, y, radius, options) {
            this.withinPath(() => {
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
            this.withinPath(() => {
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
            this.withinPath(() => {
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
export default Paint2D;
