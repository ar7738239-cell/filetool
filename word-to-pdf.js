const wordInput = document.getElementById("wordInput");
const fileName = document.getElementById("fileName");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loading = document.getElementById("loading");
const success = document.getElementById("success");
const preview = document.getElementById("preview");


/* =========================
   FILE SELECT
========================= */

wordInput.addEventListener("change", function () {

    const file = this.files[0];

    downloadBtn.style.display = "none";
    success.style.display = "none";

    if (!file) {

        fileName.textContent = "No file selected";

        return;
    }


    if (!file.name.toLowerCase().endsWith(".docx")) {

        alert("Please select a DOCX Word file.");

        this.value = "";

        fileName.textContent = "No file selected";

        return;
    }


    fileName.textContent = "📄 " + file.name;

});


/* =========================
   WAIT FOR IMAGES
========================= */

function waitForImages(container) {

    const images = container.querySelectorAll("img");

    if (!images.length) {
        return Promise.resolve();
    }

    return Promise.all(

        Array.from(images).map(function (img) {

            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise(function (resolve) {

                img.onload = resolve;
                img.onerror = resolve;

            });

        })

    );

}


/* =========================
   GET WORD PAGES
========================= */

function getWordPages() {

    /*
     * docx-preview normally creates:
     *
     * .docx-wrapper
     *      ├── section.docx
     *      ├── section.docx
     *      └── section.docx
     *
     * Each section is one Word page.
     */

    let pages =
        preview.querySelectorAll(
            ".docx-wrapper > .docx"
        );


    /*
     * Fallback
     */

    if (!pages.length) {

        pages =
            preview.querySelectorAll(
                ".docx-wrapper .docx"
            );

    }


    /*
     * Another fallback
     */

    if (!pages.length) {

        const wrapper =
            preview.querySelector(
                ".docx-wrapper"
            );

        if (wrapper) {

            return [wrapper];

        }

        return [preview];

    }


    return Array.from(pages);

}


/* =========================
   CONVERT DOCX → PDF
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

            convertBtn.disabled = true;

            loading.style.display = "block";

            success.style.display = "none";

            downloadBtn.style.display = "none";


            loading.textContent =
                "⏳ Reading Word document...";


            /*
             * Clear previous document
             */

            preview.innerHTML = "";

            preview.style.display = "block";


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

                    renderHeaders: true,

                    renderFooters: true,

                    renderFootnotes: true,

                    renderEndnotes: true,

                    useBase64URL: true

                }

            );


            loading.textContent =
                "⏳ Loading images and document pages...";


            /*
             * Wait for photos/logos/images
             */

            await waitForImages(preview);


            /*
             * Give browser time to finish layout
             */

            await new Promise(function (resolve) {

                setTimeout(resolve, 800);

            });


            /* =========================
               GET INDIVIDUAL PAGES
            ========================= */

            const pages =
                getWordPages();


            if (!pages.length) {

                throw new Error(
                    "No Word pages were detected."
                );

            }


            loading.textContent =
                "⏳ Creating PDF pages...";


            /* =========================
               CREATE A4 PDF
            ========================= */

            const pdf =
                new jspdf.jsPDF({

                    orientation: "portrait",

                    unit: "mm",

                    format: "a4",

                    compress: true

                });


            const pdfWidth =
                pdf.internal.pageSize.getWidth();

            const pdfHeight =
                pdf.internal.pageSize.getHeight();


            let pdfPageAdded = false;


            /* =========================
               EACH WORD PAGE
            ========================= */

            for (
                let i = 0;
                i < pages.length;
                i++
            ) {

                const page =
                    pages[i];


                /*
                 * Skip genuinely empty pages
                 */

                const hasText =
                    page.innerText &&
                    page.innerText.trim().length > 0;

                const hasImages =
                    page.querySelector("img") !== null;


                if (!hasText && !hasImages) {

                    continue;

                }


                loading.textContent =
                    "⏳ Converting page " +
                    (i + 1) +
                    " of " +
                    pages.length +
                    "...";


                /*
                 * Save original styles
                 */

                const oldPosition =
                    page.style.position;

                const oldVisibility =
                    page.style.visibility;

                const oldDisplay =
                    page.style.display;

                const oldWidth =
                    page.style.width;


                /*
                 * Make page render normally
                 */

                page.style.position =
                    "relative";

                page.style.visibility =
                    "visible";

                page.style.display =
                    "block";

                page.style.width =
                    "auto";


                /*
                 * Render THIS Word page only
                 */

                const canvas =
                    await html2canvas(

                        page,

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

                            scrollY: 0

                        }

                    );


                /*
                 * Restore styles
                 */

                page.style.position =
                    oldPosition;

                page.style.visibility =
                    oldVisibility;

                page.style.display =
                    oldDisplay;

                page.style.width =
                    oldWidth;


                if (
                    !canvas ||
                    canvas.width <= 0 ||
                    canvas.height <= 0
                ) {

                    continue;

                }


                /*
                 * Convert canvas to image
                 */

                const imageData =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.96
                    );


                /*
                 * IMPORTANT:
                 *
                 * Keep the Word page's
                 * original aspect ratio.
                 *
                 * Don't force the whole
                 * document into one page.
                 */

                const aspectRatio =
                    canvas.height /
                    canvas.width;


                let imageWidth =
                    pdfWidth;

                let imageHeight =
                    imageWidth *
                    aspectRatio;


                /*
                 * If page is taller than A4,
                 * scale it down only enough
                 * to fit A4.
                 */

                if (
                    imageHeight >
                    pdfHeight
                ) {

                    imageHeight =
                        pdfHeight;

                    imageWidth =
                        imageHeight /
                        aspectRatio;

                }


                /*
                 * Center page
                 */

                const x =
                    (pdfWidth -
                        imageWidth) / 2;

                const y =
                    (pdfHeight -
                        imageHeight) / 2;


                /*
                 * Add new PDF page
                 */

                if (pdfPageAdded) {

                    pdf.addPage();

                }


                pdf.addImage(

                    imageData,

                    "JPEG",

                    x,

                    y,

                    imageWidth,

                    imageHeight,

                    undefined,

                    "FAST"

                );


                pdfPageAdded = true;

            }


            /* =========================
               CHECK RESULT
            ========================= */

            if (!pdfPageAdded) {

                throw new Error(
                    "No content could be converted."
                );

            }


            /* =========================
               CREATE DOWNLOAD
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
