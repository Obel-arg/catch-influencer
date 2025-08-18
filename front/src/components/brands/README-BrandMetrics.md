# 📊 Gráfico de Evolución de Métricas para Marcas

## 🎯 Descripción

Este gráfico muestra el rendimiento histórico de todas las campañas asignadas a una marca específica, consolidando los datos de múltiples campañas en una sola visualización.

## 🏗️ Arquitectura

### Componentes Creados

1. **`useBrandEvolutionData.ts`** - Hook personalizado
   - Obtiene datos de evolución de todas las campañas de una marca
   - Consolida métricas de múltiples campañas
   - Aplica acumulación progresiva para evitar pendientes negativas

2. **`BrandMetricsEvolutionChart.tsx`** - Componente del gráfico
   - Basado en el gráfico de campañas existente
   - Adaptado para mostrar datos consolidados de marcas
   - Incluye tooltips y estados de carga

### Integración

- **Ubicación**: `BrandDetailView.tsx` en la sección "Rendimiento Histórico"
- **Reemplaza**: El placeholder existente sin modificar la estructura
- **Datos**: Se obtienen automáticamente cuando hay campañas asignadas

## 🔄 Flujo de Datos

1. **Hook `useBrandEvolutionData`**:
   - Obtiene lista de campañas de la marca
   - Hace llamadas a `/api/v1/campaigns/{id}/evolution` para cada campaña
   - Consolida todos los datos por fecha
   - Aplica lógica de acumulación progresiva

2. **Consolidación de Datos**:
   - **Alcance**: Suma total de todas las campañas por fecha
   - **Engagement**: Promedio de engagement de todas las campañas por fecha
   - **Acumulación**: Evita pendientes negativas manteniendo valores crecientes

3. **Visualización**:
   - Gráfico de líneas con área sombreada
   - Selector entre "Alcance Total" y "Engagement Promedio"
   - Tooltips interactivos con valores exactos
   - Estados de carga y datos vacíos

## 🎨 Características Visuales

### Selector de Métricas
- **Alcance Total**: Suma acumulativa de alcance de todas las campañas
- **Engagement Promedio**: Promedio de engagement de todas las campañas

### Interactividad
- Hover en puntos para ver valores exactos
- Línea de referencia vertical
- Tooltip con fecha y valor formateado
- Puntos que cambian de tamaño al hacer hover

### Estados
- **Carga**: Skeleton animado
- **Sin datos**: Mensaje explicativo con icono
- **Con datos**: Gráfico interactivo completo

## 📈 Lógica de Datos

### Consolidación por Fecha
```typescript
// Para cada fecha, sumar alcance y promediar engagement
dateMap.set(date, {
  reach: existing.reach + (dayData.reach || 0),
  engagement: existing.engagement + (dayData.engagement || 0),
  count: existing.count + 1
});
```

### Acumulación Progresiva
```typescript
// Evitar pendientes negativas
let cumulativeReach = 0;
return evolutionData.map((item, index) => {
  cumulativeReach = Math.max(cumulativeReach, item.reach);
  return { ...item, reach: cumulativeReach };
});
```

## 🚀 Uso

El gráfico se integra automáticamente en la vista de detalle de marca:

1. Navega a una marca específica
2. Ve a la pestaña "Dashboard"
3. El gráfico aparece en la sección "Rendimiento Histórico"
4. Cambia entre "Alcance Total" y "Engagement Promedio"

## 🔧 Mantenimiento

### Agregar Nuevas Métricas
1. Actualizar interfaz `BrandMetricEvolution`
2. Modificar función de consolidación en el hook
3. Agregar botón de selección en el componente
4. Actualizar funciones de formateo

### Optimizaciones Futuras
- Cache de datos de evolución
- Filtros por rango de fechas
- Comparación entre marcas
- Exportación de datos

## 📝 Notas Técnicas

- **API Endpoint**: `/api/v1/campaigns/{id}/evolution`
- **Formato de Fechas**: ISO 8601 (YYYY-MM-DD)
- **Formateo de Números**: K para miles, M para millones
- **Responsive**: Se adapta al contenedor padre
- **Performance**: Memoización de cálculos costosos
