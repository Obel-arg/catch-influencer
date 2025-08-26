import { Request, Response } from 'express';
import { hypeAuditorService } from '../../services/hypeauditor/hypeauditor.service';

export class HypeAuditorController {
	static async search(req: Request, res: Response) {
		try {
			const body = req.body || {};
			const result = await hypeAuditorService.search(body);
			res.json({ success: true, ...result, provider: 'HypeAuditor' });
		} catch (error: any) {
			res.status(400).json({ success: false, error: error.message, provider: 'HypeAuditor' });
		}
	}

	static async sandbox(req: Request, res: Response) {
		try {
			const body = req.body || {};
			const result = await hypeAuditorService.searchSandbox(body);
			res.json({ success: true, ...result, provider: 'HypeAuditor' });
		} catch (error: any) {
			res.status(400).json({ success: false, error: error.message, provider: 'HypeAuditor' });
		}
	}

	static async getInstagramReport(req: Request, res: Response) {
		try {
			const { username, features } = req.query;
			
			if (!username) {
				return res.status(400).json({ 
					success: false, 
					error: 'Username es requerido', 
					provider: 'HypeAuditor' 
				});
			}

			const result = await hypeAuditorService.getInstagramReport(
				username as string,
				features as string
			);
			
			res.json({ success: true, ...result, provider: 'HypeAuditor' });
		} catch (error: any) {
			res.status(400).json({ success: false, error: error.message, provider: 'HypeAuditor' });
		}
	}
}
