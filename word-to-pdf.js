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

    alert("Step 4 Complete ✅\n\nNext step me conversion library add karenge.");

});
