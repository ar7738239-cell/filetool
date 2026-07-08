function resizeImage() {

const file = document.getElementById("image").files[0];

if (!file) {
  alert("Please select an image");
  return;
}

const width = parseInt(document.getElementById("width").value) || 800;
const height = parseInt(document.getElementById("height").value) || 600;

const reader = new FileReader();

reader.onload = function(e) {

  const img = new Image();

  img.onload = function() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img,0,0,width,height);

    canvas.toBlob(function(blob){

      const url = URL.createObjectURL(blob);

      const link = document.getElementById("download");

      link.href = url;
      link.download = "resized-image.jpg";
      link.style.display = "inline-block";
      link.textContent = "⬇ Download Resized Image";

    },"image/jpeg",0.9);

  };

  img.src = e.target.result;

};

reader.readAsDataURL(file);

}