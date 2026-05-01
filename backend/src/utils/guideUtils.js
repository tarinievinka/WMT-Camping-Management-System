// Guide utilities

// Example: Generate a Guide ID
function generateGuideId() {
  return "GUIDE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Example: Validate guide experience (must be >= 0)
function isValidExperience(experience) {
  return typeof experience === "number" && experience >= 0;
}

// Example: Validate guide availability
function isValidAvailability(status) {
  return typeof status === "boolean";
}

// Example: Validate guide NIC (basic length check)
function isValidNIC(nic) {
  return typeof nic === "string" && (nic.length === 10 || nic.length === 12);
}

module.exports = {
  generateGuideId,
  isValidExperience,
  isValidAvailability,
  isValidNIC,
};