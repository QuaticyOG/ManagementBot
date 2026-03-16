const { CREATOR_ROLES, DEPARTMENTS, MANAGER_ROLES } = require('../config/departments');

function getMemberRoleNames(member) {
  return member.roles.cache.map((role) => role.name);
}

function hasAnyRole(member, roleNames) {
  const memberRoleNames = new Set(getMemberRoleNames(member));
  return roleNames.some((roleName) => memberRoleNames.has(roleName));
}

function canCreateTasks(member) {
  return hasAnyRole(member, CREATOR_ROLES);
}

function isManager(member) {
  return hasAnyRole(member, MANAGER_ROLES);
}

function getAllowedDepartments(member) {
  if (isManager(member)) return Object.keys(DEPARTMENTS);

  const roleNames = new Set(getMemberRoleNames(member));
  return Object.values(DEPARTMENTS)
    .filter((department) => roleNames.has(department.roleName))
    .map((department) => department.key);
}

function canViewDepartment(member, department) {
  return getAllowedDepartments(member).includes(department);
}

module.exports = {
  canCreateTasks,
  isManager,
  getAllowedDepartments,
  canViewDepartment,
};
