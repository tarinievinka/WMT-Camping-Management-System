/**
 * POST /api/guides/upload-cv (multipart field name: "cv")
 * Returns { urlPath: "/uploads/filename.pdf" }
 */
exports.uploadGuideCV = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CV file received (use field name: cv)" });
    }
    const urlPath = `/uploads/${req.file.filename}`;
    return res.status(201).json({ urlPath, filename: req.file.filename });
  } catch (err) {
    return res.status(500).json({ error: err.message || "CV upload failed" });
  }
};
