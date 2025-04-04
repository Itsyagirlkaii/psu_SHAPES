console.log("script.js loaded");

//Canvas in 2D
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Hold all the shapes in the canvas
let shapes = [];

// Draw Shapes based on what Prof wanted
function drawShape(shape) {
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = shape.color;
    ctx.beginPath();

    switch (shape.type) {
        case 'rectangle':
            console.log("Drawing rectangle", shape);
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            ctx.fill();
            break;
        case 'circle':
            console.log("Drawing circle", shape);
            ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'line':
            console.log("Drawing line", shape);
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.stroke();
            break;
        case 'triangle':
            console.log("Drawing triangle", shape);
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.lineTo(shape.x3, shape.y3);
            ctx.closePath();
            ctx.fill();
            break;
        default:
            console.log("Unknown shape type", shape);
    }
} 

// Redraw the entire canvas based on the shapes array
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        drawShape(shape);
    });
}

// Dat hit detection tho
function isPointInRect(shape, x, y) {
    return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
}
function isPointInCircle(shape, x, y) {
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= shape.radius * shape.radius;
}
function isPointInTriangle(shape, x, y) {
    const { x1, y1, x2, y2, x3, y3 } = shape;
    const denom = ((y2 - y3) * (x1 - x3)) + ((x3 - x2) * (y1 - y3));
    const a = (((y2 - y3) * (x - x3)) + ((x3 - x2) * (y - y3))) / denom;
    const b = (((y3 - y1) * (x - x3)) + ((x1 - x3) * (y - y3))) / denom;
    const c = 1 - a - b;
    return a >= 0 && b >= 0 && c >= 0;
}

// Compute distance from a point to a line segment
function distancetoLine(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = (len_sq !== 0) ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

function isPointOnLine(shape, x, y) {
    return distancetoLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2) < 5;
}

//return index of the shape at a gien coordinate or -1 if not found
function getShapeAt(x, y) {
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'rectangle' && isPointInRect(shape, x, y)) {
            return i;
        }
        if (shape.type === 'circle' && isPointInCircle(shape, x, y)) {
            return i;
        }
        if (shape.type === 'line' && isPointOnLine(shape, x, y)) {
            return i;
        }
        if (shape.type === 'triangle' && isPointInTriangle(shape, x, y)) {
            return i;
        }
    }
    return -1;
}

// Generate random colors
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

//Add shape to the canvas
function addRandomShape(x, y) {
    const shapeTypes = ['rectangle', 'circle', 'triangle'];
    const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const color = getRandomColor();
    let newShape;

    if (randomType === 'rectangle') {
        const width = 100, height = 50;
        newShape = {
            type: 'rectangle',
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height,
            color: color
        };
    } else if (randomType === 'circle') {
        newShape = {
            type: 'circle',
            x: x,
            y: y,
            radius: Math.random() * 50 + 10,
            color: color
        };
    } else if (randomType === 'triangle') {
        newShape = {
            type: 'triangle',
            x1: x,
            y1: y - 30,
            x2: x - 30,
            y2: y + 30,
            x3: x + 30,
            y3: y + 30,
            color: color
        };
    }

    shapes.push(newShape);
    redrawCanvas();
}

// Initialize canvas with  shapes the prof wanted
function initShapes() {
    //rectangle
    shapes.push({
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 50,
        color: 'blue'
    });
    //circle
    shapes.push({
        type: 'circle',
        x: 200,
        y: 100,
        radius: 30,
        color: 'red'
    });
    //triangle
    shapes.push({
        type: 'triangle',
        x1: 200,
        y1: 200,
        x2: 250,
        y2: 300,
        x3: 150,
        y3: 300,
        color: 'green'
    });
    //line
    shapes.push({
        type: 'line',
        x1: 0,
        y1: 0,
        x2: canvas.width,
        y2: canvas.height,
        color: 'yellow'
    });

    console.log("Shapes array:", shapes);
    redrawCanvas();
}

// Clear the canvas when you click that button
document.getElementById('clearButton').addEventListener('click', function() {
    shapes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// BONUS CHALLENGE

canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shapeIndex = getShapeAt(x, y);
    if (shapeIndex !== -1) {
        shapes.splice(shapeIndex, 1);
        redrawCanvas();
    } else {
        addRandomShape(x, y);
    }
});

//initialize the shapes when the page loads
initShapes();
