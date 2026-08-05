const wordInput = document.getElementById("wordInput");
const fileName = document.getElementById("fileName");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;

wordInput.addEventListener("change", () => {

    selectedFile = wordInput.files[0];

    if (selectedFile) {
        fileName.innerText = selectedFile.name;
    } else {
        fileName.innerText = "No file selected";
    }

});

convertBtn.addEventListener("click", () => {

    if (!selectedFile) {

        alert("Please select a Word file first.");

        return;

    }

    const { jsPDF } = window.jspdf;

const reader = new FileReader();

reader.onload = function (event) {

    mammoth.extractRawText({
        arrayBuffer: event.target.result
    })

    .then(function(result) {

        const text = result.value;

        const pdf = new jsPDF();

        pdf.setFont("helvetica");

        pdf.setFontSize(12);
        
        const pageWidth = 180;

        const lines = pdf.splitTextToSize(text, pageWidth);

        let y = 20;

        lines.forEach(line => {

            if (y > 280) {

                pdf.addPage();

                y = 20;

            }

            pdf.text(line, 15, y);

            y += 8;

        });

        const pdfBlob = pdf.output("blob");

        const url = URL.createObjectURL(pdfBlob);

        downloadBtn.href = url;

        downloadBtn.style.display = "inline-block";
        
});

    })

    .catch(function(error) {
        alert("Conversion failed: " + error);
    });

};

reader.readAsArrayBuffer(selectedFile);

});    
