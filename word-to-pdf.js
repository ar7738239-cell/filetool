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



/* =========================
   FILE SELECT
========================= */

wordInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        downloadBtn.style.display =
            "none";

        success.style.display =
            "none";


        if (!file) {

            fileName.textContent =
                "No file selected";

            return;

        }


        if (
            !file.name
                .toLowerCase()
                .endsWith(".docx")
        ) {

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



/* =========================
   WAIT FOR IMAGES
========================= */

function waitForImages(container) {

    const images =
        container.querySelectorAll("img");


    return Promise.all(

        Array.from(images).map(

            function (img) {

                if (img.complete) {

                    return Promise.resolve();

                }


                return new Promise(

                    function (resolve) {

                        img.onload =
                            resolve;

                        img.onerror =
                            resolve;

                    }

                );

            }

        )

    );

}



/* =========================
   CONVERT
========================= */

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

            convertBtn.disabled =
                true;


            loading.style.display =
                "block";


            success.style.display =
                "none";


            downloadBtn.style.display =
                "none";


            preview.innerHTML =
                "";


            preview.style.display =
                "block";


            loading.textContent =
                "⏳ Reading Word document...";


            /* =========================
               RENDER DOCX
            ========================= */

            await docx.renderAsync(

                file,

                preview,

                null,

                {

                    className: "docx",

                    inWrapper: true,

                    breakPages: true,

                    ignoreWidth: false,

                    ignoreHeight: false,

                    ignoreFonts: false,

                    ignoreLastRenderedPageBreak:
                        false,

                    renderHeaders: true,

                    renderFooters: true,

                    renderFootnotes: true,

                    renderEndnotes: true,

                    useBase64URL: true

                }

            );


            loading.textContent =
                "⏳ Loading document images...";


            await waitForImages(
                preview
            );


            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        1000
                    );

                }
            );


            /* =========================
               FIND DOCUMENT
            ========================= */

            const wrapper =
                preview.querySelector(
                    ".docx-wrapper"
                );


            if (!wrapper) {

                throw new Error(
                    "Word document rendering failed."
                );

            }


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


            captureElement.style.visibility =
                "visible";


            captureElement.style.display =
                "block";


            loading.textContent =
                "⏳ Preparing PDF...";


            /* =========================
               CAPTURE DOCUMENT
            ========================= */

            const canvas =
                await html2canvas(

                    captureElement,

                    {

                        scale: 2,

                        useCORS: true,

                        allowTaint: true,

                        backgroundColor:
                            "#ffffff",

                        logging: false,

                        imageTimeout:
                            30000,

                        scrollX: 0,

                        scrollY: 0,

                        windowWidth: 794,

                        windowHeight:
                            Math.max(

                                window.innerHeight,

                                captureElement
                                    .scrollHeight

                            )

                    }

                );


            if (
                !canvas ||
                canvas.width <= 0 ||
                canvas.height <= 0
            ) {

                throw new Error(
                    "Document capture failed."
                );

            }


            /* =========================
               CREATE PDF
            ========================= */

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
                pdf.internal.pageSize
                    .getWidth();


            const pdfHeight =
                pdf.internal.pageSize
                    .getHeight();


            /*
             A4 ratio:
             297 / 210
            */

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


            let firstPage =
                true;


            /* =========================
               CREATE EACH PAGE
            ========================= */

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


                pageContext.fillStyle =
                    "#ffffff";


                pageContext.fillRect(

                    0,
                    0,

                    pageCanvas.width,
                    pageCanvas.height

                );


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


                const imageData =
                    pageCanvas.toDataURL(

                        "image/jpeg",

                        0.96

                    );


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


            /* =========================
               DOWNLOAD
            ========================= */

            const pdfBlob =
                pdf.output("blob");


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


            alert(

                "PDF conversion failed.\n\n" +
                "Please try another DOCX file."

            );

        }


        finally {

            convertBtn.disabled =
                false;

        }

    }
);
