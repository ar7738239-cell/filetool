const imageInput = document.getElementById("imageInput");
const logoInput = document.getElementById("logoInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const textInput = document.getElementById("watermarkText");
const fontSize = document.getElementById("fontSize");
const opacity = document.getElementById("opacity");
const rotation = document.getElementById("rotation");
const textColor = document.getElementById("textColor");

const fontSizeValue = document.getElementById("fontSizeValue");
const opacityValue = document.getElementById("opacityValue");
const rotationValue = document.getElementById("rotationValue");

const downloadBtn = document.getElementById("downloadBtn");
const logoSize = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

let mainImage = null;

let logoImage = null;

let logoX = 100;
let logoY = 100;

let logoWidth = 150;
let logoHeight = 150;

imageInput.addEventListener("change", e=>{

const file=e.target.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(ev){

mainImage=new Image();

mainImage.onload=function(){

canvas.width=mainImage.width;
canvas.height=mainImage.height;

drawCanvas();

}

mainImage.src=ev.target.result;

}

reader.readAsDataURL(file);

});

logoInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(ev){

        logoImage = new Image();

        logoImage.onload = function(){

            drawCanvas();

        };

        logoImage.src = ev.target.result;

    };

    reader.readAsDataURL(file);

});

function drawCanvas(){

if(!mainImage) return;

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.drawImage(mainImage,0,0);

ctx.save();

ctx.globalAlpha=opacity.value/100;

ctx.translate(canvas.width/2,canvas.height/2);

ctx.rotate(rotation.value*Math.PI/180);

ctx.fillStyle=textColor.value;

ctx.font=`bold ${fontSize.value}px Arial`;

ctx.textAlign="center";

ctx.fillText(textInput.value,0,0);

ctx.restore();

if (logoImage) {

    ctx.drawImage(
        logoImage,
        logoX,
        logoY,
        logoWidth,
        logoHeight
    );

}
  
}

textInput.addEventListener("input",drawCanvas);

fontSize.addEventListener("input",()=>{

fontSizeValue.innerText=fontSize.value+" px";

drawCanvas();

});

opacity.addEventListener("input",()=>{

opacityValue.innerText=opacity.value+"%";

drawCanvas();

});

rotation.addEventListener("input",()=>{

rotationValue.innerText=rotation.value+"°";

drawCanvas();

});

textColor.addEventListener("input",drawCanvas);
logoSize.addEventListener("input", () => {

    logoWidth = Number(logoSize.value);
    logoHeight = Number(logoSize.value);

    logoSizeValue.innerText = logoSize.value + " px";

    drawCanvas();

});

downloadBtn.addEventListener("click",()=>{

if (!mainImage) {
    alert("Please upload an image first.");
    return;
}
    
const a=document.createElement("a");

a.href=canvas.toDataURL("image/png");

a.download="watermarked-image.png";

a.click();

});
