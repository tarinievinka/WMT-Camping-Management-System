/**
 * POST /api/guides/upload-image  (multipart field name: "image")
 * Returns { urlPath: "/uploads/filename.jpg" } for storing on Guide.coverPhoto, profilePhoto, gallery, etc.
 */
exports.uploadGuideImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file received (use field name: image)" });
    }
    const urlPath = `/uploads/${req.file.filename}`;
    return res.status(201).json({ urlPath, filename: req.file.filename });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
};
