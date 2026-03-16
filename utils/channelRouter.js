const { DEPARTMENTS } = require('../config/departments');

function getDepartmentChannelId(department) {
  const config = DEPARTMENTS[department];
  if (!config) throw new Error(`Unknown department: ${department}`);
  return process.env[config.envKey];
}

module.exports = {
  getDepartmentChannelId,
};
