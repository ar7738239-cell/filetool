const imageInput = document.getElementById("imageInput");
const qualitySlider = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");
const compressBtn = document.getElementById("compressBtn");
const targetSize = document.getElementById("targetSize");
const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const savedPercent = document.getElementById("savedPercent");

qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = qualitySlider.value + "%";
});

compressBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
originalSize.textContent = (file.size / 1024).toFixed(2) + " KB";
  if (!file) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();

    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let maxWidth = 1920;
let maxHeight = 1920;

let width = img.width;
let height = img.height;

if (width > maxWidth || height > maxHeight) {

    const ratio = Math.min(maxWidth / width, maxHeight / height);

    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

}

canvas.width = width;
canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      let quality = qualitySlider.value / 100;

if (targetSize.value != "0") {

    const targetKB = Number(targetSize.value);

    if (targetKB <= 20) quality = 0.15;
    else if (targetKB <= 50) quality = 0.35;
    else if (targetKB <= 100) quality = 0.55;
    else if (targetKB <= 200) quality = 0.75;
    else quality = 0.90;

}

      let compressed = "";
let compressedBytes = 0;

if (targetSize.value == "0") {

    compressed = canvas.toDataURL("image/jpeg", quality);

} else {

    const targetBytes = Number(targetSize.value) * 1024;

    let bestImage = "";
let bestQuality = 1;
let bestDiff = Number.MAX_VALUE;

for (let q = 0.95; q >= 0.05; q -= 0.05) {

    let test = canvas.toDataURL("image/jpeg", q);

    let size = Math.round((test.length * 3) / 4);

    let diff = Math.abs(size - targetBytes);

    if (diff < bestDiff) {
        bestDiff = diff;
        bestImage = test;
        bestQuality = q;
    }

}

compressed = bestImage;

    if (compressed === "") {
        compressed = canvas.toDataURL("image/jpeg", low);
    }

}

compressedBytes = Math.round((compressed.length * 3) / 4);

compressedSize.textContent =
(compressedBytes / 1024).toFixed(2) + " KB";

savedPercent.textContent =
(((file.size - compressedBytes) / file.size) * 100).toFixed(1) + "%";

preview.src = compressed;
preview.style.display = "block";

downloadBtn.href = compressed;
downloadBtn.style.display = "inline-block";
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});
