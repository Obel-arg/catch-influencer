# 📊 HypeAuditor API - Endpoints Utilizados

## 🔍 Endpoints Principales

### 1. Discovery Search
```
POST https://hypeauditor.com/api/method/auditor.search
```
**Propósito**: Búsqueda principal de influencers
**Uso**: Explorer, búsqueda con filtros avanzados
**Parámetros**: `DiscoverySearchRequest` (ver documentación principal)

### 2. Discovery Search Sandbox
```
POST https://hypeauditor.com/api/method/auditor.searchSandbox
```
**Propósito**: Búsqueda de prueba sin consumir créditos
**Uso**: Testing, desarrollo, validación de filtros
**Parámetros**: Mismos que `auditor.search`

### 3. Instagram Report
```
GET https://hypeauditor.com/api/method/auditor.report
```
**Propósito**: Obtener reporte detallado de influencer
**Uso**: Perfil de influencer, datos completos
**Parámetros**: 
- `username`: string
- `features`: string (opcional)

### 4. Taxonomy
```
GET https://hypeauditor.com/api/method/auditor.taxonomy
```
**Propósito**: Obtener categorías, temáticas, idiomas, países
**Uso**: Filtros del Explorer, autocompletado
**Parámetros**: Ninguno

### 5. Keywords Posts Search
```
GET https://hypeauditor.com/api/method/auditor.searchKeywordsPosts
```
**Propósito**: Buscar posts por keywords
**Uso**: Análisis de contenido, búsqueda de posts
**Parámetros**:
- `socialNetwork`: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'twitch'
- `contentIds`: string (IDs separados por comas)

## 🏗️ Estructura de URLs

### Base URL
```
https://hypeauditor.com/api/method
```

### Headers Requeridos
```typescript
{
  'Content-Type': 'application/json',
  'X-Auth-Id': 'TU_CLIENT_ID',
  'X-Auth-Token': 'TU_API_TOKEN'
}
```

## 📊 Códigos de Respuesta

| Código | Descripción | Acción |
|--------|-------------|--------|
| `200` | OK | Respuesta exitosa |
| `202` | Accepted | Reporte en generación, retry después de `retryTtl` |
| `400` | Bad Request | Verificar parámetros |
| `402` | Payment Required | Sin créditos, contactar soporte |
| `403` | Unauthorized | Token inválido o cuenta privada |
| `404` | Not Found | Usuario no encontrado |
| `429` | Too Many Requests | Esperar antes de hacer más requests |
| `500` | Internal Server Error | Servicio temporalmente no disponible |

## 🔄 Flujo de Uso Típico

### 1. Búsqueda de Influencers
```
1. POST /auditor.search (o /auditor.searchSandbox)
2. Procesar resultados
3. Mostrar en Explorer
```

### 2. Obtener Datos Detallados
```
1. GET /auditor.report?username={username}
2. Procesar reporte completo
3. Mostrar en perfil de influencer
```

### 3. Configurar Filtros
```
1. GET /auditor.taxonomy
2. Obtener categorías disponibles
3. Mostrar en filtros del Explorer
```

## 📈 Métricas Disponibles

### Métricas Principales
- `subscribers_count`: Número de seguidores
- `er`: Engagement Rate (0-100)
- `aqs`: Audience Quality Score
- `cqs`: Content Quality Score
- `real_subscribers_count`: Seguidores reales

### Métricas de Contenido
- `media_count`: Número de posts/videos
- `likes_count`: Total de likes
- `views_avg`: Promedio de vistas
- `comments_avg`: Promedio de comentarios
- `shares_avg`: Promedio de compartidos

### Métricas de Crecimiento
- `growth`: Crecimiento de seguidores
- `likes_growth_prc`: Crecimiento de likes

## 🌍 Plataformas Soportadas

1. **Instagram** ✅
   - Búsqueda completa
   - Reportes detallados
   - Métricas específicas (reels, stories)

2. **YouTube** ✅
   - Búsqueda de canales
   - Métricas de videos
   - Análisis de audiencia

3. **TikTok** ✅
   - Búsqueda de cuentas
   - Métricas de videos
   - Análisis de tendencias

4. **Twitter** ✅
   - Búsqueda de usuarios
   - Métricas de tweets
   - Análisis de engagement

5. **Twitch** ✅
   - Búsqueda de streamers
   - Métricas de streaming
   - Análisis de juegos

## 🔧 Configuración en el Código

### Archivo de Configuración
```typescript
// back/src/config/hypeauditor.ts
export const hypeAuditorConfig = {
  clientId: '2694138',
  apiToken: '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa',
  baseUrl: 'https://hypeauditor.com/api/method',
  endpoints: {
    search: '/auditor.search/',
    sandbox: '/auditor.searchSandbox/'
  }
};
```

### Servicios Implementados
- `hypeauditor-discovery.service.ts`: Discovery API
- `hypeauditor.service.ts`: Report API

### Controladores Implementados
- `hypeauditor-discovery.controller.ts`: Controlador de Discovery
- `hypeauditor.controller.ts`: Controlador de Reports

### Rutas API
- `/api/hypeauditor/discovery/*`: Rutas de Discovery
- `/api/hypeauditor/*`: Rutas de Reports

## 🚀 Ventajas vs CreatorDB

### ✅ Ventajas de HypeAuditor
- **Más plataformas**: Instagram, YouTube, TikTok, Twitter, Twitch
- **Métricas avanzadas**: AQS, CQS, engagement real
- **Filtros más específicos**: Por ubicación, idioma, edad, etc.
- **Datos de audiencia**: Demografía detallada
- **Modo sandbox**: Testing sin consumir créditos
- **API más moderna**: Mejor documentación y soporte

### ❌ Limitaciones
- **Límite de requests**: 100 por minuto
- **Costo**: Puede ser más costoso que CreatorDB
- **Complejidad**: Más parámetros y opciones
- **Migración**: Requiere adaptación del código existente

## 📚 Documentación Relacionada

- [Documentación Principal](../HYPEAUDITOR_DISCOVERY_README.md)
- [Categorías Disponibles](./categories.txt)
- [Keywords para Búsqueda](./keyworkds.txt)
- [Filtros de Instagram](./instagram.txt)
- [Filtros de YouTube](./youtube.txt)
- [Filtros de TikTok](./tiktok.txt)
- [Información General](./General.txt)

---

**Última actualización**: Diciembre 2024
**Versión de API**: v=1 (migrar a v=2 antes de agosto 2024)
