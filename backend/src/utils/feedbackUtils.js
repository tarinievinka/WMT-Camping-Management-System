// Validate rating
function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// Validate target type
function isValidTargetType(type) {
  if (!type) return false;
  const validTypes = ["Campsite", "Equipment", "Guide"];
  return validTypes.some(t => t.toLowerCase() === type.toLowerCase());
}

// Generate editable time (24 hours)
function generateEditableTime(hours = 24) {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
}

// Check if editable
function isEditable(editableUntil) {
  return editableUntil && new Date() <= new Date(editableUntil);
}

// Clean comment
function sanitizeComment(comment) {
  return comment ? comment.trim().replace(/\s+/g, " ") : "";
}

module.exports = {
  isValidRating,
  isValidTargetType,
  generateEditableTime,
  isEditable,
  sanitizeComment
};