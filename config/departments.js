const { Colors } = require('discord.js');

const DEPARTMENTS = {
  frontend: {
    key: 'frontend',
    roleName: 'Frontend',
    envKey: 'FRONTEND_TASK_CHANNEL_ID',
  },
  backend: {
    key: 'backend',
    roleName: 'Backend',
    envKey: 'BACKEND_TASK_CHANNEL_ID',
  },
  design: {
    key: 'design',
    roleName: 'Design',
    envKey: 'DESIGN_TASK_CHANNEL_ID',
  },
  marketing: {
    key: 'marketing',
    roleName: 'Marketing',
    envKey: 'MARKETING_TASK_CHANNEL_ID',
  },

  workers: {
    key: 'workers',
    roleName: 'Workers',
    envKey: 'WORKERS_TASK_CHANNEL_ID',
  },
  packs: {
    key: 'packs',
    roleName: 'Packs',
    envKey: 'PACKS_TASK_CHANNEL_ID',
  },
  bugtester: {
    key: 'bugtester',
    roleName: 'Bug Tester',
    envKey: 'BUGTESTER_TASK_CHANNEL_ID',
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
