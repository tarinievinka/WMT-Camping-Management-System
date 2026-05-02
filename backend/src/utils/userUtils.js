const generateUserId = (role) => {
  const prefix = {
    admin: 'ADM',
    camper: 'CMP',
    guide: 'GDE',
    campsite_owner: 'OWN',
  };
  const tag = prefix[role] || 'USR';
  const timestamp = Date.now().toString().slice(-6);
  return `${tag}-${timestamp}`;
};

module.exports = { generateUserId };