const db = require('./db');

async function createTask({
  title,
  description,
  department,
  sourceDepartment,
  assignedUserId,
  priority,
  deadline
}) {

  const result = await db.query(
    `
      INSERT INTO tasks
      (
        title,
        description,
        department,
        source_department,
        assigned_user_id,
        priority,
        status,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,'todo',NOW())
      RETURNING *;
    `,
    [
      title,
      description,
      department,
      sourceDepartment,
      assignedUserId,
      priority,
      deadline
    ]
  );

  return result.rows[0];
}

async function getTaskById(taskId) {
  const result = await db.query('SELECT * FROM tasks WHERE id = $1;', [taskId]);
  return result.rows[0] ?? null;
}

async function updateTaskAssignee(taskId, userId) {
  const result = await db.query(
    `
    UPDATE tasks
    SET assigned_user_id = $1
    WHERE id = $2
    RETURNING *
    `,
    [userId, taskId]
  );

  return result.rows[0];
}

async function updateTaskStatus(taskId, status) {
  const result = await db.query(
    `
      UPDATE tasks
      SET status = $2,
          completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE NULL END
      WHERE id = $1
      RETURNING *;
    `,
    [taskId, status],
  );

  return result.rows[0] ?? null;
}

async function listTasks({ department = null, assignedUserId = null, status = null, statuses = null } = {}) {
  const conditions = [];
  const params = [];

  if (department) {
    params.push(department);
    conditions.push(`department = $${params.length}`);
  }

  if (assignedUserId) {
    params.push(assignedUserId);
    conditions.push(`assigned_user_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (statuses?.length) {
    params.push(statuses);
    conditions.push(`status = ANY($${params.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.query(
    `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC, id DESC LIMIT 50;`,
    params,
  );

  return result.rows;
}

async function getDepartmentSummary() {
  const result = await db.query(`
    SELECT department,
           COUNT(*) FILTER (WHERE status = 'todo') AS todo_count,
           COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
           COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
    FROM tasks
    GROUP BY department;
  `);

  return result.rows;
}

async function getTopContributors(limit = 5) {
  const result = await db.query(
    `
      SELECT assigned_user_id, COUNT(*)::int AS completed_count
      FROM tasks
      WHERE status = 'completed'
      GROUP BY assigned_user_id
      ORDER BY completed_count DESC, assigned_user_id ASC
      LIMIT $1;
    `,
    [limit],
  );

  return result.rows;
}

module.exports = {
  createTask,
  getTaskById,
  updateTaskStatus,
  listTasks,
  getDepartmentSummary,
  getTopContributors,
  updateTaskAssignee,
};
