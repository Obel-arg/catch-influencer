import { Request, Response } from 'express';
import { UserService } from '../../services/user';
import { UserUpdateDTO } from '../../models/user/user.model';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const updateData: UserUpdateDTO = req.body;
      const user = await this.userService.updateUser(userId, updateData);

      res.json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  async getUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const preferences = await this.userService.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error('Error al obtener preferencias:', error);
      res.status(500).json({ error: 'Error al obtener preferencias' });
    }
  }

  async updateUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const preferences = req.body;
      const updatedPreferences = await this.userService.updateUserPreferences(userId, preferences);
      res.json(updatedPreferences);
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      res.status(500).json({ error: 'Error al actualizar preferencias' });
    }
  }

  async getUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const settings = await this.userService.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ error: 'Error al obtener configuración' });
    }
  }

  async updateUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const settings = req.body;
      const updatedSettings = await this.userService.updateUserSettings(userId, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  }

  async getUserOrganizations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const organizations = await this.userService.getUserOrganizations(userId);
      res.json(organizations);
    } catch (error) {
      console.error('Error al obtener organizaciones:', error);
      res.status(500).json({ error: 'Error al obtener organizaciones' });
    }
  }

  async getUserTeams(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const teams = await this.userService.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ error: 'Error al obtener equipos' });
    }
  }
} 