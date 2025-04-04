console.log("script.js loaded");

// Get the canvas and its 2D context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Array to hold all shapes drawn on the canvas
let shapes = [];

// Function to draw a shape based on its type and properties
function drawShape(shape) {
  ctx.fillStyle = shape.color;
  ctx.strokeStyle = shape.color;
  ctx.beginPath();
  
  switch(shape.type) {
    case 'rectangle':
      ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      break;
    case 'circle':
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath(); // Fix: Ensure the path for the circle is closed
      break;
    case 'triangle':
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.lineTo(shape.x3, shape.y3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'line':
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      break;
  }
}

// Function to redraw the entire canvas based on the shapes array
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(shape => {
    ctx.beginPath();
    drawShape(shape);
  });
}

// Hit detection functions for each shape type
function isPointInRect(shape, x, y) {
  return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
}

function isPointInCircle(shape, x, y) {
  const dx = x - shape.x;
  const dy = y - shape.y;
  return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
}

function isPointInTriangle(shape, x, y) {
  const { x1, y1, x2, y2, x3, y3 } = shape;
  const denom = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
  const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denom;
  const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denom;
  const c = 1 - a - b;
  return a >= 0 && b >= 0 && c >= 0;
}

// Helper to compute distance from a point to a line segment
function distanceToLine(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = (len_sq !== 0) ? dot / len_sq : -1;
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
  // Consider it a hit if the click is within 5 pixels of the line
  return distanceToLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2) < 5;
}

// Returns the index of the shape at the given coordinates, or -1 if none found
function getShapeAt(x, y) {
  // Loop through shapes in reverse order for proper layering
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape.type === 'rectangle' && isPointInRect(shape, x, y)) {
      return i;
    } else if (shape.type === 'circle' && isPointInCircle(shape, x, y)) {
      return i;
    } else if (shape.type === 'triangle' && isPointInTriangle(shape, x, y)) {
      return i;
    } else if (shape.type === 'line' && isPointOnLine(shape, x, y)) {
      return i;
    }
  }
  return -1;
}

// Generate a random hex color code
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Adds a random shape (rectangle, circle, or triangle) at the given position
function addRandomShape(x, y) {
  const shapeTypes = ['rectangle', 'circle', 'triangle'];
  const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
  const color = getRandomColor();
  let newShape;
  
  if (type === 'rectangle') {
    const width = 100, height = 50;
    newShape = {
      type: 'rectangle',
      x: x - width / 2,
      y: y - height / 2,
      width: width,
      height: height,
      color: color
    };
  } else if (type === 'circle') {
    const radius = 30;
    newShape = {
      type: 'circle',
      x: x,
      y: y,
      radius: radius,
      color: color
    };
  } else if (type === 'triangle') {
    // An equilateral-like triangle centered around the click point
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

// Initialize the canvas with the required shapes
function initShapes() {
  // Blue rectangle: 150px by 100px at (50, 50)
  shapes.push({
    type: 'rectangle',
    x: 50,
    y: 50,
    width: 150,
    height: 100,
    color: 'blue'
  });
  
  // Red circle: radius 50px centered at (300, 100)
  shapes.push({
    type: 'circle',
    x: 300,
    y: 100,
    radius: 50,
    color: 'red'
  });
  
  // Green triangle with vertices at (200,200), (250,300), (150,300)
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
  
  // Yellow line from the top-left to the bottom-right corner
  shapes.push({
    type: 'line',
    x1: 0,
    y1: 0,
    x2: canvas.width,
    y2: canvas.height,
    color: 'yellow'
  });
  
  redrawCanvas();
}

// Clear the canvas and remove all shapes when the button is clicked
document.getElementById('clearButton').addEventListener('click', function() {
  shapes = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Bonus Challenge: Add interactivity to the canvas
// - Click on an existing shape to remove it.
// - Otherwise, click to add a random shape at that position.
canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const shapeIndex = getShapeAt(x, y);
  if (shapeIndex !== -1) {
    // Remove the shape if the click is on it
    shapes.splice(shapeIndex, 1);
    redrawCanvas();
  } else {
    addRandomShape(x, y);
  }
});

// Initialize the shapes when the page loads
initShapes();
