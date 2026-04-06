export function exportExcel(dataArray, type) {
  if (!dataArray || dataArray.length === 0) {
    alert("No data to export.");
    return;
  }

  const rows = dataArray.map((s, i) => ({
    "#": i + 1,
    "Student Name": s.name || "",
    "Class": s.class || "",
    "Admission No": s.admission_no || "",
    "School": s.school_name || s.school_email || "",
    "Date of Birth": s.dob || "",
    "Parent Phone": s.parent_phone || "",
    "Photo URL": s.photo_url || "",
    "Uploaded On": s.created_at
      ? new Date(s.created_at).toLocaleDateString("en-IN")
      : ""
  }));

  const ws = window.XLSX.utils.json_to_sheet(rows);
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, "Students");

  // Column widths
  ws["!cols"] = [5, 20, 12, 12, 20, 14, 16, 50, 14].map(w => ({ wch: w }));

  const fname = `Excel_IDCards_${type.replace(/ /g, "_")}_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.xlsx`;

  window.XLSX.writeFile(wb, fname);
}

