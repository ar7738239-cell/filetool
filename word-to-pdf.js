const wordInput = document.getElementById("wordInput");
const fileName = document.getElementById("fileName");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loading = document.getElementById("loading");
const success = document.getElementById("success");
const preview = document.getElementById("preview");


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


convertBtn.addEventListener("click", async function () {

    const file = wordInput.files[0];

    if (!file) {

        alert("Please select a DOCX Word file first.");

        return;
    }

    try {

        convertBtn.disabled = true;

        loading.style.display = "block";
        success.style.display = "none";
        downloadBtn.style.display = "none";

        preview.innerHTML = "";

        /*
         * Render DOCX
         */

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


        /*
         * Give images/fonts time to finish loading
         */

        const images = preview.querySelectorAll("img");

        await Promise.all(

            Array.from(images).map(img => {

                if (img.complete) {
                    return Promise.resolve();
                }

                return new Promise(resolve => {

                    img.onload = resolve;
                    img.onerror = resolve;

                });

            })

        );


        await new Promise(resolve => setTimeout(resolve, 500));


        /*
         * PDF settings
         */

        const options = {

            margin: 0,

            filename: file.name.replace(
                /\.docx$/i,
                ""
            ) + ".pdf",

            image: {

                type: "jpeg",

                quality: 0.98

            },

            html2canvas: {

                scale: 2,

                useCORS: true,

                backgroundColor: "#ffffff",

                logging: false

            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait",

                compress: true

            },

            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ],

                avoid: [
                    "img",
                    "table",
                    "tr"
                ]

            }

        };


        /*
         * Convert rendered document to PDF
         */

        const pdfBlob =
            await html2pdf()
                .set(options)
                .from(preview)
                .outputPdf("blob");


        /*
         * Create download link
         */

        const url =
            URL.createObjectURL(pdfBlob);


        downloadBtn.href = url;

        downloadBtn.download =
            file.name.replace(
                /\.docx$/i,
                ""
            ) + ".pdf";


        downloadBtn.style.display =
            "inline-block";


        success.style.display =
            "block";


    }

    catch (error) {

        console.error(error);

        alert(
            "PDF conversion failed. Please try another DOCX file."
        );

    }

    finally {

        loading.style.display = "none";

        convertBtn.disabled = false;

    }

});
