// src/styles/utilities/createPlaceholder.js
// Create a simple placeholder image for spell cards
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const width = 200;
const height = 300;

canvas.width = width;
canvas.height = height;

// Background
ctx.fillStyle = '#2a3b4c';
ctx.fillRect(0, 0, width, height);

// Border
ctx.strokeStyle = '#8a5a44';
ctx.lineWidth = 10;
ctx.strokeRect(5, 5, width - 10, height - 10);

// Text
ctx.fillStyle = '#ffffff';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Spell Image', width / 2, height / 2);
ctx.fillText('Placeholder', width / 2, height / 2 + 30);

// Convert to blob and save
canvas.toBlob(function(blob) {
  const link = document.createElement('a');
  link.download = 'default-placeholder.jpg';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}, 'image/jpeg', 0.95);
