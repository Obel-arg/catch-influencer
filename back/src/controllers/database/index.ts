import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import config from '../../config/environment';
import supabase from '../../config/supabase';
import fs from 'fs';
import path from 'path';

export class DatabaseController {
  private supabase;

  constructor() {
    this.supabase = createClient(
      config.supabase.url || '',
      config.supabase.anonKey || ''
    );
  }

  async getTables(req: Request, res: Response) {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) throw error;

      res.json({
        tables: data.map(table => table.table_name)
      });
    } catch (error) {
      console.error('Error al obtener tablas:', error);
      res.status(500).json({ error: 'Error al obtener tablas' });
    }
  }

  async getTableData(req: Request, res: Response) {
    try {
      const { tableName } = req.params;
      const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = req.query;

      let query = this.supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      // Aplicar ordenamiento si se especifica
      if (sortBy) {
        query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });
      }

      // Aplicar paginación
      const from = (Number(page) - 1) * Number(limit);
      const to = from + Number(limit) - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      res.json({
        data,
        total: count,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('Error al obtener datos de la tabla:', error);
      res.status(500).json({ error: 'Error al obtener datos de la tabla' });
    }
  }

  async createRecord(req: Request, res: Response) {
    try {
      const { tableName } = req.params;
      const recordData = req.body;

      const { data, error } = await this.supabase
        .from(tableName)
        .insert([recordData])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ data });
    } catch (error) {
      console.error('Error al crear registro:', error);
      res.status(500).json({ error: 'Error al crear registro' });
    }
  }

  async updateRecord(req: Request, res: Response) {
    try {
      const { tableName, id } = req.params;
      const updateData = req.body;

      const { data, error } = await this.supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ data });
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      res.status(500).json({ error: 'Error al actualizar registro' });
    }
  }

  async deleteRecord(req: Request, res: Response) {
    try {
      const { tableName, id } = req.params;

      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      res.status(500).json({ error: 'Error al eliminar registro' });
    }
  }
}

export const applyMigration = async (req: Request, res: Response) => {
  try {
    const { migrationName } = req.params;
    const migrationPath = path.join(__dirname, '../../db/migrations', migrationName);

    if (!fs.existsSync(migrationPath)) {
      return res.status(404).json({ error: 'Migración no encontrada' });
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error aplicando migración:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Migración aplicada exitosamente' });
  } catch (error: any) {
    console.error('Error en el controlador de migración:', error);
    res.status(500).json({ error: error.message });
  }
}; 