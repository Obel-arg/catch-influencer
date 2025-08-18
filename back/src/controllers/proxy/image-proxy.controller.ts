import { Request, Response } from 'express';
import axios from 'axios';
import { BlobStorageService } from '../../services/blob-storage.service';

class ImageProxyController {
  // Método para configurar headers CORS
  private setCorsHeaders(res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
  }

  // Manejar peticiones OPTIONS (preflight)
  handleOptions = async (req: Request, res: Response) => {
    this.setCorsHeaders(res);
    res.status(200).end();
  }

  getImage = async (req: Request, res: Response) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      this.setCorsHeaders(res);
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      // Verificar si ya es una URL de Blob
      if (BlobStorageService.isBlobUrl(url)) {
        this.setCorsHeaders(res);
        return res.json({
          success: true,
          blobUrl: url,
          cached: true
        });
      }


      // Subir imagen a Vercel Blob
      const blobUrl = await BlobStorageService.uploadImageFromUrl(url);
      
      // Configurar headers CORS y respuesta JSON
      this.setCorsHeaders(res);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
      
      // Enviar URL de Blob (mucho más pequeña que Data URL)
      res.json({
        success: true,
        blobUrl: blobUrl,
        originalUrl: url,
        cached: false
      });

    } catch (error: any) {
      console.error(`[Image Proxy] Error processing ${url}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      });

      // Configurar CORS para respuestas de error también
      this.setCorsHeaders(res);

      // Respuestas específicas por tipo de error
      if (error.response?.status === 403) {
        res.status(403).json({ 
          success: false, 
          error: 'Access forbidden - image source blocks external requests' 
        });
      } else if (error.response?.status === 404) {
        res.status(404).json({ 
          success: false, 
          error: 'Image not found' 
        });
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        res.status(404).json({ 
          success: false, 
          error: 'Image source not reachable' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to process image',
          details: error.message 
        });
      }
    }
  }

  // Método adicional para obtener metadata de la imagen sin descargarla
  getImageInfo = async (req: Request, res: Response) => {
    // Configurar headers CORS
    this.setCorsHeaders(res);

    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });

      res.json({
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        status: response.status,
        accessible: true
      });
    } catch (error: any) {
      res.json({
        accessible: false,
        status: error.response?.status || 0,
        error: error.message
      });
    }
  }

  // Método específico para logos de marcas
  uploadBrandLogo = async (req: Request, res: Response) => {
    this.setCorsHeaders(res);
    
    const { url, brandName, brandId } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!brandName || typeof brandName !== 'string') {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    try {
      // Verificar si ya es una URL de Blob
      if (BlobStorageService.isBlobUrl(url)) {
        return res.json({
          success: true,
          logoUrl: url,
          cached: true
        });
      }

      // Generar nombre único para el logo
      const timestamp = Date.now();
      const cleanBrandName = brandName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const filename = `brand-logos/${cleanBrandName}-${timestamp}`;

      // Subir imagen a Vercel Blob con nombre específico
      const logoUrl = await BlobStorageService.uploadImageFromUrl(url, filename);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
      
      res.json({
        success: true,
        logoUrl: logoUrl,
        originalUrl: url,
        filename: filename,
        brandName: brandName,
        brandId: brandId || null
      });

    } catch (error: any) {
      console.error(`[Brand Logo Upload] Error processing logo for ${brandName}:`, {
        url,
        brandName,
        error: error.message
      });

      if (error.response?.status === 403) {
        res.status(403).json({ 
          success: false, 
          error: 'Access forbidden - logo source blocks external requests' 
        });
      } else if (error.response?.status === 404) {
        res.status(404).json({ 
          success: false, 
          error: 'Logo not found' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to upload brand logo',
          details: error.message 
        });
      }
    }
  }

  // Método para obtener logo de marca por nombre
  getBrandLogo = async (req: Request, res: Response) => {
    this.setCorsHeaders(res);
    
    const { brandName } = req.params;

    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    try {
      // Este sería un método para buscar en tu base de datos el logo de la marca
      // Por ahora, simplemente devolvemos una respuesta genérica
      const cleanBrandName = brandName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Aquí podrías buscar en la base de datos el logo actual de la marca
      res.json({
        success: true,
        brandName: brandName,
        message: 'Use the upload-brand-logo endpoint to set a logo for this brand'
      });

    } catch (error: any) {
      console.error(`[Get Brand Logo] Error:`, error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get brand logo' 
      });
    }
  }
}

export const imageProxyController = new ImageProxyController(); 