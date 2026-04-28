import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

/* ------------------ helper: crop image ------------------ */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function getCroppedImg(imageSrc, crop) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const size = 300; // output size (square)
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

/* ------------------ COMPONENT ------------------ */
export default function AvatarCropper({ image, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    const blob = await getCroppedImg(image, croppedAreaPixels);

    const file = new File([blob], "avatar.jpg", {
      type: "image/jpeg",
    });

    onSave(file);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        {/* CROPPER */}
        <div className="cropper-area">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* CONTROLS */}
        <div className="cropper-controls">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
          />

          <div className="cropper-buttons">
            <button onClick={onCancel}>Скасувати</button>
            <button onClick={handleSave}> Зберегти</button>
          </div>
        </div>
      </div>
    </div>
  );
}
