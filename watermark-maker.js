/* =========================================================
   ADIYOGITOOLS WATERMARK MAKER PRO
   ---------------------------------
   1 Finger  = Move
   2 Fingers = Resize + Rotate
   Mouse     = Move
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const imageInput = document.getElementById("imageInput");
const logoInput = document.getElementById("logoInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const emptyMessage = document.getElementById("emptyMessage");
const imageName = document.getElementById("imageName");


/* TEXT */

const watermarkText = document.getElementById("watermarkText");
const fontFamily = document.getElementById("fontFamily");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");

const opacity = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");

const rotation = document.getElementById("rotation");
const rotationValue = document.getElementById("rotationValue");

const textColor = document.getElementById("textColor");


/* LOGO */

const logoSize = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

const logoOpacity = document.getElementById("logoOpacity");
const logoOpacityValue = document.getElementById("logoOpacityValue");

const logoRotation = document.getElementById("logoRotation");
const logoRotationValue = document.getElementById("logoRotationValue");


/* OTHER */

const tileWatermark = document.getElementById("tileWatermark");

const tileSpacing = document.getElementById("tileSpacing");
const tileSpacingValue = document.getElementById("tileSpacingValue");

const shadowToggle = document.getElementById("shadowToggle");
const outlineToggle = document.getElementById("outlineToggle");

const qualitySelect = document.getElementById("qualitySelect");


/* =========================================================
   MAIN VARIABLES
========================================================= */

let image = null;
let logo = null;

let textObject = null;
let logoObject = null;

let activeObject = null;

let isBold = false;
let isItalic = false;


/* =========================================================
   DRAG VARIABLES
========================================================= */

let dragging = false;
let dragObject = null;

let dragStartX = 0;
let dragStartY = 0;

let objectStartX = 0;
let objectStartY = 0;


/* =========================================================
   TWO FINGER GESTURE VARIABLES
========================================================= */

let gestureActive = false;

let gestureStartDistance = 0;
let gestureStartAngle = 0;

let gestureStartSize = 0;
let gestureStartRotation = 0;


/* =========================================================
   CANVAS TOUCH SETTINGS
========================================================= */

canvas.style.touchAction = "none";
canvas.style.userSelect = "none";
canvas.style.webkitUserSelect = "none";
canvas.style.webkitTouchCallout = "none";


/* =========================================================
   IMAGE UPLOAD
========================================================= */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        this.value = "";

        return;
    }

    if (imageName) {

        imageName.textContent = file.name;

    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const img = new Image();

        img.onload = function () {

            image = img;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            /* Reset old watermark */

            textObject = null;
            logoObject = null;
            logo = null;

            activeObject = null;

            dragging = false;
            dragObject = null;

            gestureActive = false;

            if (emptyMessage) {

                emptyMessage.style.display = "none";

            }

            draw();

        };

        img.onerror = function () {

            alert("Unable to load this image.");

        };

        img.src = event.target.result;

    };

    reader.onerror = function () {

        alert("Unable to read this image.");

    };

    reader.readAsDataURL(file);

});


/* =========================================================
   LOGO UPLOAD
========================================================= */

logoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid logo image.");

        this.value = "";

        return;
    }

    if (!image) {

        alert("Please upload the main image first.");

        this.value = "";

        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const img = new Image();

        img.onload = function () {

            logo = img;

            let size = parseFloat(logoSize.value);

            if (!size || size <= 0) {

                size = 150;

            }

            const maximum =
                Math.min(
                    canvas.width,
                    canvas.height
                ) * 0.35;

            size = Math.min(size, maximum);

            logoSize.value = Math.round(size);

            logoSizeValue.textContent =
                Math.round(size) + " px";

            logoObject = {

                x: canvas.width / 2,

                y: canvas.height / 2,

                size: size,

                rotation:
                    parseFloat(
                        logoRotation.value
                    ) || 0

            };

            activeObject = logoObject;

            draw();

        };

        img.onerror = function () {

            alert("Unable to load the logo.");

        };

        img.src = event.target.result;

    };

    reader.readAsDataURL(file);

});


/* =========================================================
   ADD TEXT
========================================================= */

document
.getElementById("addTextBtn")
.addEventListener("click", function () {

    if (!image) {

        alert("Please upload an image first.");

        return;

    }

    if (!watermarkText.value.trim()) {

        alert("Please enter watermark text.");

        watermarkText.focus();

        return;

    }

    if (!textObject) {

        textObject = {

            x: canvas.width / 2,

            y: canvas.height / 2,

            rotation:
                parseFloat(rotation.value) || 0

        };

    }

    activeObject = textObject;

    draw();

});


/* =========================================================
   REMOVE TEXT
========================================================= */

document
.getElementById("removeTextBtn")
.addEventListener("click", function () {

    if (activeObject === textObject) {

        activeObject = null;

    }

    textObject = null;

    draw();

});


/* =========================================================
   REMOVE LOGO
========================================================= */

document
.getElementById("removeLogoBtn")
.addEventListener("click", function () {

    if (activeObject === logoObject) {

        activeObject = null;

    }

    logo = null;
    logoObject = null;

    logoInput.value = "";

    draw();

});


/* =========================================================
   TEXT SIZE
========================================================= */

fontSize.addEventListener("input", function () {

    fontSizeValue.textContent =
        this.value + " px";

    draw();

});


/* =========================================================
   TEXT OPACITY
========================================================= */

opacity.addEventListener("input", function () {

    opacityValue.textContent =
        this.value + "%";

    draw();

});


/* =========================================================
   TEXT ROTATION
========================================================= */

rotation.addEventListener("input", function () {

    rotationValue.textContent =
        this.value + "°";

    if (textObject) {

        textObject.rotation =
            parseFloat(this.value);

    }

    draw();

});


/* =========================================================
   TEXT COLOR
========================================================= */

textColor.addEventListener("input", draw);


/* =========================================================
   FONT
========================================================= */

fontFamily.addEventListener("change", draw);


/* =========================================================
   LOGO SIZE
========================================================= */

logoSize.addEventListener("input", function () {

    logoSizeValue.textContent =
        this.value + " px";

    if (logoObject) {

        logoObject.size =
            parseFloat(this.value);

    }

    draw();

});


/* =========================================================
   LOGO OPACITY
========================================================= */

logoOpacity.addEventListener("input", function () {

    logoOpacityValue.textContent =
        this.value + "%";

    draw();

});


/* =========================================================
   LOGO ROTATION
========================================================= */

logoRotation.addEventListener("input", function () {

    logoRotationValue.textContent =
        this.value + "°";

    if (logoObject) {

        logoObject.rotation =
            parseFloat(this.value);

    }

    draw();

});


/* =========================================================
   TILE SPACING
========================================================= */

tileSpacing.addEventListener("input", function () {

    tileSpacingValue.textContent =
        this.value + " px";

    draw();

});


/* =========================================================
   OTHER SETTINGS
========================================================= */

tileWatermark.addEventListener("change", draw);

shadowToggle.addEventListener("change", draw);

outlineToggle.addEventListener("change", draw);


/* =========================================================
   BOLD
========================================================= */

document
.getElementById("boldBtn")
.addEventListener("click", function () {

    isBold = !isBold;

    this.style.background =
        isBold
            ? "#bfdbfe"
            : "#e2e8f0";

    draw();

});


/* =========================================================
   ITALIC
========================================================= */

document
.getElementById("italicBtn")
.addEventListener("click", function () {

    isItalic = !isItalic;

    this.style.background =
        isItalic
            ? "#bfdbfe"
            : "#e2e8f0";

    draw();

});


/* =========================================================
   DRAW EVERYTHING
========================================================= */

function draw() {

    if (!image) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* Original image */

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* TEXT */

    if (
        textObject &&
        watermarkText.value.trim()
    ) {

        if (tileWatermark.checked) {

            drawTextTile();

        } else {

            drawText(
                textObject.x,
                textObject.y
            );

        }

    }


    /* LOGO */

    if (
        logo &&
        logoObject
    ) {

        if (tileWatermark.checked) {

            drawLogoTile();

        } else {

            drawLogo(
                logoObject.x,
                logoObject.y
            );

        }

    }

}


/* =========================================================
   DRAW TEXT
========================================================= */

function drawText(x, y) {

    const size =
        parseInt(fontSize.value);

    const angle =
        textObject &&
        typeof textObject.rotation === "number"
            ? textObject.rotation
            : 0;

    const alpha =
        parseInt(opacity.value) / 100;


    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(
        angle * Math.PI / 180
    );

    ctx.globalAlpha = alpha;

    ctx.font =
        (isItalic ? "italic " : "") +
        (isBold ? "bold " : "") +
        size +
        "px " +
        fontFamily.value;

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    /* Shadow */

    if (shadowToggle.checked) {

        ctx.shadowColor =
            "rgba(0,0,0,.55)";

        ctx.shadowBlur = 10;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

    }


    /* Outline */

    if (outlineToggle.checked) {

        ctx.strokeStyle =
            "rgba(0,0,0,.7)";

        ctx.lineWidth =
            Math.max(
                2,
                size / 15
            );

        ctx.strokeText(
            watermarkText.value,
            0,
            0
        );

    }


    /* Text */

    ctx.fillStyle =
        textColor.value;

    ctx.fillText(
        watermarkText.value,
        0,
        0
    );

    ctx.restore();

}


/* =========================================================
   DRAW LOGO
========================================================= */

function drawLogo(x, y) {

    if (!logo || !logoObject) return;

    const size =
        logoObject.size;

    const ratio =
        logo.naturalWidth /
        logo.naturalHeight;

    const width = size;

    const height =
        size / ratio;


    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(
        logoObject.rotation *
        Math.PI / 180
    );

    ctx.globalAlpha =
        parseInt(
            logoOpacity.value
        ) / 100;


    if (shadowToggle.checked) {

        ctx.shadowColor =
            "rgba(0,0,0,.4)";

        ctx.shadowBlur = 12;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

    }


    ctx.drawImage(
        logo,
        -width / 2,
        -height / 2,
        width,
        height
    );

    ctx.restore();

}


/* =========================================================
   TEXT TILE
========================================================= */

function drawTextTile() {

    const spacing =
        Math.max(
            50,
            parseInt(tileSpacing.value)
        );


    for (
        let y = spacing / 2;
        y < canvas.height;
        y += spacing
    ) {

        for (
            let x = spacing / 2;
            x < canvas.width;
            x += spacing
        ) {

            drawText(x, y);

        }

    }

}


/* =========================================================
   LOGO TILE
========================================================= */

function drawLogoTile() {

    const spacing =
        Math.max(
            50,
            parseInt(tileSpacing.value)
        );


    for (
        let y = spacing / 2;
        y < canvas.height;
        y += spacing
    ) {

        for (
            let x = spacing / 2;
            x < canvas.width;
            x += spacing
        ) {

            drawLogo(x, y);

        }

    }

}


/* =========================================================
   POSITION BUTTONS
========================================================= */

document
.querySelectorAll(".position-grid button")
.forEach(function (button) {

    button.addEventListener("click", function () {

        if (!activeObject) {

            if (textObject) {

                activeObject = textObject;

            } else if (logoObject) {

                activeObject = logoObject;

            } else {

                alert(
                    "Please add text or logo first."
                );

                return;

            }

        }


        const pos =
            this.dataset.position;


        const margin =
            Math.min(
                canvas.width,
                canvas.height
            ) * 0.12;


        let x =
            canvas.width / 2;

        let y =
            canvas.height / 2;


        if (pos.includes("left")) {

            x = margin;

        }

        if (pos.includes("right")) {

            x =
                canvas.width - margin;

        }

        if (pos.includes("top")) {

            y = margin;

        }

        if (pos.includes("bottom")) {

            y =
                canvas.height - margin;

        }


        if (pos === "center") {

            x =
                canvas.width / 2;

            y =
                canvas.height / 2;

        }


        if (pos === "top-center") {

            x =
                canvas.width / 2;

            y = margin;

        }


        if (pos === "bottom-center") {

            x =
                canvas.width / 2;

            y =
                canvas.height - margin;

        }


        if (pos === "center-left") {

            x = margin;

            y =
                canvas.height / 2;

        }


        if (pos === "center-right") {

            x =
                canvas.width - margin;

            y =
                canvas.height / 2;

        }


        activeObject.x = x;

        activeObject.y = y;

        draw();

    });

});


/* =========================================================
   FIND OBJECT
========================================================= */

function findObjectAtPoint(x, y) {

    /* LOGO */

    if (logo && logoObject) {

        const width =
            logoObject.size;

        const height =
            width *
            (
                logo.naturalHeight /
                logo.naturalWidth
            );


        const padding =
            Math.max(
                30,
                width * 0.12
            );


        if (
            Math.abs(
                x - logoObject.x
            ) <=
            width / 2 + padding

            &&

            Math.abs(
                y - logoObject.y
            ) <=
            height / 2 + padding
        ) {

            return logoObject;

        }

    }


    /* TEXT */

    if (
        textObject &&
        watermarkText.value.trim()
    ) {

        const size =
            parseInt(fontSize.value);


        ctx.save();


        ctx.font =
            (isItalic ? "italic " : "") +
            (isBold ? "bold " : "") +
            size +
            "px " +
            fontFamily.value;


        const textWidth =
            ctx.measureText(
                watermarkText.value
            ).width;


        ctx.restore();


        const padding =
            Math.max(
                40,
                size * 0.4
            );


        if (
            Math.abs(
                x - textObject.x
            ) <=
            textWidth / 2 + padding

            &&

            Math.abs(
                y - textObject.y
            ) <=
            size / 2 + padding
        ) {

            return textObject;

        }

    }


    return null;

}


/* =========================================================
   CANVAS COORDINATES
========================================================= */

function getCanvasPoint(
    clientX,
    clientY
) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x:
            (
                clientX -
                rect.left
            )
            *
            (
                canvas.width /
                rect.width
            ),

        y:
            (
                clientY -
                rect.top
            )
            *
            (
                canvas.height /
                rect.height
            )

    };

}


/* =========================================================
   START DRAG
========================================================= */

function startDrag(
    clientX,
    clientY
) {

    if (!image) return false;


    const point =
        getCanvasPoint(
            clientX,
            clientY
        );


    const selected =
        findObjectAtPoint(
            point.x,
            point.y
        );


    if (!selected) {

        return false;

    }


    activeObject =
        selected;

    dragObject =
        selected;

    dragging = true;


    dragStartX =
        point.x;

    dragStartY =
        point.y;


    objectStartX =
        selected.x;

    objectStartY =
        selected.y;


    return true;

}


/* =========================================================
   MOVE DRAG
========================================================= */

function moveDrag(
    clientX,
    clientY
) {

    if (
        !dragging ||
        !dragObject
    ) {

        return;

    }


    const point =
        getCanvasPoint(
            clientX,
            clientY
        );


    const dx =
        point.x -
        dragStartX;

    const dy =
        point.y -
        dragStartY;


    dragObject.x =
        objectStartX + dx;

    dragObject.y =
        objectStartY + dy;


    /* Keep inside image */

    dragObject.x =
        Math.max(
            0,
            Math.min(
                canvas.width,
                dragObject.x
            )
        );


    dragObject.y =
        Math.max(
            0,
            Math.min(
                canvas.height,
                dragObject.y
            )
        );


    draw();

}


/* =========================================================
   STOP DRAG
========================================================= */

function stopDrag() {

    dragging = false;

    dragObject = null;

}


/* =========================================================
   FINGER DISTANCE
========================================================= */

function getFingerDistance(t1, t2) {

    const dx =
        t2.clientX -
        t1.clientX;

    const dy =
        t2.clientY -
        t1.clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================================
   FINGER ANGLE
========================================================= */

function getFingerAngle(t1, t2) {

    return Math.atan2(
        t2.clientY - t1.clientY,
        t2.clientX - t1.clientX
    ) * 180 / Math.PI;

}


/* =========================================================
   GET ACTIVE SIZE
========================================================= */

function getActiveSize() {

    if (
        activeObject === logoObject &&
        logoObject
    ) {

        return logoObject.size;

    }


    if (
        activeObject === textObject
    ) {

        return parseFloat(
            fontSize.value
        );

    }


    return 100;

}


/* =========================================================
   SET ACTIVE SIZE
========================================================= */

function setActiveSize(value) {

    value =
        Math.round(value);


    if (
        activeObject === logoObject &&
        logoObject
    ) {

        value =
            Math.max(
                30,
                Math.min(
                    1000,
                    value
                )
            );


        logoObject.size = value;

        logoSize.value = value;

        logoSizeValue.textContent =
            value + " px";

    }


    else if (
        activeObject === textObject
    ) {

        value =
            Math.max(
                15,
                Math.min(
                    300,
                    value
                )
            );


        fontSize.value = value;

        fontSizeValue.textContent =
            value + " px";

    }

}


/* =========================================================
   GET ACTIVE ROTATION
========================================================= */

function getActiveRotation() {

    if (
        activeObject === logoObject &&
        logoObject
    ) {

        return logoObject.rotation;

    }


    if (
        activeObject === textObject
    ) {

        return (
            parseFloat(
                textObject.rotation
            ) || 0
        );

    }


    return 0;

}


/* =========================================================
   SET ACTIVE ROTATION
========================================================= */

function setActiveRotation(value) {

    value =
        Math.round(value);


    if (
        activeObject === logoObject &&
        logoObject
    ) {

        logoObject.rotation =
            value;

        logoRotation.value =
            value;

        logoRotationValue.textContent =
            value + "°";

    }


    else if (
        activeObject === textObject
    ) {

        textObject.rotation =
            value;

        rotation.value =
            value;

        rotationValue.textContent =
            value + "°";

    }

}


/* =========================================================
   TOUCH START
========================================================= */

canvas.addEventListener(
    "touchstart",
    function (e) {

        /*
         * TWO FINGERS
         * Resize + Rotate
         */

        if (
            e.touches.length === 2 &&
            activeObject
        ) {

            e.preventDefault();


            const t1 =
                e.touches[0];

            const t2 =
                e.touches[1];


            gestureActive = true;


            gestureStartDistance =
                getFingerDistance(
                    t1,
                    t2
                );


            gestureStartAngle =
                getFingerAngle(
                    t1,
                    t2
                );


            gestureStartSize =
                getActiveSize();


            gestureStartRotation =
                getActiveRotation();


            dragging = false;

            dragObject = null;


            return;

        }


        /*
         * ONE FINGER
         * Drag
         */

        if (
            e.touches.length === 1 &&
            !gestureActive
        ) {

            const touch =
                e.touches[0];


            const started =
                startDrag(
                    touch.clientX,
                    touch.clientY
                );


            if (started) {

                e.preventDefault();

            }

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   TOUCH MOVE
========================================================= */

canvas.addEventListener(
    "touchmove",
    function (e) {

        /*
         * TWO FINGER
         */

        if (
            gestureActive &&
            e.touches.length === 2 &&
            activeObject
        ) {

            e.preventDefault();


            const t1 =
                e.touches[0];

            const t2 =
                e.touches[1];


            /* SIZE */

            const currentDistance =
                getFingerDistance(
                    t1,
                    t2
                );


            let scale =
                currentDistance /
                gestureStartDistance;


            scale =
                Math.max(
                    0.15,
                    Math.min(
                        5,
                        scale
                    )
                );


            const newSize =
                gestureStartSize *
                scale;


            setActiveSize(
                newSize
            );


            /* ROTATION */

            const currentAngle =
                getFingerAngle(
                    t1,
                    t2
                );


            let angleChange =
                currentAngle -
                gestureStartAngle;


            /*
             * Avoid sudden jump
             * around -180/+180
             */

            if (
                angleChange > 180
            ) {

                angleChange -= 360;

            }


            if (
                angleChange < -180
            ) {

                angleChange += 360;

            }


            const newRotation =
                gestureStartRotation +
                angleChange;


            setActiveRotation(
                newRotation
            );


            draw();

            return;

        }


        /*
         * ONE FINGER
         * Drag
         */

        if (
            dragging &&
            e.touches.length === 1
        ) {

            e.preventDefault();


            const touch =
                e.touches[0];


            moveDrag(
                touch.clientX,
                touch.clientY
            );

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   TOUCH END
========================================================= */

canvas.addEventListener(
    "touchend",
    function (e) {

        /*
         * When fewer than two fingers
         * remain, stop gesture mode.
         */

        if (
            e.touches.length < 2
        ) {

            gestureActive = false;

        }


        /*
         * When no fingers remain,
         * completely stop dragging.
         */

        if (
            e.touches.length === 0
        ) {

            stopDrag();

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   TOUCH CANCEL
========================================================= */

canvas.addEventListener(
    "touchcancel",
    function () {

        gestureActive = false;

        stopDrag();

    }
);


/* =========================================================
   DESKTOP MOUSE DRAG
========================================================= */

canvas.addEventListener(
    "mousedown",
    function (e) {

        if (!image) return;

        e.preventDefault();

        startDrag(
            e.clientX,
            e.clientY
        );

    }
);


/* =========================================================
   DESKTOP MOUSE MOVE
========================================================= */

window.addEventListener(
    "mousemove",
    function (e) {

        if (!dragging) return;

        e.preventDefault();

        moveDrag(
            e.clientX,
            e.clientY
        );

    }
);


/* =========================================================
   DESKTOP MOUSE UP
========================================================= */

window.addEventListener(
    "mouseup",
    function () {

        stopDrag();

    }
);


/* =========================================================
   DOWNLOAD
========================================================= */

document
.getElementById("downloadBtn")
.addEventListener(
    "click",
    function () {

        if (!image) {

            alert(
                "Please upload an image first."
            );

            return;

        }


        draw();


        let quality =
            parseFloat(
                qualitySelect.value
            );


        if (
            isNaN(quality) ||
            quality <= 0 ||
            quality > 1
        ) {

            quality = 0.92;

        }


        canvas.toBlob(
            function (blob) {

                if (!blob) {

                    alert(
                        "Unable to create image."
                    );

                    return;

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    "adiyogitools-watermarked-image.jpg";


                document.body.appendChild(
                    link
                );


                link.click();

                link.remove();


                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );

            },
            "image/jpeg",
            quality
        );

    }
);


/* =========================================================
   RESET
========================================================= */

document
.getElementById("resetBtn")
.addEventListener(
    "click",
    function () {

        image = null;

        logo = null;

        textObject = null;

        logoObject = null;

        activeObject = null;


        dragging = false;

        dragObject = null;

        gestureActive = false;


        imageInput.value = "";

        logoInput.value = "";

        watermarkText.value = "";


        if (imageName) {

            imageName.textContent =
                "No image selected";

        }


        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }
);


/* =========================================================
   INITIAL VALUES
========================================================= */

if (fontSizeValue) {

    fontSizeValue.textContent =
        fontSize.value + " px";

}


if (opacityValue) {

    opacityValue.textContent =
        opacity.value + "%";

}


if (rotationValue) {

    rotationValue.textContent =
        rotation.value + "°";

}


if (logoSizeValue) {

    logoSizeValue.textContent =
        logoSize.value + " px";

}


if (logoOpacityValue) {

    logoOpacityValue.textContent =
        logoOpacity.value + "%";

}


if (logoRotationValue) {

    logoRotationValue.textContent =
        logoRotation.value + "°";

}


if (tileSpacingValue) {

    tileSpacingValue.textContent =
        tileSpacing.value + " px";

}


console.log(
    "AdiyogiTools Watermark Maker Pro loaded successfully."
);

/* =========================================================
   UNDO / REDO SYSTEM
========================================================= */

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

let undoStack = [];
let redoStack = [];


/* =========================================================
   SAVE CURRENT STATE
========================================================= */

function getWatermarkState() {

    return JSON.stringify({

        text: textObject
            ? {
                x: textObject.x,
                y: textObject.y,
                rotation: textObject.rotation
            }
            : null,

        logo: logoObject
            ? {
                x: logoObject.x,
                y: logoObject.y,
                size: logoObject.size,
                rotation: logoObject.rotation
            }
            : null,

        textValue: watermarkText.value,

        fontSize: fontSize.value,

        opacity: opacity.value,

        rotation: rotation.value,

        logoSize: logoSize.value,

        logoOpacity: logoOpacity.value,

        logoRotation: logoRotation.value,

        bold: isBold,

        italic: isItalic

    });

}


/* =========================================================
   RESTORE STATE
========================================================= */

function restoreWatermarkState(state) {

    if (!state) return;

    const data =
        JSON.parse(state);


    /* TEXT */

    if (data.text) {

        textObject = {

            x: data.text.x,

            y: data.text.y,

            rotation:
                data.text.rotation

        };

    } else {

        textObject = null;

    }


    /* LOGO */

    if (data.logo) {

        logoObject = {

            x: data.logo.x,

            y: data.logo.y,

            size: data.logo.size,

            rotation:
                data.logo.rotation

        };

    } else {

        logoObject = null;

    }


    /* VALUES */

    watermarkText.value =
        data.textValue || "";


    fontSize.value =
        data.fontSize;


    opacity.value =
        data.opacity;


    rotation.value =
        data.rotation;


    logoSize.value =
        data.logoSize;


    logoOpacity.value =
        data.logoOpacity;


    logoRotation.value =
        data.logoRotation;


    isBold =
        data.bold;


    isItalic =
        data.italic;


    /* DISPLAY */

    fontSizeValue.textContent =
        fontSize.value + " px";


    opacityValue.textContent =
        opacity.value + "%";


    rotationValue.textContent =
        rotation.value + "°";


    logoSizeValue.textContent =
        logoSize.value + " px";


    logoOpacityValue.textContent =
        logoOpacity.value + "%";


    logoRotationValue.textContent =
        logoRotation.value + "°";


    activeObject =
        textObject ||
        logoObject ||
        null;


    draw();

    updateHistoryButtons();

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory() {

    const state =
        getWatermarkState();


    if (
        undoStack.length > 0 &&
        undoStack[
            undoStack.length - 1
        ] === state
    ) {

        return;

    }


    undoStack.push(state);


    if (undoStack.length > 50) {

        undoStack.shift();

    }


    redoStack = [];


    updateHistoryButtons();

}


/* =========================================================
   UNDO
========================================================= */

undoBtn.addEventListener(
    "click",
    function () {

        if (
            undoStack.length <= 1
        ) {

            return;

        }


        const current =
            getWatermarkState();


        redoStack.push(current);


        undoStack.pop();


        const previous =
            undoStack[
                undoStack.length - 1
            ];


        restoreWatermarkState(
            previous
        );

    }
);


/* =========================================================
   REDO
========================================================= */

redoBtn.addEventListener(
    "click",
    function () {

        if (
            redoStack.length === 0
        ) {

            return;

        }


        const current =
            getWatermarkState();


        undoStack.push(current);


        const next =
            redoStack.pop();


        restoreWatermarkState(
            next
        );

    }
);


/* =========================================================
   BUTTON STATUS
========================================================= */

function updateHistoryButtons() {

    undoBtn.disabled =
        undoStack.length <= 1;


    redoBtn.disabled =
        redoStack.length === 0;

}


/* =========================================================
   INITIAL STATE
========================================================= */

setTimeout(
    function () {

        undoStack = [
            getWatermarkState()
        ];

        redoStack = [];

        updateHistoryButtons();

    },
    200
);


/* =========================================================
   AUTOMATIC HISTORY
========================================================= */

let historyTimer = null;


function makeHistoryPoint() {

    clearTimeout(
        historyTimer
    );


    historyTimer =
        setTimeout(
            function () {

                saveHistory();

            },
            500
        );

}


/* =========================================================
   TRACK CONTROLS
========================================================= */

[
    watermarkText,
    fontSize,
    opacity,
    rotation,
    logoSize,
    logoOpacity,
    logoRotation
].forEach(
    function (element) {

        if (!element) return;

        element.addEventListener(
            "input",
            makeHistoryPoint
        );

    }
);


/* =========================================================
   TRACK TOUCH ACTIONS
========================================================= */

canvas.addEventListener(
    "touchend",
    function () {

        setTimeout(
            function () {

                saveHistory();

            },
            100
        );

    }
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    function (e) {

        /* CTRL + Z */

        if (
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === "z" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            undoBtn.click();

        }


        /* CTRL + Y */

        if (
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === "y"
        ) {

            e.preventDefault();

            redoBtn.click();

        }


        /* CTRL + SHIFT + Z */

        if (
            (e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            e.key.toLowerCase() === "z"
        ) {

            e.preventDefault();

            redoBtn.click();

        }

    }
);
