import pool from '../../config/database';

export const executeQuery = async (query: string, params: any[] = []) => {
  const result = await pool.query(query, params);
  return result.rows;
};

export const getTableNames = async () => {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  return result.rows.map(row => row.table_name);
};

export const tableExists = async (tableName: string): Promise<boolean> => {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `, [tableName]);
  return result.rows[0].exists;
};

export const getTableCount = async (tableName: string): Promise<number> => {
  const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
  return parseInt(result.rows[0].count);
};

export const getTableData = async (tableName: string, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}; 