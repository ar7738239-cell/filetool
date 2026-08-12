/* =========================================================
   ADIYOGITOOLS WATERMARK MAKER PRO
   MULTI-LAYER EDITOR
   ---------------------------------------------------------
   1 Finger  = Select + Drag
   2 Fingers = Resize + Rotate
   Multiple  = Text + Logo Layers
   Undo/Redo = Included
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

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


/* TEXT CONTROLS */

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


/* LOGO CONTROLS */

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


/* HISTORY */

const undoBtn =
    document.getElementById("undoBtn");

const redoBtn =
    document.getElementById("redoBtn");


/* =========================================================
   MAIN VARIABLES
========================================================= */

let image = null;


/*
 * ALL TEXT LAYERS
 */

let textLayers = [];


/*
 * ALL LOGO LAYERS
 */

let logoLayers = [];


/*
 * Currently selected layer
 */

let activeObject = null;


/*
 * Unique layer ID
 */

let nextLayerId = 1;


/*
 * Text style
 */

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
   TWO FINGER GESTURE
========================================================= */

let gestureActive = false;

let gestureStartDistance = 0;

let gestureStartAngle = 0;

let gestureStartSize = 0;

let gestureStartRotation = 0;


/* =========================================================
   UNDO / REDO
========================================================= */

let undoStack = [];

let redoStack = [];

let historyLock = false;

let historyTimer = null;


/* =========================================================
   CANVAS TOUCH SETTINGS
========================================================= */

canvas.style.touchAction = "none";

canvas.style.userSelect = "none";

canvas.style.webkitUserSelect = "none";

canvas.style.webkitTouchCallout = "none";


/* =========================================================
   HELPER - CREATE ID
========================================================= */

function createLayerId() {

    return nextLayerId++;

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

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


                        canvas.width =
                            img.naturalWidth;

                        canvas.height =
                            img.naturalHeight;


                        /*
                         * New image =
                         * remove all old layers
                         */

                        textLayers = [];

                        logoLayers = [];

                        activeObject = null;

                        nextLayerId = 1;


                        dragging = false;

                        dragObject = null;

                        gestureActive = false;


                        if (emptyMessage) {

                            emptyMessage.style.display =
                                "none";

                        }


                        undoStack = [];

                        redoStack = [];


                        saveHistory();


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


/* =========================================================
   LOGO UPLOAD
   ---------------------------------------------------------
   Every upload creates a NEW logo layer.
========================================================= */

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


                        let size =
                            parseFloat(
                                logoSize.value
                            );


                        if (
                            !size ||
                            size <= 0
                        ) {

                            size = 150;

                        }


                        const maximum =
                            Math.min(
                                canvas.width,
                                canvas.height
                            ) * 0.35;


                        size =
                            Math.min(
                                size,
                                maximum
                            );


                        const logoObject = {

                            id:
                                createLayerId(),

                            type:
                                "logo",

                            image:
                                img,

                            x:
                                canvas.width / 2,

                            y:
                                canvas.height / 2,

                            size:
                                size,

                            rotation:
                                parseFloat(
                                    logoRotation.value
                                ) || 0,

                            opacity:
                                parseFloat(
                                    logoOpacity.value
                                ) || 100

                        };


                        logoLayers.push(
                            logoObject
                        );


                        activeObject =
                            logoObject;


                        /*
                         * Reset file input so
                         * same logo can be
                         * uploaded again.
                         */

                        logoInput.value = "";


                        saveHistory();


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


/* =========================================================
   ADD TEXT
   ---------------------------------------------------------
   Every click creates a NEW text layer.
========================================================= */

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


        const value =
            watermarkText.value.trim();


        if (!value) {

            alert(
                "Please enter watermark text."
            );

            watermarkText.focus();

            return;

        }


        const textObject = {

            id:
                createLayerId(),

            type:
                "text",

            text:
                value,

            x:
                canvas.width / 2,

            y:
                canvas.height / 2,

            fontSize:
                parseFloat(
                    fontSize.value
                ) || 50,

            fontFamily:
                fontFamily.value,

            color:
                textColor.value,

            opacity:
                parseFloat(
                    opacity.value
                ) || 100,

            rotation:
                parseFloat(
                    rotation.value
                ) || 0,

            bold:
                isBold,

            italic:
                isItalic

        };


        textLayers.push(
            textObject
        );


        activeObject =
            textObject;


        /*
         * Change text input slightly
         * so user knows new layer
         * is being added.
         */

        saveHistory();


        draw();

    }
);


/* =========================================================
   REMOVE TEXT
   ---------------------------------------------------------
   Removes ONLY selected text.
========================================================= */

document
.getElementById("removeTextBtn")
.addEventListener(
    "click",
    function () {

        if (
            !activeObject ||
            activeObject.type !== "text"
        ) {

            alert(
                "Please select a text first."
            );

            return;

        }


        const index =
            textLayers.indexOf(
                activeObject
            );


        if (index !== -1) {

            textLayers.splice(
                index,
                1
            );

        }


        activeObject = null;


        saveHistory();

        draw();

    }
);


/* =========================================================
   REMOVE LOGO
   ---------------------------------------------------------
   Removes ONLY selected logo.
========================================================= */

document
.getElementById("removeLogoBtn")
.addEventListener(
    "click",
    function () {

        if (
            !activeObject ||
            activeObject.type !== "logo"
        ) {

            alert(
                "Please select a logo first."
            );

            return;

        }


        const index =
            logoLayers.indexOf(
                activeObject
            );


        if (index !== -1) {

            logoLayers.splice(
                index,
                1
            );

        }


        activeObject = null;


        saveHistory();

        draw();

    }
);


/* =========================================================
   TEXT INPUT
   ---------------------------------------------------------
   Changing input updates selected text.
========================================================= */

watermarkText.addEventListener(
    "input",
    function () {

        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.text =
                this.value;

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   FONT FAMILY
========================================================= */

fontFamily.addEventListener(
    "change",
    function () {

        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.fontFamily =
                this.value;

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   TEXT SIZE
========================================================= */

fontSize.addEventListener(
    "input",
    function () {

        fontSizeValue.textContent =
            this.value + " px";


        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.fontSize =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   TEXT OPACITY
========================================================= */

opacity.addEventListener(
    "input",
    function () {

        opacityValue.textContent =
            this.value + "%";


        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.opacity =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   TEXT ROTATION
========================================================= */

rotation.addEventListener(
    "input",
    function () {

        rotationValue.textContent =
            this.value + "°";


        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.rotation =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   TEXT COLOR
========================================================= */

textColor.addEventListener(
    "input",
    function () {

        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.color =
                this.value;

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   LOGO SIZE
========================================================= */

logoSize.addEventListener(
    "input",
    function () {

        logoSizeValue.textContent =
            this.value + " px";


        if (
            activeObject &&
            activeObject.type === "logo"
        ) {

            activeObject.size =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   LOGO OPACITY
========================================================= */

logoOpacity.addEventListener(
    "input",
    function () {

        logoOpacityValue.textContent =
            this.value + "%";


        if (
            activeObject &&
            activeObject.type === "logo"
        ) {

            activeObject.opacity =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   LOGO ROTATION
========================================================= */

logoRotation.addEventListener(
    "input",
    function () {

        logoRotationValue.textContent =
            this.value + "°";


        if (
            activeObject &&
            activeObject.type === "logo"
        ) {

            activeObject.rotation =
                parseFloat(
                    this.value
                );

        }


        draw();

        scheduleHistory();

    }
);


/* =========================================================
   TILE SPACING
========================================================= */

tileSpacing.addEventListener(
    "input",
    function () {

        tileSpacingValue.textContent =
            this.value + " px";


        draw();

    }
);


/* =========================================================
   BOLD
========================================================= */

document
.getElementById("boldBtn")
.addEventListener(
    "click",
    function () {

        isBold =
            !isBold;


        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.bold =
                isBold;

        }


        this.style.background =
            isBold
                ? "#bfdbfe"
                : "#e2e8f0";


        draw();

        saveHistory();

    }
);


/* =========================================================
   ITALIC
========================================================= */

document
.getElementById("italicBtn")
.addEventListener(
    "click",
    function () {

        isItalic =
            !isItalic;


        if (
            activeObject &&
            activeObject.type === "text"
        ) {

            activeObject.italic =
                isItalic;

        }


        this.style.background =
            isItalic
                ? "#bfdbfe"
                : "#e2e8f0";


        draw();

        saveHistory();

    }
);


/* =========================================================
   SHADOW / OUTLINE / TILE
========================================================= */

shadowToggle.addEventListener(
    "change",
    function () {

        draw();

        saveHistory();

    }
);


outlineToggle.addEventListener(
    "change",
    function () {

        draw();

        saveHistory();

    }
);


tileWatermark.addEventListener(
    "change",
    function () {

        draw();

        saveHistory();

    }
);


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


    /*
     * Main image
     */

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
     * Text layers
     */

    textLayers.forEach(
        function (obj) {

            if (
                !obj.text ||
                !obj.text.trim()
            ) {

                return;

            }


            if (
                tileWatermark.checked
            ) {

                drawTextTile(
                    obj
                );

            } else {

                drawText(
                    obj
                );

            }

        }
    );


    /*
     * Logo layers
     */

    logoLayers.forEach(
        function (obj) {

            if (!obj.image) return;


            if (
                tileWatermark.checked
            ) {

                drawLogoTile(
                    obj
                );

            } else {

                drawLogo(
                    obj
                );

            }

        }
    );

}


/* =========================================================
   DRAW TEXT LAYER
========================================================= */

function drawText(obj) {

    const size =
        obj.fontSize;


    ctx.save();


    ctx.translate(
        obj.x,
        obj.y
    );


    ctx.rotate(
        obj.rotation *
        Math.PI /
        180
    );


    ctx.globalAlpha =
        obj.opacity / 100;


    ctx.font =
        (obj.italic
            ? "italic "
            : "") +

        (obj.bold
            ? "bold "
            : "") +

        size +
        "px " +
        obj.fontFamily;


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    /*
     * Shadow
     */

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


    /*
     * Outline
     */

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
            obj.text,
            0,
            0
        );

    }


    /*
     * Text
     */

    ctx.fillStyle =
        obj.color;


    ctx.fillText(
        obj.text,
        0,
        0
    );


    ctx.restore();

}


/* =========================================================
   DRAW LOGO LAYER
========================================================= */

function drawLogo(obj) {

    if (!obj.image) return;


    const width =
        obj.size;


    const ratio =
        obj.image.naturalWidth /
        obj.image.naturalHeight;


    const height =
        width / ratio;


    ctx.save();


    ctx.translate(
        obj.x,
        obj.y
    );


    ctx.rotate(
        obj.rotation *
        Math.PI /
        180
    );


    ctx.globalAlpha =
        obj.opacity / 100;


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
        obj.image,
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

function drawTextTile(obj) {

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

            const temp = {

                ...obj,

                x: x,

                y: y

            };


            drawText(
                temp
            );

        }

    }

}


/* =========================================================
   LOGO TILE
========================================================= */

function drawLogoTile(obj) {

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

            const temp = {

                ...obj,

                x: x,

                y: y

            };


            drawLogo(
                temp
            );

        }

    }

}


/* =========================================================
   FIND OBJECT
   ---------------------------------------------------------
   Last added layer is checked first.
========================================================= */

function findObjectAtPoint(
    x,
    y
) {


    /*
     * LOGOS
     */

    for (
        let i = logoLayers.length - 1;
        i >= 0;
        i--
    ) {

        const obj =
            logoLayers[i];


        const width =
            obj.size;


        const height =
            width *
            (
                obj.image.naturalHeight /
                obj.image.naturalWidth
            );


        const padding =
            Math.max(
                30,
                width * 0.12
            );


        if (
            Math.abs(
                x - obj.x
            )
            <=
            width / 2 + padding

            &&

            Math.abs(
                y - obj.y
            )
            <=
            height / 2 + padding
        ) {

            return obj;

        }

    }


    /*
     * TEXTS
     */

    for (
        let i = textLayers.length - 1;
        i >= 0;
        i--
    ) {

        const obj =
            textLayers[i];


        if (
            !obj.text ||
            !obj.text.trim()
        ) {

            continue;

        }


        ctx.save();


        ctx.font =
            (obj.italic
                ? "italic "
                : "") +

            (obj.bold
                ? "bold "
                : "") +

            obj.fontSize +
            "px " +
            obj.fontFamily;


        const width =
            ctx.measureText(
                obj.text
            ).width;


        ctx.restore();


        const padding =
            Math.max(
                40,
                obj.fontSize * 0.4
            );


        if (
            Math.abs(
                x - obj.x
            )
            <=
            width / 2 + padding

            &&

            Math.abs(
                y - obj.y
            )
            <=
            obj.fontSize / 2 +
            padding
        ) {

            return obj;

        }

    }


    return null;

}


/* =========================================================
   CANVAS POINT
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


    /*
     * Load selected object's
     * settings into controls.
     */

    loadObjectControls(
        selected
    );


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


    draw();


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
        objectStartX +
        dx;


    dragObject.y =
        objectStartY +
        dy;


    /*
     * Keep inside canvas
     */

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

    if (dragging) {

        saveHistory();

    }


    dragging = false;

    dragObject = null;

}


/* =========================================================
   LOAD SELECTED OBJECT SETTINGS
========================================================= */

function loadObjectControls(obj) {

    if (!obj) return;


    if (
        obj.type === "text"
    ) {

        watermarkText.value =
            obj.text;


        fontSize.value =
            obj.fontSize;


        fontSizeValue.textContent =
            obj.fontSize + " px";


        opacity.value =
            obj.opacity;


        opacityValue.textContent =
            obj.opacity + "%";


        rotation.value =
            obj.rotation;


        rotationValue.textContent =
            obj.rotation + "°";


        textColor.value =
            obj.color;


        isBold =
            obj.bold;


        isItalic =
            obj.italic;


        if (fontFamily) {

            fontFamily.value =
                obj.fontFamily;

        }


        const boldBtn =
            document.getElementById(
                "boldBtn"
            );


        const italicBtn =
            document.getElementById(
                "italicBtn"
            );


        if (boldBtn) {

            boldBtn.style.background =
                isBold
                    ? "#bfdbfe"
                    : "#e2e8f0";

        }


        if (italicBtn) {

            italicBtn.style.background =
                isItalic
                    ? "#bfdbfe"
                    : "#e2e8f0";

        }

    }


    if (
        obj.type === "logo"
    ) {

        logoSize.value =
            obj.size;


        logoSizeValue.textContent =
            Math.round(
                obj.size
            ) +
            " px";


        logoOpacity.value =
            obj.opacity;


        logoOpacityValue.textContent =
            obj.opacity +
            "%";


        logoRotation.value =
            obj.rotation;


        logoRotationValue.textContent =
            Math.round(
                obj.rotation
            ) +
            "°";

    }

}


/* =========================================================
   FINGER DISTANCE
========================================================= */

function getFingerDistance(
    t1,
    t2
) {

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

function getFingerAngle(
    t1,
    t2
) {

    return Math.atan2(
        t2.clientY -
        t1.clientY,

        t2.clientX -
        t1.clientX
    )
    *
    180 /
    Math.PI;

}


/* =========================================================
   ACTIVE SIZE
========================================================= */

function getActiveSize() {

    if (
        activeObject &&
        activeObject.type === "logo"
    ) {

        return activeObject.size;

    }


    if (
        activeObject &&
        activeObject.type === "text"
    ) {

        return activeObject.fontSize;

    }


    return 100;

}


/* =========================================================
   SET ACTIVE SIZE
========================================================= */

function setActiveSize(
    value
) {

    value =
        Math.round(
            value
        );


    if (
        activeObject &&
        activeObject.type === "logo"
    ) {

        value =
            Math.max(
                30,
                Math.min(
                    1000,
                    value
                )
            );


        activeObject.size =
            value;


        logoSize.value =
            value;


        logoSizeValue.textContent =
            value +
            " px";

    }


    if (
        activeObject &&
        activeObject.type === "text"
    ) {

        value =
            Math.max(
                15,
                Math.min(
                    300,
                    value
                )
            );


        activeObject.fontSize =
            value;


        fontSize.value =
            value;


        fontSizeValue.textContent =
            value +
            " px";

    }

}


/* =========================================================
   ACTIVE ROTATION
========================================================= */

function getActiveRotation() {

    if (
        activeObject
    ) {

        return (
            parseFloat(
                activeObject.rotation
            ) || 0
        );

    }


    return 0;

}


/* =========================================================
   SET ACTIVE ROTATION
========================================================= */

function setActiveRotation(
    value
) {

    value =
        Math.round(
            value
        );


    if (
        activeObject
    ) {

        activeObject.rotation =
            value;

    }


    if (
        activeObject &&
        activeObject.type === "text"
    ) {

        rotation.value =
            value;


        rotationValue.textContent =
            value +
            "°";

    }


    if (
        activeObject &&
        activeObject.type === "logo"
    ) {

        logoRotation.value =
            value;


        logoRotationValue.textContent =
            value +
            "°";

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


            gestureActive =
                true;


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


            dragging =
                false;


            dragObject =
                null;


            return;

        }


        /*
         * ONE FINGER
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
         * RESIZE + ROTATE
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


            /*
             * RESIZE
             */

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


            /*
             * ROTATE
             */

            const currentAngle =
                getFingerAngle(
                    t1,
                    t2
                );


            let angleChange =
                currentAngle -
                gestureStartAngle;


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


            setActiveRotation(
                gestureStartRotation +
                angleChange
            );


            draw();


            return;

        }


        /*
         * ONE FINGER DRAG
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

        if (
            e.touches.length < 2
        ) {

            gestureActive =
                false;

        }


        if (
            e.touches.length === 0
        ) {

            if (
                gestureActive === false
            ) {

                saveHistory();

            }


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

        gestureActive =
            false;

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
   HISTORY - CREATE STATE
========================================================= */

function createHistoryState() {

    return {

        textLayers:
            textLayers.map(
                function (obj) {

                    return {

                        id:
                            obj.id,

                        type:
                            "text",

                        text:
                            obj.text,

                        x:
                            obj.x,

                        y:
                            obj.y,

                        fontSize:
                            obj.fontSize,

                        fontFamily:
                            obj.fontFamily,

                        color:
                            obj.color,

                        opacity:
                            obj.opacity,

                        rotation:
                            obj.rotation,

                        bold:
                            obj.bold,

                        italic:
                            obj.italic

                    };

                }
            ),


        logoLayers:
            logoLayers.map(
                function (obj) {

                    return {

                        id:
                            obj.id,

                        type:
                            "logo",

                        image:
                            obj.image,

                        x:
                            obj.x,

                        y:
                            obj.y,

                        size:
                            obj.size,

                        opacity:
                            obj.opacity,

                        rotation:
                            obj.rotation

                    };

                }
            )

    };

}


/* =========================================================
   HISTORY - RESTORE
========================================================= */

function restoreHistoryState(
    state
) {

    if (!state) return;


    /*
     * Restore text
     */

    textLayers =
        state.textLayers.map(
            function (obj) {

                return {

                    ...obj

                };

            }
        );


    /*
     * Restore logos
     */

    logoLayers =
        state.logoLayers.map(
            function (obj) {

                return {

                    ...obj

                };

            }
        );


    /*
     * Find active layer
     */

    activeObject = null;


    if (
        textLayers.length > 0
    ) {

        activeObject =
            textLayers[
                textLayers.length - 1
            ];

    }


    else if (
        logoLayers.length > 0
    ) {

        activeObject =
            logoLayers[
                logoLayers.length - 1
            ];

    }


    if (activeObject) {

        loadObjectControls(
            activeObject
        );

    }


    draw();

    updateHistoryButtons();

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory() {

    if (historyLock) return;


    const state =
        createHistoryState();


    undoStack.push(
        state
    );


    /*
     * Maximum 50 states
     */

    if (
        undoStack.length > 50
    ) {

        undoStack.shift();

    }


    redoStack = [];


    updateHistoryButtons();

}


/* =========================================================
   SCHEDULE HISTORY
========================================================= */

function scheduleHistory() {

    if (historyLock) return;


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
   UNDO
========================================================= */

if (undoBtn) {

    undoBtn.addEventListener(
        "click",
        function () {

            if (
                undoStack.length <= 1
            ) {

                return;

            }


            const current =
                undoStack.pop();


            redoStack.push(
                current
            );


            const previous =
                undoStack[
                    undoStack.length - 1
                ];


            historyLock =
                true;


            restoreHistoryState(
                previous
            );


            historyLock =
                false;


            updateHistoryButtons();

        }
    );

}


/* =========================================================
   REDO
========================================================= */

if (redoBtn) {

    redoBtn.addEventListener(
        "click",
        function () {

            if (
                redoStack.length === 0
            ) {

                return;

            }


            const next =
                redoStack.pop();


            undoStack.push(
                next
            );


            historyLock =
                true;


            restoreHistoryState(
                next
            );


            historyLock =
                false;


            updateHistoryButtons();

        }
    );

}


/* =========================================================
   HISTORY BUTTONS
========================================================= */

function updateHistoryButtons() {

    if (undoBtn) {

        undoBtn.disabled =
            undoStack.length <= 1;

    }


    if (redoBtn) {

        redoBtn.disabled =
            redoStack.length === 0;

    }

}


/* =========================================================
   INITIAL HISTORY
========================================================= */

setTimeout(
    function () {

        undoStack = [];

        redoStack = [];

        saveHistory();

    },
    100
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

            quality =
                0.92;

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


/* =========================================================
   RESET
========================================================= */

document
.getElementById("resetBtn")
.addEventListener(
    "click",
    function () {

        image = null;

        textLayers = [];

        logoLayers = [];

        activeObject = null;

        dragging = false;

        dragObject = null;

        gestureActive = false;

        nextLayerId = 1;


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


        undoStack = [];

        redoStack = [];


        saveHistory();

        draw();

    }
);


/* =========================================================
   INITIAL DISPLAY VALUES
========================================================= */

if (fontSizeValue) {

    fontSizeValue.textContent =
        fontSize.value +
        " px";

}


if (opacityValue) {

    opacityValue.textContent =
        opacity.value +
        "%";

}


if (rotationValue) {

    rotationValue.textContent =
        rotation.value +
        "°";

}


if (logoSizeValue) {

    logoSizeValue.textContent =
        logoSize.value +
        " px";

}


if (logoOpacityValue) {

    logoOpacityValue.textContent =
        logoOpacity.value +
        "%";

}


if (logoRotationValue) {

    logoRotationValue.textContent =
        logoRotation.value +
        "°";

}


if (tileSpacingValue) {

    tileSpacingValue.textContent =
        tileSpacing.value +
        " px";

}


updateHistoryButtons();


console.log(
    "AdiyogiTools Multi-Layer Watermark Maker loaded."
);
