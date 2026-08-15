const wordInput =
    document.getElementById("wordInput");

const fileName =
    document.getElementById("fileName");

const convertBtn =
    document.getElementById("convertBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const loading =
    document.getElementById("loading");

const success =
    document.getElementById("success");

const preview =
    document.getElementById("preview");


/* ==================================================
   CHECK REQUIRED LIBRARIES
================================================== */

function checkLibraries() {

    if (typeof JSZip === "undefined") {

        throw new Error(
            "JSZip library failed to load."
        );

    }

    if (
        typeof docx === "undefined" ||
        typeof docx.renderAsync !== "function"
    ) {

        throw new Error(
            "DOCX Preview library failed to load."
        );

    }

    if (typeof html2canvas === "undefined") {

        throw new Error(
            "html2canvas library failed to load."
        );

    }

    if (
        typeof jspdf === "undefined" ||
        typeof jspdf.jsPDF !== "function"
    ) {

        throw new Error(
            "jsPDF library failed to load."
        );

    }

}


/* ==================================================
   FILE SELECTION
================================================== */

wordInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        downloadBtn.style.display =
            "none";


        success.style.display =
            "none";


        if (!file) {

            fileName.textContent =
                "No file selected";

            return;

        }


        const name =
            file.name.toLowerCase();


        if (!name.endsWith(".docx")) {

            alert(
                "Please select a DOCX Word file."
            );

            this.value = "";

            fileName.textContent =
                "No file selected";

            return;

        }


        fileName.textContent =
            "📄 " + file.name;

    }
);


/* ==================================================
   WAIT FOR ALL IMAGES
================================================== */

function waitForImages(container) {

    const images =
        container.querySelectorAll("img");


    return Promise.all(

        Array.from(images).map(

            function (img) {

                return new Promise(

                    function (resolve) {

                        if (img.complete) {

                            resolve();

                            return;

                        }


                        img.onload =
                            function () {
                                resolve();
                            };


                        img.onerror =
                            function () {
                                resolve();
                            };

                    }

                );

            }

        )

    );

}


/* ==================================================
   SMALL WAIT
================================================== */

function wait(ms) {

    return new Promise(

        function (resolve) {

            setTimeout(
                resolve,
                ms
            );

        }

    );

}


/* ==================================================
   CONVERT BUTTON
================================================== */

convertBtn.addEventListener(

    "click",

    async function () {

        const file =
            wordInput.files[0];


        if (!file) {

            alert(
                "Please select a DOCX file first."
            );

            return;

        }


        try {


            /* ==========================================
               CHECK LIBRARIES FIRST
            ========================================== */

            checkLibraries();


            convertBtn.disabled =
                true;


            loading.style.display =
                "block";


            success.style.display =
                "none";


            downloadBtn.style.display =
                "none";


            loading.textContent =
                "⏳ Reading Word document...";


            /* ==========================================
               CLEAR OLD DOCUMENT
            ========================================== */

            preview.innerHTML =
                "";


            preview.style.display =
                "block";


            preview.style.visibility =
                "visible";


            /* ==========================================
               RENDER DOCX
            ========================================== */

            await docx.renderAsync(

                file,

                preview,

                null,

                {

                    className:
                        "docx",

                    inWrapper:
                        true,

                    breakPages:
                        true,

                    ignoreWidth:
                        false,

                    ignoreHeight:
                        false,

                    ignoreFonts:
                        false,

                    ignoreLastRenderedPageBreak:
                        false,

                    renderHeaders:
                        true,

                    renderFooters:
                        true,

                    renderFootnotes:
                        true,

                    renderEndnotes:
                        true,

                    useBase64URL:
                        true

                }

            );


            /* ==========================================
               WAIT FOR IMAGES
            ========================================== */

            loading.textContent =
                "⏳ Loading images and document layout...";


            await waitForImages(
                preview
            );


            await wait(1000);


            /* ==========================================
               FIND DOCX WRAPPER
            ========================================== */

            const wrapper =
                preview.querySelector(
                    ".docx-wrapper"
                );


            if (!wrapper) {

                throw new Error(
                    "DOCX document could not be rendered."
                );

            }


            /* ==========================================
               FIX DOCUMENT WIDTH
            ========================================== */

            wrapper.style.width =
                "794px";

            wrapper.style.maxWidth =
                "794px";

            wrapper.style.margin =
                "0";

            wrapper.style.padding =
                "0";

            wrapper.style.background =
                "#ffffff";


            /* ==========================================
               FIND DOCUMENT SECTIONS
            ========================================== */

            const sections =
                wrapper.querySelectorAll(
                    "section.docx"
                );


            let captureElement =
                wrapper;


            if (sections.length === 1) {

                captureElement =
                    sections[0];

            }


            captureElement.style.display =
                "block";

            captureElement.style.visibility =
                "visible";


            /* ==========================================
               DOCUMENT HEIGHT
            ========================================== */

            const documentHeight =
                Math.max(

                    captureElement.scrollHeight,

                    captureElement.offsetHeight,

                    captureElement.getBoundingClientRect()
                        .height

                );


            if (
                !documentHeight ||
                documentHeight < 20
            ) {

                throw new Error(
                    "Word document appears to be empty."
                );

            }


            /* ==========================================
               CAPTURE DOCUMENT
            ========================================== */

            loading.textContent =
                "⏳ Preparing document pages...";


            const canvas =
                await html2canvas(

                    captureElement,

                    {

                        scale:
                            2,

                        useCORS:
                            true,

                        allowTaint:
                            false,

                        backgroundColor:
                            "#ffffff",

                        logging:
                            false,

                        imageTimeout:
                            30000,

                        removeContainer:
                            true,

                        scrollX:
                            0,

                        scrollY:
                            0,

                        windowWidth:
                            794,

                        windowHeight:
                            Math.max(
                                1123,
                                documentHeight
                            )

                    }

                );


            if (
                !canvas ||
                canvas.width <= 0 ||
                canvas.height <= 0
            ) {

                throw new Error(
                    "Document could not be captured."
                );

            }


            /* ==========================================
               CREATE A4 PDF
            ========================================== */

            const pdf =
                new jspdf.jsPDF({

                    orientation:
                        "portrait",

                    unit:
                        "mm",

                    format:
                        "a4",

                    compress:
                        true

                });


            const pdfWidth =
                pdf.internal.pageSize.getWidth();


            const pdfHeight =
                pdf.internal.pageSize.getHeight();


            /* ==========================================
               A4 PIXEL RATIO
            ========================================== */

            const a4Ratio =
                297 / 210;


            const pagePixelHeight =
                Math.round(

                    canvas.width *
                    a4Ratio

                );


            const totalPages =
                Math.ceil(

                    canvas.height /
                    pagePixelHeight

                );


            if (totalPages < 1) {

                throw new Error(
                    "No PDF pages were generated."
                );

            }


            let firstPage =
                true;


            /* ==========================================
               CREATE EACH PDF PAGE
            ========================================== */

            for (

                let page = 0;

                page < totalPages;

                page++

            ) {


                loading.textContent =
                    "⏳ Creating PDF page " +
                    (page + 1) +
                    " of " +
                    totalPages +
                    "...";


                const sourceY =
                    page *
                    pagePixelHeight;


                const remainingHeight =
                    canvas.height -
                    sourceY;


                const cropHeight =
                    Math.min(

                        pagePixelHeight,

                        remainingHeight

                    );


                if (cropHeight <= 0) {

                    continue;

                }


                /* ======================================
                   CREATE PAGE CANVAS
                ====================================== */

                const pageCanvas =
                    document.createElement(
                        "canvas"
                    );


                pageCanvas.width =
                    canvas.width;


                pageCanvas.height =
                    cropHeight;


                const pageContext =
                    pageCanvas.getContext(
                        "2d"
                    );


                /* White background */

                pageContext.fillStyle =
                    "#ffffff";


                pageContext.fillRect(

                    0,
                    0,

                    pageCanvas.width,
                    pageCanvas.height

                );


                /* ======================================
                   COPY DOCUMENT CONTENT
                ====================================== */

                pageContext.drawImage(

                    canvas,

                    0,
                    sourceY,

                    canvas.width,
                    cropHeight,

                    0,
                    0,

                    canvas.width,
                    cropHeight

                );


                /* ======================================
                   CONVERT PAGE TO IMAGE
                ====================================== */

                const imageData =
                    pageCanvas.toDataURL(

                        "image/jpeg",

                        0.96

                    );


                /* ======================================
                   ADD NEW PDF PAGE
                ====================================== */

                if (!firstPage) {

                    pdf.addPage();

                }


                const imageWidth =
                    pdfWidth;


                const imageHeight =
                    Math.min(

                        pdfHeight,

                        pdfWidth *
                        (
                            cropHeight /
                            canvas.width
                        )

                    );


                pdf.addImage(

                    imageData,

                    "JPEG",

                    0,
                    0,

                    imageWidth,
                    imageHeight,

                    undefined,

                    "FAST"

                );


                firstPage =
                    false;

            }


            /* ==========================================
               GENERATE PDF BLOB
            ========================================== */

            loading.textContent =
                "⏳ Finalizing PDF...";


            const pdfBlob =
                pdf.output("blob");


            if (
                !pdfBlob ||
                pdfBlob.size < 100
            ) {

                throw new Error(
                    "Generated PDF is empty."
                );

            }


            /* ==========================================
               CREATE DOWNLOAD LINK
            ========================================== */

            const pdfURL =
                URL.createObjectURL(
                    pdfBlob
                );


            downloadBtn.href =
                pdfURL;


            downloadBtn.download =
                file.name.replace(

                    /\.docx$/i,

                    ""

                ) + ".pdf";


            downloadBtn.style.display =
                "block";


            success.textContent =
                "✅ PDF created successfully!";


            success.style.display =
                "block";


            loading.style.display =
                "none";


            /* ==========================================
               CLEAN PREVIEW
            ========================================== */

            preview.innerHTML =
                "";


        }


        catch (error) {


            console.error(
                "Word to PDF Error:",
                error
            );


            loading.style.display =
                "none";


            success.style.display =
                "none";


            downloadBtn.style.display =
                "none";


            let message =
                "PDF conversion failed.";


            if (
                error &&
                error.message
            ) {

                message +=
                    "\n\n" +
                    error.message;

            }


            alert(message);

        }


        finally {

            convertBtn.disabled =
                false;

        }

    }

);
