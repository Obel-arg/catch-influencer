import { Request, Response } from 'express';
import { HypeAuditorDiscoveryService, ExplorerFilters, DiscoverySearchRequest } from '../../services/hypeauditor/hypeauditor-discovery.service';

export class HypeAuditorDiscoveryController {
	private static discoveryService: HypeAuditorDiscoveryService;

	// Inicializar el service
	private static getDiscoveryService(): HypeAuditorDiscoveryService {
		if (!HypeAuditorDiscoveryController.discoveryService) {
			HypeAuditorDiscoveryController.discoveryService = HypeAuditorDiscoveryService.getInstance();
		}
		return HypeAuditorDiscoveryController.discoveryService;
	}

	/**
	 * Búsqueda de discovery usando filtros del Explorer
	 */
	static async searchDiscovery(req: Request, res: Response) {
		const startTime = Date.now();
		
		try {
			
			const filters: ExplorerFilters = req.body;
			
			// Validar parámetros requeridos
			if (!filters.platform) {
				return res.status(400).json({
					success: false,
					error: 'La plataforma es requerida',
					provider: 'HypeAuditor Discovery'
				});
			}

			const service = HypeAuditorDiscoveryController.getDiscoveryService();

			// Transformar filtros del Explorer a formato HypeAuditor
			const hypeAuditorRequest = service.transformExplorerFiltersToHypeAuditor(filters);
			


			// Realizar búsqueda en HypeAuditor
			const discoveryResponse = await service.searchDiscovery(hypeAuditorRequest);
			
			// Transformar respuesta al formato del Explorer
			const explorerResponse = service.transformHypeAuditorResponseToExplorer(discoveryResponse);
			
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			
			// Agregar metadatos de tiempo
			explorerResponse.metadata = {
				...explorerResponse.metadata,
				searchTime,
				filtersApplied: HypeAuditorDiscoveryController.getAppliedFilters(filters)
			};



			res.json(explorerResponse);

		} catch (error: any) {
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			
			
			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery',
				metadata: {
					searchTime,
					error: error.message
				}
			});
		}
	}

	/**
	 * Búsqueda de discovery en modo sandbox (para testing)
	 */
	static async searchDiscoverySandbox(req: Request, res: Response) {
		const startTime = Date.now();
		
		try {
			
			
			const filters = req.body;
			
			// Validar parámetros requeridos
			if (!filters.platform) {
				return res.status(400).json({
					success: false,
					error: 'La plataforma es requerida',
					provider: 'HypeAuditor Discovery Sandbox'
				});
			}

			const service = HypeAuditorDiscoveryController.getDiscoveryService();

			// Usar la transformación completa de filtros (incluyendo audiencia)
			const hypeAuditorRequest = service.transformExplorerFiltersToHypeAuditor(filters);
			


			// Realizar búsqueda en HypeAuditor (sandbox)
			const discoveryResponse = await service.searchDiscoverySandbox(hypeAuditorRequest);
			
			const endTime = Date.now();
			const searchTime = endTime - startTime;



			// Devolver la respuesta tal como viene de HypeAuditor
			res.json({
				success: true,
				data: discoveryResponse,
				provider: 'HypeAuditor Discovery Sandbox',
				metadata: {
					searchTime,
					filtersApplied: Object.keys(hypeAuditorRequest),
					cacheHit: false,
					mode: 'sandbox'
				}
			});

		} catch (error: any) {
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			
			
			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery Sandbox',
				metadata: {
					searchTime,
					error: error.message,
					mode: 'sandbox'
				}
			});
		}
	}

	/**
	 * Búsqueda directa usando parámetros de HypeAuditor (para casos avanzados)
	 */
	static async searchDirect(req: Request, res: Response) {
		const startTime = Date.now();
		
		try {
			
			
			const request: DiscoverySearchRequest = req.body;
			
			// Validar parámetros requeridos
			if (!request.social_network) {
				return res.status(400).json({
					success: false,
					error: 'El campo social_network es requerido',
					provider: 'HypeAuditor Discovery Direct'
				});
			}



			const service = HypeAuditorDiscoveryController.getDiscoveryService();

			// Realizar búsqueda directa en HypeAuditor
			const discoveryResponse = await service.searchDiscovery(request);
			
			const endTime = Date.now();
			const searchTime = endTime - startTime;



			res.json({
				success: true,
				...discoveryResponse,
				provider: 'HypeAuditor Discovery Direct',
				metadata: {
					searchTime,
					mode: 'direct'
				}
			});

		} catch (error: any) {
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			
			
			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery Direct',
				metadata: {
					searchTime,
					error: error.message,
					mode: 'direct'
				}
			});
		}
	}

	/**
	 * Obtener taxonomía de categorías
	 */
	static async getTaxonomy(req: Request, res: Response) {
		try {

			
			const service = HypeAuditorDiscoveryController.getDiscoveryService();
			const taxonomy = await service.getTaxonomy();
			

			
			res.json({
				success: true,
				data: taxonomy,
				provider: 'HypeAuditor Discovery'
			});

		} catch (error: any) {

			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery'
			});
		}
	}

	/**
	 * Buscar posts por keywords
	 */
	static async searchKeywordsPosts(req: Request, res: Response) {
		try {
			const { socialNetwork, contentIds } = req.query;
			
			if (!socialNetwork || !contentIds) {
				return res.status(400).json({
					success: false,
					error: 'Los parámetros socialNetwork y contentIds son requeridos',
					provider: 'HypeAuditor Discovery'
				});
			}

			const contentIdsArray = Array.isArray(contentIds) ? contentIds.map(id => String(id)) : [String(contentIds)];
			

			
			const service = HypeAuditorDiscoveryController.getDiscoveryService();
			const result = await service.searchKeywordsPosts(
				socialNetwork as string,
				contentIdsArray
			);
			

			
			res.json({
				success: true,
				...result,
				provider: 'HypeAuditor Discovery'
			});

		} catch (error: any) {

			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery'
			});
		}
	}

	/**
	 * Búsqueda inteligente (combinación de búsqueda por texto y filtros)
	 */
	static async smartSearch(req: Request, res: Response) {
		const startTime = Date.now();
		
		try {

			
			const { query, platform, filters = {} } = req.body;
			
			// Validar parámetros requeridos
			if (!query || !platform) {
				return res.status(400).json({
					success: false,
					error: 'Los parámetros query y platform son requeridos',
					provider: 'HypeAuditor Discovery Smart Search'
				});
			}

			// Combinar query con filtros
			const combinedFilters: ExplorerFilters = {
				...filters,
				searchQuery: query,
				platform
			};

			const service = HypeAuditorDiscoveryController.getDiscoveryService();

			// Transformar filtros del Explorer a formato HypeAuditor
			const hypeAuditorRequest = service.transformExplorerFiltersToHypeAuditor(combinedFilters);
			
	

			// Realizar búsqueda en HypeAuditor
			const discoveryResponse = await service.searchDiscovery(hypeAuditorRequest);
			
			// Transformar respuesta al formato del Explorer
			const explorerResponse = service.transformHypeAuditorResponseToExplorer(discoveryResponse);
			
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			
			// Agregar metadatos de tiempo
			explorerResponse.metadata = {
				...explorerResponse.metadata,
				searchTime,
				filtersApplied: HypeAuditorDiscoveryController.getAppliedFilters(combinedFilters),
				mode: 'smart',
				query,
				platform
			};

	

			res.json(explorerResponse);

		} catch (error: any) {
			const endTime = Date.now();
			const searchTime = endTime - startTime;
			

			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery Smart Search',
				metadata: {
					searchTime,
					error: error.message,
					mode: 'smart'
				}
			});
		}
	}

	/**
	 * Obtener información de salud del servicio
	 */
	static async healthCheck(req: Request, res: Response) {
		try {

			
			const service = HypeAuditorDiscoveryController.getDiscoveryService();
			
			// Realizar una búsqueda simple para verificar conectividad
			const testRequest: DiscoverySearchRequest = {
				social_network: 'instagram',
				page: 1,
				subscribers_count: { from: 1000, to: 10000 }
			};

			const startTime = Date.now();
			const discoveryResponse = await service.searchDiscoverySandbox(testRequest);
			const endTime = Date.now();
			const responseTime = endTime - startTime;


			
			res.json({
				success: true,
				status: 'healthy',
				provider: 'HypeAuditor Discovery',
				responseTime,
				queriesLeft: discoveryResponse.result.queries_left,
				testResults: discoveryResponse.result.search_results.length,
				timestamp: new Date().toISOString()
			});

		} catch (error: any) {

			
			res.status(503).json({
				success: false,
				status: 'unhealthy',
				error: error.message,
				provider: 'HypeAuditor Discovery',
				timestamp: new Date().toISOString()
			});
		}
	}

	/**
	 * Obtener estadísticas de uso
	 */
	static async getUsageStats(req: Request, res: Response) {
		try {


			const service = HypeAuditorDiscoveryController.getDiscoveryService();
			
			// Realizar una búsqueda simple para obtener queries_left
			const testRequest: DiscoverySearchRequest = {
				social_network: 'instagram',
				page: 1,
				subscribers_count: { from: 1000, to: 10000 }
			};

			const discoveryResponse = await service.searchDiscoverySandbox(testRequest);
			

			
			res.json({
				success: true,
				provider: 'HypeAuditor Discovery',
				queriesLeft: discoveryResponse.result.queries_left,
				totalPages: discoveryResponse.result.total_pages,
				currentPage: discoveryResponse.result.current_page,
				resultsPerPage: 20,
				timestamp: new Date().toISOString()
			});

		} catch (error: any) {
			console.error(`❌ [HYPEAUDITOR DISCOVERY CONTROLLER] Error obteniendo estadísticas:`, error.message);
			
			res.status(400).json({
				success: false,
				error: error.message,
				provider: 'HypeAuditor Discovery'
			});
		}
	}

	/**
	 * Obtener lista de filtros aplicados para metadatos
	 */
	private static getAppliedFilters(filters: ExplorerFilters): string[] {
		const appliedFilters: string[] = [];
		
		if (filters.searchQuery) appliedFilters.push('searchQuery');
		if (filters.platform) appliedFilters.push('platform');
		if (filters.minFollowers || filters.maxFollowers) appliedFilters.push('followers');
		if (filters.minEngagement || filters.maxEngagement) appliedFilters.push('engagement');
		if (filters.location && filters.location !== 'all') appliedFilters.push('location');
		if (filters.selectedCategories && filters.selectedCategories.length > 0) appliedFilters.push('categories');
		if (filters.selectedGrowthRate) appliedFilters.push('growth');
		if (filters.aqs) appliedFilters.push('aqs');
		if (filters.cqs) appliedFilters.push('cqs');
		if (filters.sortBy) appliedFilters.push('sort');
		if (filters.accountType) appliedFilters.push('accountType');
		if (filters.verified !== undefined) appliedFilters.push('verified');
		if (filters.hasContacts !== undefined) appliedFilters.push('hasContacts');
		if (filters.hasLaunchedAdvertising !== undefined) appliedFilters.push('hasLaunchedAdvertising');
		if (filters.searchContent && filters.searchContent.length > 0) appliedFilters.push('searchContent');
		if (filters.searchDescription && filters.searchDescription.length > 0) appliedFilters.push('searchDescription');
		if (filters.audienceAge) appliedFilters.push('audienceAge');
		if (filters.audienceGender) appliedFilters.push('audienceGender');
		if (filters.audienceGeo) appliedFilters.push('audienceGeo');
		if (filters.bloggerPrices) appliedFilters.push('bloggerPrices');
		if (filters.lastMediaTime) appliedFilters.push('lastMediaTime');
		if (filters.mediaCount) appliedFilters.push('mediaCount');
		if (filters.likesCount) appliedFilters.push('likesCount');
		if (filters.likesAvg) appliedFilters.push('likesAvg');
		if (filters.viewsAvg) appliedFilters.push('viewsAvg');
		if (filters.commentsAvg) appliedFilters.push('commentsAvg');
		if (filters.sharesAvg) appliedFilters.push('sharesAvg');
		if (filters.likesGrowthPrc) appliedFilters.push('likesGrowthPrc');
		if (filters.reelsVideoViewsAvg) appliedFilters.push('reelsVideoViewsAvg');
		if (filters.shortsVideoViewsAvg) appliedFilters.push('shortsVideoViewsAvg');
		if (filters.twitchActiveDaysPerWeek) appliedFilters.push('twitchActiveDaysPerWeek');
		if (filters.twitchHoursStreamed) appliedFilters.push('twitchHoursStreamed');
		if (filters.twitchLiveViewersAvg) appliedFilters.push('twitchLiveViewersAvg');
		if (filters.twitchGames) appliedFilters.push('twitchGames');
		if (filters.twitterLikes) appliedFilters.push('twitterLikes');
		if (filters.twitterReplies) appliedFilters.push('twitterReplies');
		if (filters.twitterRetweet) appliedFilters.push('twitterRetweet');
		if (filters.twitterTweet) appliedFilters.push('twitterTweet');
		if (filters.accountAge) appliedFilters.push('accountAge');
		if (filters.accountGender) appliedFilters.push('accountGender');
		if (filters.accountLanguages && filters.accountLanguages.length > 0) appliedFilters.push('accountLanguages');
		if (filters.accountMentions) appliedFilters.push('accountMentions');
		if (filters.income) appliedFilters.push('income');
		if (filters.ethnicity) appliedFilters.push('ethnicity');
		if (filters.interests) appliedFilters.push('interests');
		if (filters.usernameExclude && filters.usernameExclude.length > 0) appliedFilters.push('usernameExclude');
		if (filters.similar) appliedFilters.push('similar');
		
		return appliedFilters;
	}
}
