const imageInput = document.getElementById("imageInput");
const logoInput = document.getElementById("logoInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const emptyMessage = document.getElementById("emptyMessage");

const watermarkText = document.getElementById("watermarkText");
const fontFamily = document.getElementById("fontFamily");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");

const opacity = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");

const rotation = document.getElementById("rotation");
const rotationValue = document.getElementById("rotationValue");

const textColor = document.getElementById("textColor");

const logoSize = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

const logoOpacity = document.getElementById("logoOpacity");
const logoOpacityValue = document.getElementById("logoOpacityValue");

const logoRotation = document.getElementById("logoRotation");
const logoRotationValue = document.getElementById("logoRotationValue");

const tileWatermark = document.getElementById("tileWatermark");

const tileSpacing = document.getElementById("tileSpacing");
const tileSpacingValue = document.getElementById("tileSpacingValue");

const shadowToggle = document.getElementById("shadowToggle");
const outlineToggle = document.getElementById("outlineToggle");

const qualitySelect = document.getElementById("qualitySelect");

const imageName = document.getElementById("imageName");

let image = null;
let logo = null;

let textObject = null;
let logoObject = null;

let activeObject = null;

let dragging = false;

let dragOffsetX = 0;
let dragOffsetY = 0;

let isBold = false;
let isItalic = false;


/* =========================
IMAGE UPLOAD
========================= */

imageInput.addEventListener("change", function(){

const file = this.files[0];

if(!file) return;

imageName.textContent = file.name;

const reader = new FileReader();

reader.onload = function(e){

const img = new Image();

img.onload = function(){

image = img;

emptyMessage.style.display = "none";

canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;

draw();

};

img.src = e.target.result;

};

reader.readAsDataURL(file);

});


/* =========================
LOGO UPLOAD
========================= */

logoInput.addEventListener("change", function(){

const file = this.files[0];

if(!file) return;

const reader = new FileReader();

reader.onload = function(e){

const img = new Image();

img.onload = function(){

logo = img;

logoObject = {

x:canvas.width/2,
y:canvas.height/2,

size:180,

rotation:0

};

activeObject = logoObject;

draw();

};

img.src = e.target.result;

};

reader.readAsDataURL(file);

});


/* =========================
ADD TEXT
========================= */

document.getElementById("addTextBtn").addEventListener("click",function(){

if(!image){

alert("Please upload an image first.");

return;

}

if(!watermarkText.value.trim()){

alert("Enter watermark text.");

return;

}

if(!textObject){

textObject = {

x:canvas.width/2,
y:canvas.height/2

};

}

activeObject = textObject;

draw();

});


/* =========================
REMOVE TEXT
========================= */

document.getElementById("removeTextBtn").addEventListener("click",function(){

textObject = null;

if(activeObject === textObject){

activeObject = null;

}

draw();

});


/* =========================
REMOVE LOGO
========================= */

document.getElementById("removeLogoBtn").addEventListener("click",function(){

logo = null;
logoObject = null;

if(activeObject === logoObject){

activeObject = null;

}

draw();

});


/* =========================
SLIDERS
========================= */

fontSize.addEventListener("input",function(){

fontSizeValue.textContent = this.value + " px";

draw();

});


opacity.addEventListener("input",function(){

opacityValue.textContent = this.value + "%";

draw();

});


rotation.addEventListener("input",function(){

rotationValue.textContent = this.value + "°";

draw();

});


logoSize.addEventListener("input",function(){

logoSizeValue.textContent = this.value + " px";

if(logoObject){

logoObject.size = parseInt(this.value);

}

draw();

});


logoOpacity.addEventListener("input",function(){

logoOpacityValue.textContent = this.value + "%";

draw();

});


logoRotation.addEventListener("input",function(){

logoRotationValue.textContent = this.value + "°";

if(logoObject){

logoObject.rotation = parseInt(this.value);

}

draw();

});


tileSpacing.addEventListener("input",function(){

tileSpacingValue.textContent = this.value + " px";

draw();

});


/* =========================
TEXT SETTINGS
========================= */

[
watermarkText,
fontFamily,
textColor,
shadowToggle,
outlineToggle
].forEach(function(element){

element.addEventListener("input",draw);
element.addEventListener("change",draw);

});


/* =========================
BOLD
========================= */

document.getElementById("boldBtn").addEventListener("click",function(){

isBold = !isBold;

this.style.background = isBold ? "#bfdbfe" : "#e2e8f0";

draw();

});


/* =========================
ITALIC
========================= */

document.getElementById("italicBtn").addEventListener("click",function(){

isItalic = !isItalic;

this.style.background = isItalic ? "#bfdbfe" : "#e2e8f0";

draw();

});


/* =========================
DRAW IMAGE
========================= */

function draw(){

if(!image) return;

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.drawImage(
image,
0,
0,
canvas.width,
canvas.height
);


/* TEXT */

if(textObject && watermarkText.value.trim()){

if(tileWatermark.checked){

drawTextTile();

}else{

drawText(textObject.x,textObject.y);

}

}


/* LOGO */

if(logo && logoObject){

if(tileWatermark.checked){

drawLogoTile();

}else{

drawLogo(
logoObject.x,
logoObject.y
);

}

}

}


/* =========================
TEXT DRAW
========================= */

function drawText(x,y){

const size = parseInt(fontSize.value);

const angle = parseInt(rotation.value);

const alpha = parseInt(opacity.value)/100;

ctx.save();

ctx.translate(x,y);

ctx.rotate(angle*Math.PI/180);

ctx.globalAlpha = alpha;

ctx.font =
(isItalic ? "italic " : "") +
(isBold ? "bold " : "") +
size + "px " +
fontFamily.value;

ctx.textAlign = "center";
ctx.textBaseline = "middle";


/* SHADOW */

if(shadowToggle.checked){

ctx.shadowColor = "rgba(0,0,0,.55)";
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 3;

}


/* OUTLINE */

if(outlineToggle.checked){

ctx.strokeStyle = "rgba(0,0,0,.7)";
ctx.lineWidth = Math.max(2,size/15);

ctx.strokeText(
watermarkText.value,
0,
0
);

}


/* TEXT */

ctx.fillStyle = textColor.value;

ctx.fillText(
watermarkText.value,
0,
0
);

ctx.restore();

}


/* =========================
LOGO DRAW
========================= */

function drawLogo(x,y){

const size = logoObject.size;

const ratio = logo.naturalWidth / logo.naturalHeight;

let width = size;
let height = size / ratio;

ctx.save();

ctx.translate(x,y);

ctx.rotate(
logoObject.rotation*Math.PI/180
);

ctx.globalAlpha =
parseInt(logoOpacity.value)/100;

if(shadowToggle.checked){

ctx.shadowColor = "rgba(0,0,0,.4)";
ctx.shadowBlur = 12;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 3;

}

ctx.drawImage(
logo,
-width/2,
-height/2,
width,
height
);

ctx.restore();

}


/* =========================
TEXT TILE
========================= */

function drawTextTile(){

const spacing = parseInt(tileSpacing.value);

for(let y=0;y<canvas.height;y+=spacing){

for(let x=0;x<canvas.width;x+=spacing){

drawText(
x,
y
);

}

}

}


/* =========================
LOGO TILE
========================= */

function drawLogoTile(){

const spacing = parseInt(tileSpacing.value);

for(let y=0;y<canvas.height;y+=spacing){

for(let x=0;x<canvas.width;x+=spacing){

drawLogo(
x,
y
);

}

}

}


/* =========================
POSITION BUTTONS
========================= */

document.querySelectorAll(".position-grid button")
.forEach(function(button){

button.addEventListener("click",function(){

if(!activeObject){

if(textObject){

activeObject = textObject;

}else if(logoObject){

activeObject = logoObject;

}else{

alert("Add text or logo first.");

return;

}

}

const pos = this.dataset.position;

const margin = Math.min(
canvas.width,
canvas.height
)*0.12;

let x = canvas.width/2;
let y = canvas.height/2;

if(pos.includes("left")){

x = margin;

}

if(pos.includes("right")){

x = canvas.width-margin;

}

if(pos.includes("top")){

y = margin;

}

if(pos.includes("bottom")){

y = canvas.height-margin;

}

if(pos === "top-center"){

x = canvas.width/2;
y = margin;

}

if(pos === "center"){

x = canvas.width/2;
y = canvas.height/2;

}

if(pos === "bottom-center"){

x = canvas.width/2;
y = canvas.height-margin;

}

if(pos === "center-left"){

x = margin;
y = canvas.height/2;

}

if(pos === "center-right"){

x = canvas.width-margin;
y = canvas.height/2;

}

activeObject.x = x;
activeObject.y = y;

draw();

});

});


/* =========================
CANVAS TOUCH / MOUSE
========================= */

canvas.addEventListener("pointerdown",function(e){

if(!image) return;

const point = getCanvasPoint(e);

const selected = findObject(point.x,point.y);

if(selected){

activeObject = selected;

dragging = true;

dragOffsetX =
point.x-selected.x;

dragOffsetY =
point.y-selected.y;

canvas.setPointerCapture(e.pointerId);

}

});


canvas.addEventListener("pointermove",function(e){

if(!dragging || !activeObject) return;

const point = getCanvasPoint(e);

activeObject.x =
point.x-dragOffsetX;

activeObject.y =
point.y-dragOffsetY;

draw();

});


canvas.addEventListener("pointerup",function(){

dragging = false;

});


canvas.addEventListener("pointercancel",function(){

dragging = false;

});


/* =========================
GET CANVAS POINT
========================= */

function getCanvasPoint(e){

const rect = canvas.getBoundingClientRect();

return {

x:
(e.clientX-rect.left) *
(canvas.width/rect.width),

y:
(e.clientY-rect.top) *
(canvas.height/rect.height)

};

}


/* =========================
SELECT OBJECT
========================= */

function findObject(x,y){

if(logoObject && logo){

const size = logoObject.size;

if(

Math.abs(x-logoObject.x)<size &&
Math.abs(y-logoObject.y)<size

){

return logoObject;

}

}


if(textObject && watermarkText.value.trim()){

const size = parseInt(fontSize.value);

const textWidth =
ctx.measureText(
watermarkText.value
).width;

if(

Math.abs(x-textObject.x)<textWidth/2 &&
Math.abs(y-textObject.y)<size

){

return textObject;

}

}

return null;

}


/* =========================
DOWNLOAD
========================= */

document.getElementById("downloadBtn")
.addEventListener("click",function(){

if(!image){

alert("Please upload an image first.");

return;

}

draw();

const quality =
parseFloat(qualitySelect.value);

canvas.toBlob(function(blob){

const url =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;

a.download =
"adiyogitools-watermarked-image.jpg";

document.body.appendChild(a);

a.click();

a.remove();

URL.revokeObjectURL(url);

},"image/jpeg",quality);

});


/* =========================
RESET
========================= */

document.getElementById("resetBtn")
.addEventListener("click",function(){

image = null;
logo = null;

textObject = null;
logoObject = null;

activeObject = null;

imageInput.value = "";
logoInput.value = "";

watermarkText.value = "";

imageName.textContent =
"No image selected";

emptyMessage.style.display =
"block";

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

});


/* =========================
DEFAULT VALUES
========================= */

fontSizeValue.textContent =
fontSize.value+" px";

opacityValue.textContent =
opacity.value+"%";

rotationValue.textContent =
rotation.value+"°";

logoSizeValue.textContent =
logoSize.value+" px";

logoOpacityValue.textContent =
logoOpacity.value+"%";

logoRotationValue.textContent =
logoRotation.value+"°";

tileSpacingValue.textContent =
tileSpacing.value+" px";
