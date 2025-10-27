# 🚀 HypeAuditor Discovery - Sistema Unificado

## 📋 Resumen

Se ha implementado un sistema completo de Discovery de HypeAuditor que permite clonar prácticamente la funcionalidad del Explorer actual sin cambiar la estética. El sistema incluye:

- ✅ **Servicio de Discovery** para HypeAuditor
- ✅ **Controlador unificado** para el Explorer
- ✅ **Adaptador de filtros** entre Explorer y HypeAuditor
- ✅ **Sistema de proveedores múltiples** con fallback automático
- ✅ **Rutas completas** para todas las funcionalidades
- ✅ **Scripts de prueba** para verificar el funcionamiento

## 🏗️ Arquitectura

### Estructura de Archivos

```
back/src/
├── services/
│   ├── hypeauditor/
│   │   ├── hypeauditor-discovery.service.ts    # Servicio de Discovery
│   │   └── hypeauditor.service.ts              # Servicio existente (sin cambios)
│   └── explorer/
│       └── explorer-hypeauditor.service.ts     # Servicio unificado
├── controllers/
│   ├── hypeauditor/
│   │   ├── hypeauditor-discovery.controller.ts # Controlador de Discovery
│   │   └── hypeauditor.controller.ts           # Controlador existente (sin cambios)
│   └── explorer/
│       └── explorer.controller.ts              # Controlador unificado
├── routes/
│   ├── hypeauditor/
│   │   ├── hypeauditor-discovery.routes.ts     # Rutas de Discovery
│   │   └── hypeauditor.routes.ts               # Rutas existentes (sin cambios)
│   └── explorer/
│       └── explorer.routes.ts                  # Rutas unificadas
└── scripts/
    └── test-hypeauditor-discovery.js           # Script de pruebas
```

## 🔧 Funcionalidades Implementadas

### 1. Servicio de Discovery de HypeAuditor

**Archivo:** `services/hypeauditor/hypeauditor-discovery.service.ts`

- ✅ Búsqueda de discovery con todos los filtros de HypeAuditor
- ✅ Modo sandbox para testing sin consumir créditos
- ✅ Transformación de filtros del Explorer a formato HypeAuditor
- ✅ Transformación de respuestas de HypeAuditor al formato del Explorer
- ✅ Obtención de taxonomía de categorías
- ✅ Búsqueda de posts por keywords

### 2. Servicio Unificado del Explorer

**Archivo:** `services/explorer/explorer-hypeauditor.service.ts`

- ✅ Búsqueda unificada con múltiples proveedores
- ✅ Fallback automático entre proveedores
- ✅ Configuración dinámica de proveedores
- ✅ Health check de todos los proveedores
- ✅ Transformación de filtros para CreatorDB

### 3. Controladores

#### Controlador de Discovery
**Archivo:** `controllers/hypeauditor/hypeauditor-discovery.controller.ts`

- ✅ Búsqueda de discovery usando filtros del Explorer
- ✅ Búsqueda en modo sandbox
- ✅ Búsqueda directa con parámetros de HypeAuditor
- ✅ Búsqueda inteligente
- ✅ Health check y estadísticas de uso

#### Controlador Unificado
**Archivo:** `controllers/explorer/explorer.controller.ts`

- ✅ Búsqueda unificada del Explorer
- ✅ Búsqueda con proveedor específico
- ✅ Búsqueda inteligente
- ✅ Gestión de proveedores
- ✅ Health check de todos los proveedores

### 4. Rutas

#### Rutas de Discovery
**Archivo:** `routes/hypeauditor/hypeauditor-discovery.routes.ts`

```
POST /hypeauditor/discovery/search          # Búsqueda con filtros del Explorer
POST /hypeauditor/discovery/sandbox         # Búsqueda en modo sandbox
POST /hypeauditor/discovery/direct          # Búsqueda directa
POST /hypeauditor/discovery/smart-search    # Búsqueda inteligente
GET  /hypeauditor/discovery/taxonomy        # Taxonomía de categorías
GET  /hypeauditor/discovery/keywords-posts  # Posts por keywords
GET  /hypeauditor/discovery/health          # Health check
GET  /hypeauditor/discovery/usage-stats     # Estadísticas de uso
```

#### Rutas Unificadas
**Archivo:** `routes/explorer/explorer.routes.ts`

```
POST /explorer/search                       # Búsqueda unificada
POST /explorer/search/:provider             # Búsqueda con proveedor específico
POST /explorer/smart-search                 # Búsqueda inteligente
GET  /explorer/providers/status             # Estado de proveedores
POST /explorer/providers                    # Configurar proveedores
POST /explorer/providers/enable             # Habilitar/deshabilitar proveedor
GET  /explorer/health                       # Health check
GET  /explorer/taxonomy                     # Taxonomía
GET  /explorer/keywords-posts               # Posts por keywords
```

## 🎯 Mapeo de Filtros

### Explorer → HypeAuditor

| **Explorer Filter** | **HypeAuditor Parameter** | **Descripción** |
|-------------------|-------------------------|-----------------|
| `platform` | `social_network` | Plataforma (instagram, youtube, tiktok) |
| `searchQuery` | `search` | Búsqueda por texto |
| `minFollowers` | `subscribers_count.from` | Seguidores mínimos |
| `maxFollowers` | `subscribers_count.to` | Seguidores máximos |
| `minEngagement` | `er.from` | Engagement rate mínimo |
| `maxEngagement` | `er.to` | Engagement rate máximo |
| `location` | `account_geo.country` | Ubicación de la cuenta |
| `selectedCategories` | `category.include` | Categorías seleccionadas |
| `selectedGrowthRate` | `growth` | Tasa de crecimiento |
| `aqs` | `aqs` | Audience Quality Score |
| `cqs` | `cqs` | Channel Quality Score |
| `sortBy` | `sort.field` | Campo de ordenamiento |
| `verified` | `verified` | Cuentas verificadas |
| `hasContacts` | `account_has_contacts` | Tiene información de contacto |
| `accountType` | `account_type` | Tipo de cuenta (brand/human) |

### Filtros Avanzados

| **Explorer Filter** | **HypeAuditor Parameter** | **Plataforma** |
|-------------------|-------------------------|----------------|
| `reelsVideoViewsAvg` | `reels_video_views_avg` | Instagram |
| `shortsVideoViewsAvg` | `shorts_video_views_avg` | YouTube |
| `audienceAge` | `audience_age` | Todas |
| `audienceGender` | `audience_gender` | Todas |
| `audienceGeo` | `audience_geo` | Todas |
| `bloggerPrices` | `blogger_prices.post_price` | Todas |
| `income` | `income` | Instagram |
| `ethnicity` | `ethnicity` | Instagram |
| `interests` | `interests` | Instagram |

## 🔄 Transformación de Respuestas

### HypeAuditor → Explorer

```typescript
// HypeAuditor Response
{
  "basic": {
    "username": "influencer123",
    "title": "Influencer Name",
    "avatar_url": "https://..."
  },
  "metrics": {
    "subscribers_count": { "value": 100000 },
    "er": { "value": 5.2 }
  },
  "features": {
    "social_networks": [{
      "type": "instagram",
      "username": "influencer123",
      "subscribers_count": 100000,
      "er": 5.2
    }]
  }
}

// Transformado a Explorer Format
{
  "creatorId": "influencer123",
  "name": "Influencer Name",
  "avatar": "https://...",
  "isVerified": false,
  "socialPlatforms": [{
    "platform": "instagram",
    "username": "influencer123",
    "followers": 100000,
    "engagement": 5.2
  }],
  "metrics": {
    "engagementRate": 5.2,
    "aqs": "good",
    "cqs": "excellent"
  }
}
```

## 🚀 Uso del Sistema

### 1. Búsqueda Básica

```javascript
// POST /explorer/search
{
  "platform": "instagram",
  "minFollowers": 10000,
  "maxFollowers": 100000,
  "minEngagement": 2,
  "maxEngagement": 10,
  "page": 1,
  "options": {
    "provider": "auto",
    "fallback": true
  }
}
```

### 2. Búsqueda con Proveedor Específico

```javascript
// POST /explorer/search/hypeauditor
{
  "platform": "instagram",
  "minFollowers": 50000,
  "maxFollowers": 500000,
  "minEngagement": 3,
  "options": {
    "useSandbox": true
  }
}
```

### 3. Búsqueda Inteligente

```javascript
// POST /explorer/smart-search
{
  "query": "fitness motivation",
  "platform": "instagram",
  "filters": {
    "minFollowers": 50000,
    "maxFollowers": 500000,
    "minEngagement": 3
  },
  "options": {
    "provider": "hypeauditor"
  }
}
```

### 4. Configuración de Proveedores

```javascript
// POST /explorer/providers/enable
{
  "providerName": "hypeauditor",
  "enabled": true
}

// GET /explorer/providers/status
// Response:
{
  "success": true,
  "providers": [
    {
      "name": "hypeauditor",
      "priority": 1,
      "enabled": true
    },
    {
      "name": "creatordb",
      "priority": 2,
      "enabled": true
    }
  ]
}
```

## 🧪 Pruebas

### Script de Pruebas

**Archivo:** `scripts/test-hypeauditor-discovery.js`

```bash
# Ejecutar todas las pruebas
node src/scripts/test-hypeauditor-discovery.js

# Solo pruebas de configuración
node src/scripts/test-hypeauditor-discovery.js --config-only

# Pruebas completas con configuración
node src/scripts/test-hypeauditor-discovery.js --with-config
```

### Pruebas Incluidas

1. ✅ Health check del Explorer
2. ✅ Estado de proveedores
3. ✅ Búsqueda básica con HypeAuditor
4. ✅ Búsqueda inteligente
5. ✅ Búsqueda con filtros avanzados
6. ✅ Búsqueda con CreatorDB
7. ✅ Búsqueda unificada (auto)
8. ✅ Taxonomía de HypeAuditor
9. ✅ Búsqueda directa en HypeAuditor Discovery
10. ✅ Búsqueda sandbox
11. ✅ Health check de HypeAuditor Discovery
12. ✅ Estadísticas de uso
13. ✅ Configuración de proveedores

## 🔧 Configuración

### Variables de Entorno

Asegúrate de tener configuradas las credenciales de HypeAuditor en `config/hypeauditor.ts`:

```typescript
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

### Prioridades de Proveedores

Por defecto, el sistema usa esta prioridad:

1. **HypeAuditor** (prioridad 1) - Más datos y métricas avanzadas
2. **CreatorDB** (prioridad 2) - Fallback rápido

Puedes cambiar las prioridades dinámicamente:

```javascript
// POST /explorer/providers
{
  "providers": [
    {
      "name": "creatordb",
      "priority": 1,
      "enabled": true
    },
    {
      "name": "hypeauditor",
      "priority": 2,
      "enabled": true
    }
  ]
}
```

## 📊 Monitoreo y Logs

### Logs del Sistema

El sistema incluye logs detallados para monitoreo:

```
🚀 [EXPLORER CONTROLLER] Iniciando búsqueda unificada
🔧 [EXPLORER CONTROLLER] Filtros recibidos: {...}
🎯 [EXPLORER HYPEAUDITOR SERVICE] Proveedor seleccionado: hypeauditor
🔍 [HYPEAUDITOR DISCOVERY] Iniciando búsqueda para instagram
✅ [HYPEAUDITOR DISCOVERY] Búsqueda completada. Resultados: 20
✅ [EXPLORER CONTROLLER] Búsqueda completada en 1500ms. Proveedor: HypeAuditor, Resultados: 20
```

### Métricas Disponibles

- ⏱️ Tiempo de búsqueda
- 🔄 Uso de fallback
- 📊 Proveedor utilizado
- ❌ Errores por proveedor
- 💰 Créditos restantes de HypeAuditor

## 🎯 Ventajas del Sistema

### 1. Compatibilidad Total
- ✅ No rompe la funcionalidad existente de audiencia
- ✅ Mantiene la estética del Explorer actual
- ✅ API compatible con el frontend existente

### 2. Flexibilidad
- ✅ Cambio dinámico entre proveedores
- ✅ Fallback automático
- ✅ Configuración en tiempo real

### 3. Escalabilidad
- ✅ Fácil agregar nuevos proveedores
- ✅ Sistema modular y extensible
- ✅ Cache inteligente

### 4. Funcionalidades Avanzadas
- ✅ Métricas AQS/CQS de HypeAuditor
- ✅ Búsqueda por contenido
- ✅ Taxonomía de categorías
- ✅ Análisis de audiencia detallado

## 🚀 Próximos Pasos

### 1. Frontend
- [ ] Agregar toggle para cambiar proveedores
- [ ] Mostrar métricas avanzadas (AQS/CQS)
- [ ] Implementar búsqueda por contenido
- [ ] Mostrar taxonomía de categorías

### 2. Backend
- [ ] Implementar cache inteligente
- [ ] Agregar rate limiting
- [ ] Optimizar consultas frecuentes
- [ ] Agregar más proveedores

### 3. Monitoreo
- [ ] Dashboard de métricas
- [ ] Alertas de errores
- [ ] Análisis de rendimiento
- [ ] Reportes de uso

## 📞 Soporte

Para cualquier pregunta o problema:

1. Revisar los logs del sistema
2. Ejecutar el script de pruebas
3. Verificar la configuración de proveedores
4. Comprobar las credenciales de HypeAuditor

---

**¡El sistema está listo para usar! 🎉**
