import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./supabase-config.js";

export function resetForm() {
  ["s-name","s-class","s-div","s-admin","s-dob","s-phone"].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const prev = document.getElementById("photo-preview");
  if(prev) { prev.src = ""; prev.style.display = "none"; }
  const prevContainer = document.getElementById("preview-container");
  if(prevContainer) { prevContainer.style.display = "none"; }
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
    const container = document.getElementById("preview-container");
    img.src = ev.target.result; 
    img.style.display = "block";
    if (container) container.style.display = "block";
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

    xhr.onload = function () {
      const res = JSON.parse(xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(res.secure_url);
      } else {
        reject(new Error(res.error?.message || "Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });
}

import { supabase } from "./auth.js";

window.uploadExcel = async function () {
  const fileInput = document.getElementById("excel-file");
  if(!fileInput) return;
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload an Excel file first.");
    return;
  }

  try {
    const data = await file.arrayBuffer();
    const workbook = window.XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = window.XLSX.utils.sheet_to_json(sheet);

    const { data: { user } } = await supabase.auth.getUser();

    for (const row of rows) {
      await supabase
        .from("students")
        .insert({
          school_id: user.id,
          student_data: row
        });
    }

    alert("Bulk upload successful!");
    fileInput.value = "";
  } catch(err) {
    alert("Error uploading Excel: " + err.message);
  }
}

