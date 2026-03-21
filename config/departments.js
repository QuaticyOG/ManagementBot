const { Colors } = require('discord.js');

const DEPARTMENTS = {
  frontend: {
    key: 'frontend',
    roleName: 'Frontend',
  },
  backend: {
    key: 'backend',
    roleName: 'Backend',
  },
  design: {
    key: 'design',
    roleName: 'Design',
  },
  marketing: {
    key: 'marketing',
    roleName: 'Marketing',
  },
  workers: {
    key: 'workers',
    roleName: 'Workers',
  },
  packs: { 
    key: 'packs',
    roleName: 'Packs',
  },
  bugtester: {
    key: 'bugtester',
    roleName: 'Bug Tester',
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
