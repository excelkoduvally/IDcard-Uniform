import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./supabase-config.js";

export function resetForm() {
  ["s-name","s-class","s-admin","s-dob","s-phone"].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const prev = document.getElementById("photo-preview");
  if(prev) { prev.src = ""; prev.style.display = "none"; }
  const photoInput = document.getElementById("s-photo");
  if(photoInput) photoInput.value = "";
}

export function handlePreview(e) {
  const file = e.target.files[0];
  if (!file) return null;
  if (file.size > 5 * 1024 * 1024) { 
    return { error: "Photo must be less than 5MB." };
  }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById("photo-preview");
    img.src = ev.target.result; img.style.display = "block";
  };
  reader.readAsDataURL(file);
  return file;
}

export async function uploadToCloudinary(file, progressCallback) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // Cloudinary does not have simple fetch progress, so we use XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && progressCallback) {
        progressCallback((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error("Cloudinary upload failed: " + xhr.responseText));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });
}

