// Payment utilities: add helpers as needed

// Example: Generate a random transaction ID
function generateTransactionId() {
  return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Example: Validate payment method
function isValidPaymentMethod(method) {
  return ['card', 'upi', 'cash', 'online'].includes(method);
}

module.exports = {
  generateTransactionId,
  isValidPaymentMethod
};
