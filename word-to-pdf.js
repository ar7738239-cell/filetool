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

});


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

            convertBtn.disabled = true;

            loading.style.display =
                "block";

            success.style.display =
                "none";

            downloadBtn.style.display =
                "none";


            loading.textContent =
                "⏳ Reading Word document...";


            /*
             Clear previous rendering
            */

            preview.innerHTML = "";

            preview.style.display =
                "block";


            /* =========================
               DOCX → HTML
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
                "⏳ Loading images and document content...";


            /* =========================
               WAIT FOR IMAGES
            ========================= */

            const images =
                preview.querySelectorAll(
                    "img"
                );


            await Promise.all(

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


            /*
             Small delay for rendering
            */

            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        700
                    );

                }
            );


            loading.textContent =
                "⏳ Creating PDF...";


            /* =========================
               GET DOCUMENT PAGES
            ========================= */

            let pages =
                preview.querySelectorAll(
                    ".docx"
                );


            /*
             Fallback if renderer
             returns only wrapper.
            */

            if (!pages.length) {

                pages = [preview];

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


            const pageWidth =
                pdf.internal.pageSize
                    .getWidth();


            const pageHeight =
                pdf.internal.pageSize
                    .getHeight();


            let addedPage =
                false;


            /* =========================
               RENDER EACH PAGE
            ========================= */

            for (
                let i = 0;
                i < pages.length;
                i++
            ) {

                const page =
                    pages[i];


                /*
                 Skip empty pages
                */

                if (
                    !page.innerText.trim() &&
                    !page.querySelector("img")
                ) {

                    continue;

                }


                /*
                 Make page renderable
                */

                const oldPosition =
                    page.style.position;

                const oldVisibility =
                    page.style.visibility;

                const oldDisplay =
                    page.style.display;


                page.style.position =
                    "relative";

                page.style.visibility =
                    "visible";

                page.style.display =
                    "block";


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
                                20000

                        }

                    );


                /*
                 Restore original styles
                */

                page.style.position =
                    oldPosition;

                page.style.visibility =
                    oldVisibility;

                page.style.display =
                    oldDisplay;


                if (
                    !canvas ||
                    canvas.width <= 0 ||
                    canvas.height <= 0
                ) {

                    continue;

                }


                const imageData =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.95
                    );


                /*
                 Keep original aspect ratio
                */

                const ratio =
                    Math.min(

                        pageWidth /
                            canvas.width,

                        pageHeight /
                            canvas.height

                    );


                const imageWidth =
                    canvas.width * ratio;


                const imageHeight =
                    canvas.height * ratio;


                const x =
                    (pageWidth -
                        imageWidth) / 2;


                const y =
                    (pageHeight -
                        imageHeight) / 2;


                if (addedPage) {

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


                addedPage = true;

            }


            /* =========================
               CHECK RESULT
            ========================= */

            if (!addedPage) {

                throw new Error(
                    "The document could not be rendered."
                );

            }


            /* =========================
               PDF DOWNLOAD
            ========================= */

            const pdfBlob =
                pdf.output(
                    "blob"
                );


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
