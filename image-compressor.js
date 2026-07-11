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

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      let quality = qualitySlider.value / 100;

if (targetSize.value != "0") {

    const targetKB = Number(targetSize.value);

    if (targetKB <= 20) quality = 0.15;
    else if (targetKB <= 50) quality = 0.35;
    else if (targetKB <= 100) quality = 0.55;
    else if (targetKB <= 200) quality = 0.75;
    else quality = 0.90;

}

      const compressed = canvas.toDataURL("image/jpeg", quality);
const compressedBytes = Math.round((compressed.length * 3) / 4);

compressedSize.textContent =
(compressedBytes / 1024).toFixed(2) + " KB";

savedPercent.textContent =
(
((file.size - compressedBytes) / file.size) * 100
).toFixed(1) + "%";
      preview.src = compressed;
      preview.style.display = "block";

      downloadBtn.href = compressed;
      downloadBtn.style.display = "inline-block";
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});
