/* =========================================
   WATERMARK MAKER PRO - ADVANCED EDITOR
========================================= */

const imageInput = document.getElementById("imageInput");
const logoInput = document.getElementById("logoInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const emptyMessage = document.getElementById("emptyMessage");
const imageName = document.getElementById("imageName");

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

let image = null;
let logo = null;

let textObject = null;
let logoObject = null;

let activeObject = null;

let dragging = false;
let dragMode = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

let isBold = false;
let isItalic = false;

let startDistance = 0;
let startSize = 0;

let startAngle = 0;
let startRotation = 0;


/* =========================================
   IMAGE UPLOAD
========================================= */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        this.value = "";

        return;
    }

    imageName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function (event) {

        const img = new Image();

        img.onload = function () {

            image = img;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            emptyMessage.style.display = "none";

            textObject = null;
            logoObject = null;
            logo = null;
            activeObject = null;

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


/* =========================================
   LOGO UPLOAD
========================================= */

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

            const initialSize =
                Math.min(
                    parseInt(logoSize.value),
                    canvas.width * 0.35
                );

            logoSize.value = initialSize;

            logoSizeValue.textContent =
                initialSize + " px";

            logoObject = {

                x: canvas.width / 2,
                y: canvas.height / 2,
                size: initialSize,
                rotation: parseInt(logoRotation.value)

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


/* =========================================
   ADD / UPDATE TEXT
========================================= */

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
            y: canvas.height / 2

        };

    }

    activeObject = textObject;

    draw();

});


/* =========================================
   REMOVE TEXT
========================================= */

document
.getElementById("removeTextBtn")
.addEventListener("click", function () {

    if (activeObject === textObject) {

        textObject = null;
        activeObject = null;

    } else {

        textObject = null;

    }

    draw();

});


/* =========================================
   REMOVE LOGO
========================================= */

document
.getElementById("removeLogoBtn")
.addEventListener("click", function () {

    if (activeObject === logoObject) {

        logoObject = null;
        logo = null;
        activeObject = null;

    } else {

        logoObject = null;
        logo = null;

    }

    logoInput.value = "";

    draw();

});


/* =========================================
   TEXT CONTROLS
========================================= */

fontSize.addEventListener("input", function () {

    fontSizeValue.textContent =
        this.value + " px";

    draw();

});


opacity.addEventListener("input", function () {

    opacityValue.textContent =
        this.value + "%";

    draw();

});


rotation.addEventListener("input", function () {

    rotationValue.textContent =
        this.value + "°";

    draw();

});


/* =========================================
   LOGO CONTROLS
========================================= */

logoSize.addEventListener("input", function () {

    logoSizeValue.textContent =
        this.value + " px";

    if (logoObject) {

        logoObject.size =
            parseInt(this.value);

    }

    draw();

});


logoOpacity.addEventListener("input", function () {

    logoOpacityValue.textContent =
        this.value + "%";

    draw();

});


logoRotation.addEventListener("input", function () {

    logoRotationValue.textContent =
        this.value + "°";

    if (logoObject) {

        logoObject.rotation =
            parseInt(this.value);

    }

    draw();

});


/* =========================================
   TILE
========================================= */

tileSpacing.addEventListener("input", function () {

    tileSpacingValue.textContent =
        this.value + " px";

    draw();

});


tileWatermark.addEventListener(
    "change",
    draw
);


/* =========================================
   TEXT SETTINGS
========================================= */

watermarkText.addEventListener(
    "input",
    draw
);

fontFamily.addEventListener(
    "change",
    draw
);

textColor.addEventListener(
    "input",
    draw
);

shadowToggle.addEventListener(
    "change",
    draw
);

outlineToggle.addEventListener(
    "change",
    draw
);


/* =========================================
   BOLD
========================================= */

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


/* =========================================
   ITALIC
========================================= */

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


/* =========================================
   DRAW
========================================= */

function draw(showSelection = true) {

    if (!image) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


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


    if (logo && logoObject) {

        if (tileWatermark.checked) {

            drawLogoTile();

        } else {

            drawLogo(
                logoObject.x,
                logoObject.y
            );

        }

    }


    /*
     * Selection UI is shown only
     * while editing.
     */

    if (
        showSelection &&
        activeObject &&
        !tileWatermark.checked
    ) {

        drawSelectionBox(
            activeObject
        );

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


    if (shadowToggle.checked) {

        ctx.shadowColor =
            "rgba(0,0,0,.55)";

        ctx.shadowBlur = 10;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

    }


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
        parseInt(logoOpacity.value) / 100;


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


/* =========================================
   TEXT TILE
========================================= */

function drawTextTile() {

    const spacing =
        parseInt(tileSpacing.value);

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


/* =========================================
   LOGO TILE
========================================= */

function drawLogoTile() {

    const spacing =
        parseInt(tileSpacing.value);

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


/* =========================================
   OBJECT DIMENSIONS
========================================= */

function getObjectBounds(obj) {

    if (obj === logoObject && logo) {

        const width =
            logoObject.size;

        const height =
            width *
            (
                logo.naturalHeight /
                logo.naturalWidth
            );

        return {

            width: width,
            height: height,
            rotation: logoObject.rotation

        };

    }


    if (
        obj === textObject &&
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

        const width =
            ctx.measureText(
                watermarkText.value
            ).width;

        ctx.restore();

        return {

            width: width + 20,
            height: size * 1.25,
            rotation: parseInt(rotation.value)

        };

    }

    return {

        width: 0,
        height: 0,
        rotation: 0

    };

}


/* =========================================
   SELECTION BOX
========================================= */

function drawSelectionBox(obj) {

    const bounds =
        getObjectBounds(obj);

    if (
        !bounds.width ||
        !bounds.height
    ) {

        return;

    }

    const x = obj.x;
    const y = obj.y;

    const angle =
        bounds.rotation *
        Math.PI / 180;

    const hw =
        bounds.width / 2;

    const hh =
        bounds.height / 2;


    const points = [

        rotatePoint(
            x - hw,
            y - hh,
            x,
            y,
            angle
        ),

        rotatePoint(
            x + hw,
            y - hh,
            x,
            y,
            angle
        ),

        rotatePoint(
            x + hw,
            y + hh,
            x,
            y,
            angle
        ),

        rotatePoint(
            x - hw,
            y + hh,
            x,
            y,
            angle
        )

    ];


    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
        points[0].x,
        points[0].y
    );

    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        ctx.lineTo(
            points[i].x,
            points[i].y
        );

    }

    ctx.closePath();

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 3;

    ctx.setLineDash([8, 5]);

    ctx.stroke();

    ctx.setLineDash([]);


    /*
     * Corner handles
     */

    points.forEach(function (p) {

        drawHandle(
            p.x,
            p.y
        );

    });


    /*
     * Rotation handle
     */

    const topCenter =
        rotatePoint(
            x,
            y - hh,
            x,
            y,
            angle
        );

    const rotatePointPosition =
        rotatePoint(
            x,
            y - hh - 55,
            x,
            y,
            angle
        );


    ctx.beginPath();

    ctx.moveTo(
        topCenter.x,
        topCenter.y
    );

    ctx.lineTo(
        rotatePointPosition.x,
        rotatePointPosition.y
    );

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 3;

    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
        rotatePointPosition.x,
        rotatePointPosition.y,
        11,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#2563eb";

    ctx.fill();

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 3;

    ctx.stroke();


    ctx.restore();

}


/* =========================================
   HANDLE
========================================= */

function drawHandle(x, y) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.fill();

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 3;

    ctx.stroke();

}


/* =========================================
   ROTATE POINT
========================================= */

function rotatePoint(
    px,
    py,
    cx,
    cy,
    angle
) {

    const dx =
        px - cx;

    const dy =
        py - cy;

    return {

        x:
            cx +
            dx * Math.cos(angle) -
            dy * Math.sin(angle),

        y:
            cy +
            dx * Math.sin(angle) +
            dy * Math.cos(angle)

    };

}


/* =========================================
   POSITION BUTTONS
========================================= */

document
.querySelectorAll(".position-grid button")
.forEach(function (button) {

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

        }
    );

});


/* =========================================
   CANVAS POINTER DOWN
========================================= */

/* =========================================
   MOBILE DRAG TEXT + LOGO
========================================= */

canvas.style.touchAction = "none";

canvas.addEventListener("pointerdown", function(e){

    if(!image) return;

    e.preventDefault();

    const point = getCanvasPoint(e);

    const selected = findObjectAtPoint(
        point.x,
        point.y
    );

    if(!selected) return;

    activeObject = selected;
    dragObject = selected;

    dragOffsetX =
        point.x - selected.x;

    dragOffsetY =
        point.y - selected.y;

    dragging = true;

    canvas.setPointerCapture(e.pointerId);

});


canvas.addEventListener("pointermove", function(e){

    if(!dragging || !dragObject) return;

    e.preventDefault();

    const point = getCanvasPoint(e);

    dragObject.x =
        point.x - dragOffsetX;

    dragObject.y =
        point.y - dragOffsetY;

    draw();

});


canvas.addEventListener("pointerup", function(e){

    e.preventDefault();

    dragging = false;
    dragObject = null;

    try{
        canvas.releasePointerCapture(e.pointerId);
    }catch(err){}

});


canvas.addEventListener("pointercancel", function(){

    dragging = false;
    dragObject = null;

});

/* =========================================
   POINTER MOVE
========================================= */

canvas.addEventListener(
    "pointermove",
    function (e) {

        if (
            !dragging ||
            !activeObject
        ) {

            return;

        }

        const point =
            getCanvasPoint(e);


        /* MOVE */

        if (dragMode === "move") {

            activeObject.x =
                point.x - dragOffsetX;

            activeObject.y =
                point.y - dragOffsetY;

            keepInsideCanvas(
                activeObject
            );

        }


        /* RESIZE */

        else if (
            dragMode === "resize"
        ) {

            const currentDistance =
                distance(
                    point,
                    {
                        x: activeObject.x,
                        y: activeObject.y
                    }
                );

            let newSize =
                startSize *
                (
                    currentDistance /
                    startDistance
                );


            if (activeObject === logoObject) {

                newSize =
                    Math.max(
                        30,
                        Math.min(
                            1000,
                            newSize
                        )
                    );

                logoObject.size =
                    newSize;

                logoSize.value =
                    Math.round(newSize);

                logoSizeValue.textContent =
                    Math.round(newSize) +
                    " px";

            }


            else {

                newSize =
                    Math.max(
                        15,
                        Math.min(
                            300,
                            newSize
                        )
                    );

                fontSize.value =
                    Math.round(newSize);

                fontSizeValue.textContent =
                    Math.round(newSize) +
                    " px";

            }

        }


        /* ROTATE */

        else if (
            dragMode === "rotate"
        ) {

            const currentAngle =
                Math.atan2(
                    point.y -
                    activeObject.y,

                    point.x -
                    activeObject.x
                );


            const delta =
                (
                    currentAngle -
                    startAngle
                )
                *
                180 /
                Math.PI;


            let newRotation =
                startRotation +
                delta;


            if (
                activeObject ===
                logoObject
            ) {

                logoObject.rotation =
                    newRotation;

                logoRotation.value =
                    Math.round(newRotation);

                logoRotationValue.textContent =
                    Math.round(newRotation) +
                    "°";

            }


            else {

                rotation.value =
                    Math.round(newRotation);

                rotationValue.textContent =
                    Math.round(newRotation) +
                    "°";

            }

        }


        draw();

        e.preventDefault();

    }
);


/* =========================================
   POINTER UP
========================================= */

function stopPointer(e) {

    dragging = false;

    dragMode = null;

    try {

        canvas.releasePointerCapture(
            e.pointerId
        );

    } catch (error) {}

}


canvas.addEventListener(
    "pointerup",
    stopPointer
);

canvas.addEventListener(
    "pointercancel",
    stopPointer
);


/* =========================================
   DETECT HANDLE
========================================= */

function detectHandle(
    x,
    y,
    obj
) {

    const bounds =
        getObjectBounds(obj);

    const angle =
        bounds.rotation *
        Math.PI /
        180;


    const hw =
        bounds.width / 2;

    const hh =
        bounds.height / 2;


    const corners = [

        {
            name: "resize",
            point:
                rotatePoint(
                    obj.x - hw,
                    obj.y - hh,
                    obj.x,
                    obj.y,
                    angle
                )
        },

        {
            name: "resize",
            point:
                rotatePoint(
                    obj.x + hw,
                    obj.y - hh,
                    obj.x,
                    obj.y,
                    angle
                )
        },

        {
            name: "resize",
            point:
                rotatePoint(
                    obj.x + hw,
                    obj.y + hh,
                    obj.x,
                    obj.y,
                    angle
                )
        },

        {
            name: "resize",
            point:
                rotatePoint(
                    obj.x - hw,
                    obj.y + hh,
                    obj.x,
                    obj.y,
                    angle
                )
        }

    ];


    for (
        let i = 0;
        i < corners.length;
        i++
    ) {

        if (
            distance(
                {
                    x: x,
                    y: y
                },
                corners[i].point
            ) < 30
        ) {

            return "resize";

        }

    }


    const rotatePosition =
        rotatePoint(
            obj.x,
            obj.y - hh - 55,
            obj.x,
            obj.y,
            angle
        );


    if (
        distance(
            {
                x: x,
                y: y
            },
            rotatePosition
        ) < 30
    ) {

        return "rotate";

    }


    return null;

}


/* =========================================
   FIND OBJECT
========================================= */

function findObjectAtPoint(x, y) {

    /*
     * Logo gets priority.
     */

    if (
        logo &&
        logoObject
    ) {

        const bounds =
            getObjectBounds(
                logoObject
            );


        const angle =
            -bounds.rotation *
            Math.PI /
            180;


        const local =
            rotatePoint(
                x,
                y,
                logoObject.x,
                logoObject.y,
                angle
            );


        if (
            Math.abs(
                local.x -
                logoObject.x
            )
            <=
            bounds.width / 2 + 25

            &&

            Math.abs(
                local.y -
                logoObject.y
            )
            <=
            bounds.height / 2 + 25
        ) {

            return logoObject;

        }

    }


    /*
     * Text
     */

    if (
        textObject &&
        watermarkText.value.trim()
    ) {

        const bounds =
            getObjectBounds(
                textObject
            );


        const angle =
            -bounds.rotation *
            Math.PI /
            180;


        const local =
            rotatePoint(
                x,
                y,
                textObject.x,
                textObject.y,
                angle
            );


        if (
            Math.abs(
                local.x -
                textObject.x
            )
            <=
            bounds.width / 2 + 25

            &&

            Math.abs(
                local.y -
                textObject.y
            )
            <=
            bounds.height / 2 + 25
        ) {

            return textObject;

        }

    }


    return null;

}


/* =========================================
   KEEP OBJECT INSIDE IMAGE
========================================= */

function keepInsideCanvas(obj) {

    obj.x =
        Math.max(
            0,
            Math.min(
                canvas.width,
                obj.x
            )
        );

    obj.y =
        Math.max(
            0,
            Math.min(
                canvas.height,
                obj.y
            )
        );

}


/* =========================================
   DISTANCE
========================================= */

function distance(a, b) {

    return Math.sqrt(

        Math.pow(
            a.x - b.x,
            2
        )

        +

        Math.pow(
            a.y - b.y,
            2
        )

    );

}


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


        /*
         * IMPORTANT:
         * Draw without selection box.
         */

        draw(false);


        const quality =
            parseFloat(
                qualitySelect.value
            );


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


                const a =
                    document.createElement(
                        "a"
                    );


                a.href = url;

                a.download =
                    "adiyogitools-watermarked-image.jpg";


                document.body.appendChild(a);

                a.click();

                a.remove();


                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );


                /*
                 * Bring editing UI back.
                 */

                draw(true);

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

        dragMode = null;


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

    }
);


/* =========================================
   INITIAL VALUES
========================================= */

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

tileSpacingValue.textContent =
    tileSpacing.value + " px";
