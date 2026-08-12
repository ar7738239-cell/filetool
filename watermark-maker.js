/* =========================================
   ADIYOGITOOLS WATERMARK MAKER PRO
   Complete JS
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const imageInput =
    document.getElementById("imageInput");

const logoInput =
    document.getElementById("logoInput");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const emptyMessage =
    document.getElementById("emptyMessage");

const imageName =
    document.getElementById("imageName");


/* TEXT */

const watermarkText =
    document.getElementById("watermarkText");

const fontFamily =
    document.getElementById("fontFamily");

const fontSize =
    document.getElementById("fontSize");

const fontSizeValue =
    document.getElementById("fontSizeValue");

const opacity =
    document.getElementById("opacity");

const opacityValue =
    document.getElementById("opacityValue");

const rotation =
    document.getElementById("rotation");

const rotationValue =
    document.getElementById("rotationValue");

const textColor =
    document.getElementById("textColor");


/* LOGO */

const logoSize =
    document.getElementById("logoSize");

const logoSizeValue =
    document.getElementById("logoSizeValue");

const logoOpacity =
    document.getElementById("logoOpacity");

const logoOpacityValue =
    document.getElementById("logoOpacityValue");

const logoRotation =
    document.getElementById("logoRotation");

const logoRotationValue =
    document.getElementById("logoRotationValue");


/* OTHER */

const tileWatermark =
    document.getElementById("tileWatermark");

const tileSpacing =
    document.getElementById("tileSpacing");

const tileSpacingValue =
    document.getElementById("tileSpacingValue");

const shadowToggle =
    document.getElementById("shadowToggle");

const outlineToggle =
    document.getElementById("outlineToggle");

const qualitySelect =
    document.getElementById("qualitySelect");


/* =========================================
   VARIABLES
========================================= */

let image = null;
let logo = null;

let textObject = null;
let logoObject = null;

let activeObject = null;

let isBold = false;
let isItalic = false;


/* DRAG */

let dragging = false;

let dragObject = null;

let dragStartX = 0;
let dragStartY = 0;

let objectStartX = 0;
let objectStartY = 0;


/* =========================================
   CANVAS TOUCH SETTINGS
========================================= */

canvas.style.touchAction = "none";

canvas.style.userSelect = "none";

canvas.style.webkitUserSelect = "none";

canvas.style.webkitTouchCallout = "none";


/* =========================================
   IMAGE UPLOAD
========================================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;


        if (!file.type.startsWith("image/")) {

            alert(
                "Please select a valid image."
            );

            this.value = "";

            return;
        }


        if (imageName) {

            imageName.textContent =
                file.name;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                const img =
                    new Image();


                img.onload =
                    function () {

                        image = img;


                        /* Canvas size */

                        canvas.width =
                            img.naturalWidth;

                        canvas.height =
                            img.naturalHeight;


                        /* Reset watermark */

                        textObject = null;

                        logoObject = null;

                        logo = null;

                        activeObject = null;

                        dragging = false;

                        dragObject = null;


                        /* Hide empty message */

                        if (emptyMessage) {

                            emptyMessage.style.display =
                                "none";

                        }


                        draw();

                    };


                img.onerror =
                    function () {

                        alert(
                            "Unable to load this image."
                        );

                    };


                img.src =
                    event.target.result;

            };


        reader.onerror =
            function () {

                alert(
                    "Unable to read this image."
                );

            };


        reader.readAsDataURL(file);

    }
);


/* =========================================
   LOGO UPLOAD
========================================= */

logoInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;


        if (!file.type.startsWith("image/")) {

            alert(
                "Please select a valid logo image."
            );

            this.value = "";

            return;
        }


        if (!image) {

            alert(
                "Please upload the main image first."
            );

            this.value = "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                const img =
                    new Image();


                img.onload =
                    function () {

                        logo = img;


                        let initialSize =
                            parseInt(
                                logoSize.value
                            );


                        if (!initialSize) {

                            initialSize = 150;

                        }


                        /* Maximum initial size */

                        const maxSize =
                            Math.min(
                                canvas.width,
                                canvas.height
                            ) * 0.35;


                        initialSize =
                            Math.min(
                                initialSize,
                                maxSize
                            );


                        logoSize.value =
                            Math.round(
                                initialSize
                            );


                        logoSizeValue.textContent =
                            Math.round(
                                initialSize
                            ) + " px";


                        logoObject = {

                            x:
                                canvas.width / 2,

                            y:
                                canvas.height / 2,

                            size:
                                initialSize,

                            rotation:
                                parseInt(
                                    logoRotation.value
                                ) || 0

                        };


                        activeObject =
                            logoObject;


                        draw();

                    };


                img.onerror =
                    function () {

                        alert(
                            "Unable to load the logo."
                        );

                    };


                img.src =
                    event.target.result;

            };


        reader.readAsDataURL(file);

    }
);


/* =========================================
   ADD TEXT
========================================= */

document
    .getElementById("addTextBtn")
    .addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            if (
                !watermarkText.value.trim()
            ) {

                alert(
                    "Please enter watermark text."
                );

                watermarkText.focus();

                return;
            }


            if (!textObject) {

                textObject = {

                    x:
                        canvas.width / 2,

                    y:
                        canvas.height / 2

                };

            }


            activeObject =
                textObject;


            draw();

        }
    );


/* =========================================
   REMOVE TEXT
========================================= */

document
    .getElementById("removeTextBtn")
    .addEventListener(
        "click",
        function () {

            if (
                activeObject === textObject
            ) {

                activeObject = null;

            }


            textObject = null;


            draw();

        }
    );


/* =========================================
   REMOVE LOGO
========================================= */

document
    .getElementById("removeLogoBtn")
    .addEventListener(
        "click",
        function () {

            if (
                activeObject === logoObject
            ) {

                activeObject = null;

            }


            logo = null;

            logoObject = null;


            logoInput.value = "";


            draw();

        }
    );


/* =========================================
   TEXT SIZE
========================================= */

fontSize.addEventListener(
    "input",
    function () {

        fontSizeValue.textContent =
            this.value + " px";

        draw();

    }
);


/* =========================================
   TEXT OPACITY
========================================= */

opacity.addEventListener(
    "input",
    function () {

        opacityValue.textContent =
            this.value + "%";

        draw();

    }
);


/* =========================================
   TEXT ROTATION
========================================= */

rotation.addEventListener(
    "input",
    function () {

        rotationValue.textContent =
            this.value + "°";

        draw();

    }
);


/* =========================================
   TEXT COLOR
========================================= */

textColor.addEventListener(
    "input",
    draw
);


/* =========================================
   FONT
========================================= */

fontFamily.addEventListener(
    "change",
    draw
);


/* =========================================
   LOGO SIZE
========================================= */

logoSize.addEventListener(
    "input",
    function () {

        logoSizeValue.textContent =
            this.value + " px";


        if (logoObject) {

            logoObject.size =
                parseInt(this.value);

        }


        draw();

    }
);


/* =========================================
   LOGO OPACITY
========================================= */

logoOpacity.addEventListener(
    "input",
    function () {

        logoOpacityValue.textContent =
            this.value + "%";

        draw();

    }
);


/* =========================================
   LOGO ROTATION
========================================= */

logoRotation.addEventListener(
    "input",
    function () {

        logoRotationValue.textContent =
            this.value + "°";


        if (logoObject) {

            logoObject.rotation =
                parseInt(this.value);

        }


        draw();

    }
);


/* =========================================
   TILE SPACING
========================================= */

tileSpacing.addEventListener(
    "input",
    function () {

        tileSpacingValue.textContent =
            this.value + " px";

        draw();

    }
);


/* =========================================
   TILE CHECKBOX
========================================= */

tileWatermark.addEventListener(
    "change",
    draw
);


/* =========================================
   SHADOW
========================================= */

shadowToggle.addEventListener(
    "change",
    draw
);


/* =========================================
   OUTLINE
========================================= */

outlineToggle.addEventListener(
    "change",
    draw
);


/* =========================================
   BOLD
========================================= */

document
    .getElementById("boldBtn")
    .addEventListener(
        "click",
        function () {

            isBold =
                !isBold;


            this.style.background =
                isBold
                    ? "#bfdbfe"
                    : "#e2e8f0";


            draw();

        }
    );


/* =========================================
   ITALIC
========================================= */

document
    .getElementById("italicBtn")
    .addEventListener(
        "click",
        function () {

            isItalic =
                !isItalic;


            this.style.background =
                isItalic
                    ? "#bfdbfe"
                    : "#e2e8f0";


            draw();

        }
    );


/* =========================================
   DRAW
========================================= */

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


    /* Text */

    if (
        textObject &&
        watermarkText.value.trim()
    ) {

        if (
            tileWatermark.checked
        ) {

            drawTextTile();

        } else {

            drawText(
                textObject.x,
                textObject.y
            );

        }

    }


    /* Logo */

    if (
        logo &&
        logoObject
    ) {

        if (
            tileWatermark.checked
        ) {

            drawLogoTile();

        } else {

            drawLogo(
                logoObject.x,
                logoObject.y
            );

        }

    }

}


/* =========================================
   DRAW TEXT
========================================= */

function drawText(x, y) {

    const size =
        parseInt(fontSize.value);


    const angle =
        parseInt(rotation.value);


    const alpha =
        parseInt(opacity.value) / 100;


    ctx.save();


    ctx.translate(
        x,
        y
    );


    ctx.rotate(
        angle * Math.PI / 180
    );


    ctx.globalAlpha =
        alpha;


    ctx.font =
        (isItalic ? "italic " : "") +
        (isBold ? "bold " : "") +
        size +
        "px " +
        fontFamily.value;


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    /* Shadow */

    if (
        shadowToggle.checked
    ) {

        ctx.shadowColor =
            "rgba(0,0,0,.55)";

        ctx.shadowBlur =
            10;

        ctx.shadowOffsetX =
            3;

        ctx.shadowOffsetY =
            3;

    }


    /* Outline */

    if (
        outlineToggle.checked
    ) {

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


/* =========================================
   DRAW LOGO
========================================= */

function drawLogo(x, y) {

    if (
        !logo ||
        !logoObject
    ) return;


    const size =
        logoObject.size;


    const ratio =
        logo.naturalWidth /
        logo.naturalHeight;


    const width =
        size;


    const height =
        size / ratio;


    ctx.save();


    ctx.translate(
        x,
        y
    );


    ctx.rotate(
        logoObject.rotation *
        Math.PI / 180
    );


    ctx.globalAlpha =
        parseInt(
            logoOpacity.value
        ) / 100;


    /* Shadow */

    if (
        shadowToggle.checked
    ) {

        ctx.shadowColor =
            "rgba(0,0,0,.4)";

        ctx.shadowBlur =
            12;

        ctx.shadowOffsetX =
            3;

        ctx.shadowOffsetY =
            3;

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


/* =========================================
   TEXT TILE
========================================= */

function drawTextTile() {

    const spacing =
        Math.max(
            50,
            parseInt(
                tileSpacing.value
            )
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

            drawText(
                x,
                y
            );

        }

    }

}


/* =========================================
   LOGO TILE
========================================= */

function drawLogoTile() {

    const spacing =
        Math.max(
            50,
            parseInt(
                tileSpacing.value
            )
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

            drawLogo(
                x,
                y
            );

        }

    }

}


/* =========================================
   POSITION BUTTONS
========================================= */

document
    .querySelectorAll(
        ".position-grid button"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (!activeObject) {

                        if (textObject) {

                            activeObject =
                                textObject;

                        } else if (logoObject) {

                            activeObject =
                                logoObject;

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


                    if (
                        pos.includes("left")
                    ) {

                        x = margin;

                    }


                    if (
                        pos.includes("right")
                    ) {

                        x =
                            canvas.width -
                            margin;

                    }


                    if (
                        pos.includes("top")
                    ) {

                        y = margin;

                    }


                    if (
                        pos.includes("bottom")
                    ) {

                        y =
                            canvas.height -
                            margin;

                    }


                    if (
                        pos === "top-center"
                    ) {

                        x =
                            canvas.width / 2;

                        y = margin;

                    }


                    if (
                        pos === "center"
                    ) {

                        x =
                            canvas.width / 2;

                        y =
                            canvas.height / 2;

                    }


                    if (
                        pos === "bottom-center"
                    ) {

                        x =
                            canvas.width / 2;

                        y =
                            canvas.height -
                            margin;

                    }


                    if (
                        pos === "center-left"
                    ) {

                        x = margin;

                        y =
                            canvas.height / 2;

                    }


                    if (
                        pos === "center-right"
                    ) {

                        x =
                            canvas.width -
                            margin;

                        y =
                            canvas.height / 2;

                    }


                    activeObject.x =
                        x;

                    activeObject.y =
                        y;


                    draw();

                }
            );

        }
    );


/* =========================================
   FIND TEXT OR LOGO
========================================= */

function findObjectAtPoint(
    x,
    y
) {


    /* =====================================
       LOGO
    ===================================== */

    if (
        logo &&
        logoObject
    ) {

        const width =
            logoObject.size;


        const ratio =
            logo.naturalHeight /
            logo.naturalWidth;


        const height =
            width * ratio;


        const padding =
            Math.max(
                30,
                width * 0.12
            );


        if (
            Math.abs(
                x - logoObject.x
            )
            <=
            width / 2 + padding

            &&

            Math.abs(
                y - logoObject.y
            )
            <=
            height / 2 + padding
        ) {

            return logoObject;

        }

    }


    /* =====================================
       TEXT
    ===================================== */

    if (
        textObject &&
        watermarkText.value.trim()
    ) {

        const size =
            parseInt(
                fontSize.value
            );


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
                size * 0.35
            );


        if (
            Math.abs(
                x - textObject.x
            )
            <=
            textWidth / 2 +
            padding

            &&

            Math.abs(
                y - textObject.y
            )
            <=
            size / 2 +
            padding
        ) {

            return textObject;

        }

    }


    return null;

}


/* =========================================
   CANVAS COORDINATES
========================================= */

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


/* =========================================
   START DRAG
========================================= */

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


/* =========================================
   MOVE DRAG
========================================= */

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


    const deltaX =
        point.x -
        dragStartX;


    const deltaY =
        point.y -
        dragStartY;


    dragObject.x =
        objectStartX +
        deltaX;


    dragObject.y =
        objectStartY +
        deltaY;


    /* Keep inside canvas */

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


/* =========================================
   STOP DRAG
========================================= */

function stopDrag() {

    dragging = false;

    dragObject = null;

}


/* =========================================
   MOBILE TOUCH START
========================================= */

canvas.addEventListener(
    "touchstart",
    function (e) {

        if (!e.touches.length)
            return;


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

    },
    {
        passive: false
    }
);


/* =========================================
   MOBILE TOUCH MOVE
========================================= */

canvas.addEventListener(
    "touchmove",
    function (e) {

        if (!dragging)
            return;


        if (!e.touches.length)
            return;


        e.preventDefault();


        const touch =
            e.touches[0];


        moveDrag(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


/* =========================================
   MOBILE TOUCH END
========================================= */

canvas.addEventListener(
    "touchend",
    function (e) {

        if (dragging) {

            e.preventDefault();

        }


        stopDrag();

    },
    {
        passive: false
    }
);


/* =========================================
   TOUCH CANCEL
========================================= */

canvas.addEventListener(
    "touchcancel",
    function () {

        stopDrag();

    }
);


/* =========================================
   DESKTOP MOUSE DOWN
========================================= */

canvas.addEventListener(
    "mousedown",
    function (e) {

        e.preventDefault();


        startDrag(
            e.clientX,
            e.clientY
        );

    }
);


/* =========================================
   DESKTOP MOUSE MOVE
========================================= */

window.addEventListener(
    "mousemove",
    function (e) {

        if (!dragging)
            return;


        e.preventDefault();


        moveDrag(
            e.clientX,
            e.clientY
        );

    }
);


/* =========================================
   DESKTOP MOUSE UP
========================================= */

window.addEventListener(
    "mouseup",
    function () {

        stopDrag();

    }
);


/* =========================================
   DOWNLOAD
========================================= */

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


            /* Remove any selection state */

            activeObject = null;


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


                    link.href =
                        url;


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


/* =========================================
   RESET
========================================= */

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


/* =========================================
   INITIAL VALUES
========================================= */

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


/* =========================================
   DONE
========================================= */

console.log(
    "AdiyogiTools Watermark Maker loaded successfully."
);


/* =========================================
   ADVANCED RESIZE + ROTATE
========================================= */

let editMode = null;
let editStartX = 0;
let editStartY = 0;
let editStartSize = 0;
let editStartRotation = 0;
let editStartAngle = 0;


/* ---------- OBJECT SIZE ---------- */

function getActiveSize() {

    if (activeObject === logoObject && logoObject) {

        return logoObject.size;

    }

    if (activeObject === textObject) {

        return parseInt(fontSize.value);

    }

    return 0;

}


/* ---------- OBJECT ROTATION ---------- */

function getActiveRotation() {

    if (activeObject === logoObject && logoObject) {

        return logoObject.rotation;

    }

    if (activeObject === textObject) {

        return parseInt(rotation.value);

    }

    return 0;

}


/* ---------- SET SIZE ---------- */

function setActiveSize(value) {

    value = Math.round(value);

    if (activeObject === logoObject && logoObject) {

        value = Math.max(30, Math.min(1000, value));

        logoObject.size = value;

        logoSize.value = value;

        logoSizeValue.textContent =
            value + " px";

    }

    else if (activeObject === textObject) {

        value = Math.max(15, Math.min(300, value));

        fontSize.value = value;

        fontSizeValue.textContent =
            value + " px";

    }

}


/* ---------- SET ROTATION ---------- */

function setActiveRotation(value) {

    value = Math.round(value);

    if (activeObject === logoObject && logoObject) {

        logoObject.rotation = value;

        logoRotation.value = value;

        logoRotationValue.textContent =
            value + "°";

    }

    else if (activeObject === textObject) {

        rotation.value = value;

        rotationValue.textContent =
            value + "°";

    }

}


/* =========================================
   TWO FINGER / CORNER RESIZE
========================================= */

canvas.addEventListener(
    "touchstart",
    function(e) {

        if (!activeObject) return;

        /*
         * Two fingers = resize
         */

        if (e.touches.length === 2) {

            e.preventDefault();

            editMode = "resize";

            const p1 = {

                x: e.touches[0].clientX,
                y: e.touches[0].clientY

            };

            const p2 = {

                x: e.touches[1].clientX,
                y: e.touches[1].clientY

            };

            editStartX =
                (p1.x + p2.x) / 2;

            editStartY =
                (p1.y + p2.y) / 2;

            editStartSize =
                getActiveSize();

            editStartRotation =
                getActiveRotation();

            editStartAngle =
                Math.atan2(
                    p2.y - p1.y,
                    p2.x - p1.x
                );

        }

    },
    {
        passive: false
    }
);


/* =========================================
   TWO FINGER RESIZE MOVE
========================================= */

canvas.addEventListener(
    "touchmove",
    function(e) {

        if (
            editMode !== "resize" ||
            e.touches.length !== 2
        ) {

            return;

        }

        e.preventDefault();

        const p1 = {

            x: e.touches[0].clientX,
            y: e.touches[0].clientY

        };

        const p2 = {

            x: e.touches[1].clientX,
            y: e.touches[1].clientY

        };


        const currentDistance =
            Math.sqrt(

                Math.pow(
                    p2.x - p1.x,
                    2
                )

                +

                Math.pow(
                    p2.y - p1.y,
                    2
                )

            );


        /*
         * Initial finger distance
         */

        if (!window.resizeInitialDistance) {

            window.resizeInitialDistance =
                currentDistance;

        }


        const scale =
            currentDistance /
            window.resizeInitialDistance;


        const newSize =
            editStartSize * scale;


        setActiveSize(newSize);

        draw();

    },
    {
        passive: false
    }
);


/* =========================================
   TOUCH END
========================================= */

canvas.addEventListener(
    "touchend",
    function() {

        editMode = null;

        window.resizeInitialDistance = null;

    }
);


/* =========================================
   DESKTOP SHIFT + DRAG = RESIZE
========================================= */

canvas.addEventListener(
    "mousedown",
    function(e) {

        if (
            !activeObject ||
            !e.shiftKey
        ) {

            return;

        }


        e.preventDefault();

        editMode = "desktopResize";

        editStartX = e.clientX;

        editStartY = e.clientY;

        editStartSize =
            getActiveSize();

    }
);


/* =========================================
   DESKTOP RESIZE MOVE
========================================= */

window.addEventListener(
    "mousemove",
    function(e) {

        if (
            editMode !==
            "desktopResize"
        ) {

            return;

        }


        const delta =
            e.clientX -
            editStartX;


        const newSize =
            editStartSize +
            delta;


        setActiveSize(newSize);

        draw();

    }
);


/* =========================================
   DESKTOP RESIZE END
========================================= */

window.addEventListener(
    "mouseup",
    function() {

        if (
            editMode ===
            "desktopResize"
        ) {

            editMode = null;

        }

    }
);


/* =========================================
   ROTATE USING ALT + DRAG
========================================= */

canvas.addEventListener(
    "mousedown",
    function(e) {

        if (
            !activeObject ||
            !e.altKey
        ) {

            return;

        }


        e.preventDefault();

        editMode = "rotate";

        editStartAngle =
            Math.atan2(
                e.clientY -
                canvas.getBoundingClientRect().top,
                
                e.clientX -
                canvas.getBoundingClientRect().left
            );

        editStartRotation =
            getActiveRotation();

    }
);


/* =========================================
   ROTATION MOVE
========================================= */

window.addEventListener(
    "mousemove",
    function(e) {

        if (
            editMode !==
            "rotate"
        ) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const point = {

            x:
                e.clientX -
                rect.left,

            y:
                e.clientY -
                rect.top

        };


        const angle =
            Math.atan2(
                point.y,
                point.x
            );


        const delta =
            (
                angle -
                editStartAngle
            )
            *
            180 /
            Math.PI;


        setActiveRotation(
            editStartRotation +
            delta
        );


        draw();

    }
);


/* =========================================
   ROTATION END
========================================= */

window.addEventListener(
    "mouseup",
    function() {

        if (
            editMode ===
            "rotate"
        ) {

            editMode = null;

        }

    }
);

