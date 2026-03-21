const { Colors } = require('discord.js');

const DEPARTMENTS = {
  frontend: {
    key: 'frontend',
    label: 'Frontend',
    envKey: 'FRONTEND_TASK_CHANNEL_ID',
    roleName: 'Frontend',
    color: Colors.Blue,
  },
  backend: {
    key: 'backend',
    label: 'Backend',
    envKey: 'BACKEND_TASK_CHANNEL_ID',
    roleName: 'Backend',
    color: Colors.Purple,
  },
  design: {
    key: 'design',
    label: 'Design',
    envKey: 'DESIGN_TASK_CHANNEL_ID',
    roleName: 'Design',
    color: Colors.Fuchsia,
  },
  marketing: {
    key: 'marketing',
    label: 'Marketing',
    envKey: 'MARKETING_TASK_CHANNEL_ID',
    roleName: 'Marketing',
    color: Colors.Orange,
  },
};

const MANAGER_ROLES = ['Owner', 'Admin', 'Project Manager'];
const CREATOR_ROLES = [...MANAGER_ROLES, ...Object.values(DEPARTMENTS).map((d) => d.roleName)];
const TASK_STATUSES = {
  todo: 'Todo',
  in_progress: 'In Progress',
  completed: 'Completed',
};

module.exports = {
  DEPARTMENTS,
  MANAGER_ROLES,
  CREATOR_ROLES,
  TASK_STATUSES,
};
