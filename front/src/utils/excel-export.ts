import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SentimentAnalysisService } from '@/lib/services/analysis/sentiment-analysis.service';

export interface PostData {
  id: string;
  title?: string;
  description?: string;
  url: string;
  platform: string;
  influencer_name?: string;
  influencer_username?: string;
  created_at?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  reach?: number;
  engagement_rate?: number;
  image_url?: string;
  post_metrics?: {
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    engagement_rate?: number;
    raw_response?: any;
  };
}

export interface CampaignData {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  posts: PostData[];
}

/**
 * Exporta los posts de una campaña a Excel con diseño atractivo
 */
export async function exportCampaignPostsToExcel(campaign: CampaignData) {
  try {
    // Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    
    // ✅ NUEVO: Obtener análisis de sentimientos para todos los posts en batch
    console.log('🔍 [EXCEL DEBUG] Obteniendo análisis de sentimientos para', campaign.posts.length, 'posts...');
    const sentimentAnalysis = await SentimentAnalysisService.getSentimentAnalysisByPostIds(
      campaign.posts.map(post => post.id)
    );
    console.log('📊 [EXCEL DEBUG] Análisis de sentimientos obtenidos:', Object.keys(sentimentAnalysis).length, 'posts analizados');
    
    // Debug: Mostrar resumen de posts con análisis
    const postsWithAnalysis = Object.keys(sentimentAnalysis).length;
    const totalPosts = campaign.posts.length;
    console.log('📈 [EXCEL DEBUG] Resumen de análisis:', {
      totalPosts,
      postsWithAnalysis,
      coverage: `${((postsWithAnalysis / totalPosts) * 100).toFixed(1)}%`
    });
    
    // Preparar datos para la hoja de posts
    const postsData = campaign.posts.map(post => {
      // Extraer métricas correctamente según la plataforma
      let views = 0;
      let likes = 0;
      let comments = 0;
      
      // Debug: Log inicial para todos los posts
      console.log('🔍 [EXCEL DEBUG] Processing post:', {
          postId: post.id,
        platform: post.platform,
          hasPostMetrics: !!post.post_metrics,
          hasRawResponse: !!post.post_metrics?.raw_response,
          hasData: !!post.post_metrics?.raw_response?.data,
        postMetricsKeys: post.post_metrics ? Object.keys(post.post_metrics) : [],
          rawResponseKeys: post.post_metrics?.raw_response?.data ? Object.keys(post.post_metrics.raw_response.data) : []
      });
      
      // Debug específico para Twitter - mostrar todas las propiedades de post_metrics
      if (post.platform.toLowerCase() === 'twitter' && post.post_metrics) {
        console.log('🔍 [EXCEL DEBUG] Twitter post_metrics full structure:', {
          postId: post.id,
          postMetrics: post.post_metrics,
          allKeys: Object.keys(post.post_metrics),
          likes_count: post.post_metrics.likes_count,
          comments_count: post.post_metrics.comments_count,
          views_count: post.post_metrics.views_count,
          engagement_rate: post.post_metrics.engagement_rate,
          raw_response: post.post_metrics.raw_response
        });
        
        // También mostrar las propiedades del post principal
        console.log('🔍 [EXCEL DEBUG] Twitter post main properties:', {
          postId: post.id,
          postEngagementRate: post.engagement_rate,
          postLikes: post.likes,
          postComments: post.comments,
          postViews: post.views,
          postKeys: Object.keys(post)
        });
      }
      
      // Primero intentar con raw_response si existe
      if (post.post_metrics?.raw_response?.data) {
        const rawResponse = post.post_metrics.raw_response;
        const platform = post.platform.toLowerCase();
        
        try {
          if (platform === 'tiktok' && rawResponse.data?.basicTikTokVideo) {
            const tiktokData = rawResponse.data.basicTikTokVideo;
            views = tiktokData.plays || 0;
            likes = tiktokData.hearts || 0;
            comments = tiktokData.comments || 0;
          } else if (platform === 'youtube' && rawResponse.data?.basicYoutubePost) {
            const youtubeData = rawResponse.data.basicYoutubePost;
            views = youtubeData.views || 0;
            likes = youtubeData.likes || 0;
            comments = youtubeData.comments || 0;
          } else if (platform === 'instagram' && rawResponse.data?.basicInstagramPost) {
            const instagramData = rawResponse.data.basicInstagramPost;
            
            likes = instagramData.likes || 0;
            comments = instagramData.comments || 0;
            
            // Para Instagram: diferenciar entre reels y posts
            if (instagramData.isReels) {
              // Para reels: usar videoViews directamente
              views = instagramData.videoViews || 0;
            } else {
              // Para posts: calcular alcance aproximado (como se hace en las cards)
              const calculateApproximateReach = (likes: number, comments: number): number => {
                // Si no hay likes ni comentarios, usar un valor base fijo
                if (likes === 0 && comments === 0) {
                  return 35; // Valor fijo para posts sin engagement
                }
                
                // Calcular engagement rate aproximado (likes + comentarios)
                const totalEngagement = likes + comments;
                
                // Para Instagram, el alcance típicamente es 10-50x el engagement
                // Usar una fórmula determinística basada en el engagement
                // Factor base: 20x el engagement
                let reachMultiplier = 20;
                
                // Ajustar el multiplicador basado en el nivel de engagement para simular realismo
                if (totalEngagement > 1000) {
                  reachMultiplier = 25; // Posts con mucho engagement tienen mayor alcance
                } else if (totalEngagement > 500) {
                  reachMultiplier = 22; // Posts con engagement medio-alto
                } else if (totalEngagement > 100) {
                  reachMultiplier = 21; // Posts con engagement medio
                } else if (totalEngagement > 50) {
                  reachMultiplier = 19; // Posts con engagement bajo-medio
                } else if (totalEngagement > 10) {
                  reachMultiplier = 18; // Posts con engagement bajo
                } else {
                  reachMultiplier = 17; // Posts con muy poco engagement
                }
                
                const approximateReach = totalEngagement * reachMultiplier;
                
                // Asegurar un mínimo razonable (5x el engagement)
                return Math.max(approximateReach, totalEngagement * 5);
              };
              
              views = calculateApproximateReach(likes, comments);
            }
          } else if (platform === 'twitter' && rawResponse.data?.basicTwitterPost) {
            const twitterData = rawResponse.data.basicTwitterPost;
            
            // Debug: Log detallado de los datos de Twitter
            console.log('🔍 [EXCEL DEBUG] Twitter data structure:', {
              postId: post.id,
              platform: platform,
              twitterData: twitterData,
              allKeys: Object.keys(twitterData || {}),
              views: twitterData.views,
              likes: twitterData.likes,
              replies: twitterData.replies,
              retweets: twitterData.retweets,
              favorite_count: twitterData.favorite_count,
              reply_count: twitterData.reply_count,
              impressions: twitterData.impressions,
              text: twitterData.text,
              content: twitterData.content,
              engageRate: twitterData.engageRate
            });
            
            // Extraer métricas de Twitter - intentar diferentes propiedades posibles
            views = twitterData.views || twitterData.impressions || 0;
            likes = twitterData.likes || twitterData.favorite_count || 0;
            comments = twitterData.replies || twitterData.reply_count || 0;
          }
        } catch (error) {
          console.warn('Error parsing raw_response for Excel export:', error);
        }
      }
      
      // Si no hay raw_response o no se pudieron extraer datos, usar post_metrics directamente
      if (views === 0 && post.post_metrics?.views_count) {
        views = post.post_metrics.views_count;
      }
      if (likes === 0 && post.post_metrics?.likes_count) {
        likes = post.post_metrics.likes_count;
      }
      if (comments === 0 && post.post_metrics?.comments_count) {
        comments = post.post_metrics.comments_count;
      }
      
      // Debug: Log de métricas finales para Twitter
      if (post.platform.toLowerCase() === 'twitter') {
        console.log('🔍 [EXCEL DEBUG] Twitter final metrics from post_metrics:', {
          postId: post.id,
          finalViews: views,
          finalLikes: likes,
          finalComments: comments,
          engagementRate: post.engagement_rate,
          postMetricsViews: post.post_metrics?.views_count,
          postMetricsLikes: post.post_metrics?.likes_count,
          postMetricsComments: post.post_metrics?.comments_count,
          postMetricsEngagementRate: post.post_metrics?.engagement_rate
        });
      }
      
      // Fallback final a los valores del modelo si no hay post_metrics
      if (views === 0) views = post.views || 0;
      if (likes === 0) likes = post.likes || 0;
      if (comments === 0) comments = post.comments || 0;
      
      // ✅ NUEVO: Determinar el engagement rate usando la misma lógica que en el análisis
      let engagementRate = 0;
      const platform = post.platform.toLowerCase();
      const rawResponse = post.post_metrics?.raw_response;
      
      // ✅ Para historias de Instagram: usar fórmula manual (alcance + me gusta + comentarios)
      const isInstagramStory = platform === 'instagram' && 
                               post.url && 
                               /instagram\.com\/stories\//i.test(post.url);
      
      if (isInstagramStory && rawResponse?.manual_metrics) {
        // Usar métricas manuales para historias de Instagram
        const manualData = rawResponse.manual_metrics;
        const manualLikes = manualData.likes || 0;
        const manualComments = manualData.comments || 0;
        const manualAlcance = manualData.alcance || 0;
        
        if (manualAlcance > 0) {
          const totalEngagement = manualLikes + manualComments;
          engagementRate = totalEngagement / manualAlcance; // Ya en decimal
        }
        
        console.log('📊 [EXCEL DEBUG] Instagram Story engagement calculation:', {
          postId: post.id,
          manualLikes,
          manualComments,
          manualAlcance,
          engagementRate: (engagementRate * 100).toFixed(2) + '%'
        });
      } 
      // ✅ Para el resto de contenido: usar engageRate del rawResponse como en el análisis
      else if (rawResponse?.data) {
        if (platform === 'youtube' && rawResponse.data.basicYoutubePost?.engageRate) {
          engagementRate = rawResponse.data.basicYoutubePost.engageRate;
        } else if (platform === 'tiktok' && rawResponse.data.basicTikTokVideo?.engageRate) {
          engagementRate = rawResponse.data.basicTikTokVideo.engageRate;
        } else if (platform === 'twitter' && rawResponse.data.basicTwitterPost?.engageRate) {
          engagementRate = rawResponse.data.basicTwitterPost.engageRate;
        } else if (platform === 'instagram' && rawResponse.data.basicInstagramPost?.engageRate) {
          engagementRate = rawResponse.data.basicInstagramPost.engageRate;
        }
        
        console.log('📊 [EXCEL DEBUG] Platform engagement from rawResponse:', {
          postId: post.id,
          platform,
          engagementRate: (engagementRate * 100).toFixed(2) + '%'
        });
      }
      
      // ✅ Fallback: usar post_metrics.engagement_rate o post.engagement_rate
      if (engagementRate === 0) {
        if (post.post_metrics?.engagement_rate) {
          engagementRate = post.post_metrics.engagement_rate;
        } else if (post.engagement_rate) {
          engagementRate = post.engagement_rate;
        }
        
        console.log('📊 [EXCEL DEBUG] Fallback engagement rate:', {
          postId: post.id,
          engagementRate: (engagementRate * 100).toFixed(2) + '%',
          source: post.post_metrics?.engagement_rate ? 'post_metrics' : 'post'
        });
      }
      
      // Formatear engagement rate con coma como separador decimal
      const engagementRateFormatted = engagementRate 
        ? (engagementRate * 100).toFixed(2).replace('.', ',') 
        : '0,00';
      
      // ✅ NUEVO: Obtener porcentajes de sentimiento usando el mismo servicio que Posts
      let positivePercentage = 0;
      let negativePercentage = 0;
      let neutralPercentage = 0;
      
      const isStoryContent = post.platform.toLowerCase() === 'instagram' && 
                             post.url && 
                             /instagram\.com\/stories\//i.test(post.url);
      
      // ✅ USAR LA MISMA LÓGICA QUE POSTS: Consultar SentimentAnalysisService
      if (!isStoryContent) {
        const sentimentData = sentimentAnalysis[post.id];
        
        if (sentimentData) {
          // ✅ ARREGLADO: Los valores vienen como porcentajes (64), convertirlos a decimales (0.64) para Excel
          positivePercentage = (sentimentData.positive_percentage || 0) / 100;
          negativePercentage = (sentimentData.negative_percentage || 0) / 100;
          neutralPercentage = (sentimentData.neutral_percentage || 0) / 100;
          
          console.log('📊 [EXCEL DEBUG] Sentiment from SentimentAnalysisService:', {
            postId: post.id,
            platform: post.platform,
            positive: (positivePercentage * 100).toFixed(0) + '%',
            negative: (negativePercentage * 100).toFixed(0) + '%',
            neutral: (neutralPercentage * 100).toFixed(0) + '%',
            source: 'sentiment_analysis table',
            note: 'Converted to decimal for Excel format'
          });
        } else {
          console.log('⚠️ [EXCEL DEBUG] No sentiment analysis found for post:', {
            postId: post.id,
            platform: post.platform,
            hasSentimentAnalysis: !!sentimentAnalysis[post.id]
          });
        }
      } else {
        console.log('📸 [EXCEL DEBUG] Instagram Story - no sentiment analysis needed:', {
          postId: post.id,
          platform: post.platform
        });
      }
      
      // ✅ DEBUG: Verificar valores finales antes de retornar
      if (positivePercentage > 0 || negativePercentage > 0 || neutralPercentage > 0) {
        console.log('🔍 [EXCEL DEBUG] Final sentiment values for Excel:', {
          postId: post.id,
          platform: post.platform,
          positive: positivePercentage + ' (will show as ' + (positivePercentage * 100).toFixed(2) + '%)',
          negative: negativePercentage + ' (will show as ' + (negativePercentage * 100).toFixed(2) + '%)',
          neutral: neutralPercentage + ' (will show as ' + (neutralPercentage * 100).toFixed(2) + '%)',
          note: 'Using 0.00% format for proper display'
        });
      }
      
      return {
        'URL': post.url,
        'Plataforma': post.platform,
        'Influencer': post.influencer_name || 'N/A',
        'Fecha de Creación': post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES') : 'N/A',
        'Me gusta': likes,
        'Comentarios': comments,
        'Visualizaciones': views,
        'Tasa de Engagement (%)': engagementRateFormatted,
        'Positivo (%)': positivePercentage,
        'Negativo (%)': negativePercentage,
        'Neutro (%)': neutralPercentage
      };
    });

    // Crear hoja de posts
    const worksheet = workbook.addWorksheet('Posts');

    // Definir las columnas con anchos ajustados
    worksheet.columns = [
      { header: 'URL', key: 'URL', width: 40 },
      { header: 'Plataforma', key: 'Plataforma', width: 20 }, // Columna B más ancha
      { header: 'Influencer', key: 'Influencer', width: 25 },
      { header: 'Fecha de Creación', key: 'Fecha de Creación', width: 15 },
      { header: 'Me gusta', key: 'Me gusta', width: 12 },
      { header: 'Comentarios', key: 'Comentarios', width: 18 }, // Columna F más ancha
      { header: 'Visualizaciones', key: 'Visualizaciones', width: 20 }, // Columna G más ancha
      { header: 'Tasa de Engagement (%)', key: 'Tasa de Engagement (%)', width: 25 }, // Columna H más ancha
      { header: 'Positivo (%)', key: 'Positivo (%)', width: 15 }, // Columna I
      { header: 'Negativo (%)', key: 'Negativo (%)', width: 15 }, // Columna J
      { header: 'Neutro (%)', key: 'Neutro (%)', width: 15 } // Columna K
    ];

    // Aplicar estilos al header con azul más claro
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Azul más claro (blue-700)
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // Blanco
        size: 12,
        name: 'Calibri'
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF1E40AF' } },
        bottom: { style: 'medium', color: { argb: 'FF1E40AF' } },
        left: { style: 'medium', color: { argb: 'FF1E40AF' } },
        right: { style: 'medium', color: { argb: 'FF1E40AF' } }
      };
    });

    // Agregar datos y aplicar estilos
    postsData.forEach((post, index) => {
      const row = worksheet.addRow(post);
      const rowNumber = index + 2; // +2 porque el header está en la fila 1
      
      // Colores alternados para las filas
      const bgColor = rowNumber % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF'; // Gris muy claro y blanco
      const borderColor = 'FFE2E8F0'; // Gris claro para bordes
      
      // Estilo especial para la primera fila de datos
      const isFirstDataRow = rowNumber === 2;
      const firstRowBgColor = 'FFF1F5F9'; // Gris más oscuro para la primera fila
      const firstRowBorderColor = 'FFCBD5E1'; // Borde más oscuro para la primera fila
      
      row.eachCell((cell, colNumber) => {
        // Determinar el tipo de contenido para aplicar estilos específicos
        const isUrl = colNumber === 1; // Columna URL
        const isPlatform = colNumber === 2; // Columna Plataforma
        const isNumeric = [5, 6, 7, 8, 9, 10, 11].includes(colNumber); // Columnas numéricas (incluyendo sentimiento)
        const isPercentage = [8, 9, 10, 11].includes(colNumber); // Columnas de porcentaje (engagement + sentimiento)
        const isLargeNumber = [5, 6, 7].includes(colNumber); // Columnas con números grandes
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isFirstDataRow ? firstRowBgColor : bgColor }
        };
        
        cell.font = {
          size: isFirstDataRow ? 11 : 10,
          name: 'Calibri',
          bold: isFirstDataRow,
          color: { argb: isUrl ? 'FF2563EB' : 'FF1F2937' } // Azul para URLs, gris oscuro para el resto
        };
        
        cell.alignment = {
          horizontal: isNumeric ? 'center' : 'left',
          vertical: 'middle',
          wrapText: true
        };
        
        cell.border = {
          top: { 
            style: isFirstDataRow ? 'medium' : 'thin', 
            color: { argb: isFirstDataRow ? firstRowBorderColor : borderColor } 
          },
          bottom: { 
            style: 'thin', 
            color: { argb: isFirstDataRow ? firstRowBorderColor : borderColor } 
          },
          left: { 
            style: 'thin', 
            color: { argb: isFirstDataRow ? firstRowBorderColor : borderColor } 
          },
          right: { 
            style: 'thin', 
            color: { argb: isFirstDataRow ? firstRowBorderColor : borderColor } 
          }
        };
        
        // Formato específico para diferentes tipos de datos
        if (isPercentage) {
          // ✅ ARREGLADO: Usar formato de porcentaje estándar para evitar problemas de visualización
          cell.numFmt = '0.00%';
        } else if (isLargeNumber) {
          cell.numFmt = '#,##0'; // Formato de números con separadores de miles
        }
        
        // Estilos especiales para URLs (hacerlas clickeables)
        if (isUrl && cell.value && typeof cell.value === 'string' && cell.value.startsWith('http')) {
          cell.value = {
            text: cell.value,
            hyperlink: cell.value,
            tooltip: 'Hacer clic para abrir el enlace'
          };
        }
      });
    });

    // Agregar filtros automáticos
    worksheet.autoFilter = {
      from: 'A1',
      to: `${String.fromCharCode(65 + worksheet.columns.length - 1)}1`
    };

    // Congelar la primera fila
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 1
      }
    ];

    // Generar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Crear blob y descargar
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Nombre del archivo con fecha
    const fileName = `Campaña_${campaign.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    saveAs(blob, fileName);
    
    // ✅ NUEVO: Log final con resumen de sentimientos
    const postsWithSentiment = postsData.filter(post => 
      post['Positivo (%)'] > 0 || post['Negativo (%)'] > 0 || post['Neutro (%)'] > 0
    ).length;
    
    console.log('✅ Excel exportado exitosamente:', fileName);
    console.log('📊 [EXCEL FINAL] Resumen de exportación:', {
      totalPosts: postsData.length,
      postsWithSentiment,
      sentimentCoverage: `${((postsWithSentiment / postsData.length) * 100).toFixed(1)}%`
    });
    
  } catch (error) {
    console.error('❌ Error exportando a Excel:', error);
    throw new Error('Error al exportar el archivo Excel');
  }
}

 