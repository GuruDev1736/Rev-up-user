const MAX_DOCUMENT_SIZE = 1024 * 1024; // 1 MB

const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const loadImage = (dataURL) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataURL;
  });
};

const canvasToBlob = (canvas, quality) => {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
};

const getSafeFileName = (originalName) => {
  const trimmed = originalName.trim();
  if (!trimmed) return "document.jpg";

  const dotIndex = trimmed.lastIndexOf(".");
  const baseName = dotIndex > 0 ? trimmed.substring(0, dotIndex) : trimmed;
  return `${baseName}.jpg`;
};

export const checkAndCompressDocument = async (file) => {
  if (!file || !(file instanceof File)) {
    return file;
  }

  if (file.size <= MAX_DOCUMENT_SIZE) {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    console.warn("Document is not an image; skipping compression.");
    return file;
  }

  try {
    const dataURL = await readFileAsDataURL(file);
    const image = await loadImage(dataURL);

    const canvas = document.createElement("canvas");
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);

    while (blob && blob.size > MAX_DOCUMENT_SIZE && quality > 0.35) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob && blob.size > MAX_DOCUMENT_SIZE) {
      const scale = Math.sqrt(MAX_DOCUMENT_SIZE / blob.size);
      width = Math.max(800, Math.round(width * scale));
      height = Math.max(800, Math.round(height * scale));
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      quality = 0.8;
      blob = await canvasToBlob(canvas, quality);

      while (blob && blob.size > MAX_DOCUMENT_SIZE && quality > 0.35) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, quality);
      }
    }

    if (!blob) {
      console.warn("Failed to compress document; uploading original file.");
      return file;
    }

    const compressedFile = new File([blob], getSafeFileName(file.name), {
      type: blob.type,
    });

    console.info(
      `Compressed document ${file.name}: ${file.size} bytes -> ${compressedFile.size} bytes`
    );

    return compressedFile;
  } catch (error) {
    console.error("Error compressing document:", error);
    return file;
  }
};
