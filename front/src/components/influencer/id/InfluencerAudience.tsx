"use client";
import { useState, useEffect } from "react";
import { hypeAuditorService } from "@/lib/services/hypeauditor.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Eye, 
  DollarSign,
  BarChart3,
  PieChart,
  Globe,
  Target,
  Activity,
  Star,
  TrendingDown,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Clock,
  Filter
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface InfluencerAudienceProps {
  influencer: any;
}

interface AudienceData {
  loading: boolean;
  data: any;
  error: string | null;
}

export default function InfluencerAudience({ influencer }: InfluencerAudienceProps) {
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState<"instagram" | "youtube" | "tiktok">("instagram");
  const [audienceData, setAudienceData] = useState<Record<string, AudienceData>>({
    instagram: { loading: false, data: null, error: null },
    youtube: { loading: false, data: null, error: null },
    tiktok: { loading: false, data: null, error: null }
  });

  const getInstagramUsername = () => {
    if (influencer?.social_networks) {
      const instagram = influencer.social_networks.find((s: any) => s.platform === 'instagram');
      return instagram?.username;
    }
    return influencer?.username || 'taylorswift';
  };

  const loadInstagramAudience = async () => {
    const username = getInstagramUsername();
    if (!username) return;

    setAudienceData(prev => ({
      ...prev,
      instagram: { ...prev.instagram, loading: true, error: null }
    }));

    try {
      const response = await hypeAuditorService.getInstagramReport(username);
      if (response.success && response.data) {
        setAudienceData(prev => ({
          ...prev,
          instagram: { loading: false, data: response.data, error: null }
        }));
      } else {
        throw new Error('No se pudieron obtener los datos');
      }
    } catch (error: any) {
      setAudienceData(prev => ({
        ...prev,
        instagram: { loading: false, data: null, error: error.message }
      }));
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de audiencia",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (activePlatform === "instagram" && !audienceData.instagram.data && !audienceData.instagram.loading) {
      loadInstagramAudience();
    }
  }, [activePlatform]);

  const availablePlatforms = [
    { key: "instagram", label: "Instagram", icon: "📸" },
    { key: "youtube", label: "YouTube", icon: "📺" },
    { key: "tiktok", label: "TikTok", icon: "🎵" }
  ];

  const renderAudienceContent = () => {
    const currentData = audienceData[activePlatform];

    if (currentData.loading) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header con mensaje de carga */}
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Cargando datos de audiencia...
            </h3>
            <p className="text-gray-500 text-sm">
              Analizando métricas y demografía de {activePlatform}
            </p>
          </div>

          {/* Skeletons con animación */}
          <div className="space-y-6 opacity-75">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded w-36"></div>
                </div>
                <div className="h-64 bg-gray-100 rounded-full w-64 mx-auto"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentData.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error al cargar los datos: {currentData.error}</p>
              <Button onClick={loadInstagramAudience} className="mt-2">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!currentData.data) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No hay datos disponibles para {activePlatform}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activePlatform) {
      case "instagram":
        return renderInstagramAudience(currentData.data);
      case "youtube":
        return renderYouTubeAudience();
      case "tiktok":
        return renderTikTokAudience();
      default:
        return null;
    }
  };

  const renderInstagramAudience = (data: any) => {
    return (
      <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Seguidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {data?.followers ? (data.followers / 1000000).toFixed(1) + 'M' : "N/A"}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {data?.followers ? data.followers.toLocaleString() : ''} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {data?.engagement_rate ? (data.engagement_rate * 100).toFixed(2) + '%' : "N/A"}
              </div>
              <p className="text-xs text-green-600 mt-1">
                {data?.er_title || 'Promedio del mercado'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Alcance Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {data?.avg_reach ? (data.avg_reach / 1000000).toFixed(1) + 'M' : "N/A"}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Por post promedio
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio por Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">
                {data?.est_post_price?.min ? '$' + (data.est_post_price.min / 1000).toFixed(0) + 'K' : "N/A"}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {data?.est_post_price?.max ? 'hasta $' + (data.est_post_price.max / 1000).toFixed(0) + 'K' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Crecimiento Anual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(data?.yearly_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data?.yearly_growth ? (data.yearly_growth > 0 ? '+' : '') + data.yearly_growth.toFixed(2) + '%' : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data?.growth_title || 'Últimos 12 meses'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Frecuencia de Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.post_frequency ? data.post_frequency.toFixed(2) : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Posts por día
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.est_stories_price?.min ? '$' + (data.est_stories_price.min / 1000).toFixed(0) + 'K' : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data?.est_stories_price?.max ? 'hasta $' + (data.est_stories_price.max / 1000).toFixed(0) + 'K' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {data?.location || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ubicación principal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scores de calidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Score de Autenticidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-600">
                  {data?.authenticity_score || 95}
                </div>
                <div className="flex-1">
                  <Progress value={data?.authenticity_score || 95} className="h-3" />
                  <p className="text-sm text-gray-600 mt-1">
                    {data?.authenticity_score >= 90 ? 'Excelente' : data?.authenticity_score >= 80 ? 'Bueno' : 'Promedio'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Score de Calidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-yellow-600">
                  {data?.quality_score || 90}
                </div>
                <div className="flex-1">
                  <Progress value={data?.quality_score || 90} className="h-3" />
                  <p className="text-sm text-gray-600 mt-1">
                    {data?.quality_score >= 90 ? 'Excelente' : data?.quality_score >= 80 ? 'Bueno' : 'Promedio'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Demografía de audiencia */}
         {data?.audience_demographics && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Gráfico de barras para distribución por edad */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5" />
                   Distribución por Edad
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {data.audience_demographics.age && (
                   <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={Object.entries(data.audience_demographics.age).map(([age, percentage]: [string, any]) => ({
                       age: age + ' años',
                       percentage: percentage,
                       value: percentage
                     }))}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="age" />
                       <YAxis />
                       <Tooltip 
                         formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                         labelFormatter={(label) => `Edad: ${label}`}
                       />
                       <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 )}
               </CardContent>
             </Card>

             {/* Gráfico circular para distribución por género */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <PieChart className="h-5 w-5" />
                   Distribución por Género
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {data.audience_demographics.gender && (
                   <div className="flex items-center justify-center">
                     <ResponsiveContainer width="100%" height={300}>
                       <RechartsPieChart>
                         <Pie
                           data={Object.entries(data.audience_demographics.gender).map(([gender, percentage]: [string, any]) => ({
                             name: gender === 'female' ? 'Femenino' : 'Masculino',
                             value: percentage,
                             color: gender === 'female' ? '#ec4899' : '#3b82f6'
                           }))}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="value"
                         >
                           {Object.entries(data.audience_demographics.gender).map(([gender, percentage]: [string, any], index: number) => (
                             <Cell 
                               key={`cell-${index}`} 
                               fill={gender === 'female' ? '#ec4899' : '#3b82f6'} 
                             />
                           ))}
                         </Pie>
                         <Tooltip 
                           formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                         />
                       </RechartsPieChart>
                     </ResponsiveContainer>
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         )}

        {/* Ubicación de audiencia */}
        {data?.audience_location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Ubicación de la Audiencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.audience_location)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 9)
                  .map(([country, percentage]: [string, any]) => (
                    <div key={country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{country}</span>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Datos demográficos avanzados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Idiomas de la audiencia */}
          {data?.audience_languages && data.audience_languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Idiomas de la Audiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.audience_languages.slice(0, 5).map((lang: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                                              <span className="text-sm font-medium">
                          {lang.code === 'en' ? 'Inglés' : 
                         lang.code === 'es' ? 'Español' : 
                         lang.code === 'pt' ? 'Portugués' : 
                         lang.code === 'fr' ? 'Francés' : 
                         lang.code === 'de' ? 'Alemán' : 
                         lang.code === 'it' ? 'Italiano' : 
                         lang.code === 'ru' ? 'Ruso' : 
                         lang.code === 'fa' ? 'Persa' : 
                         lang.code ? lang.code.toUpperCase() : 'Otro'}
                        </span>
                                              <Badge variant="outline">{lang.value ? lang.value.toFixed(1) : '0.0'}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Educación de la audiencia */}
          {data?.audience_education && Object.keys(data.audience_education).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nivel de Educación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.audience_education)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([education, percentage]: [string, any]) => (
                      <div key={education} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {education === 'no_education' ? 'Sin educación' :
                           education === 'incomplete_primary' ? 'Primaria incompleta' :
                           education === 'primary' ? 'Primaria' :
                           education === 'lower_secondary' ? 'Secundaria baja' :
                           education === 'upper_secondary' ? 'Secundaria alta' :
                           education === 'post_secondary' ? 'Post-secundaria' : education}
                        </span>
                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Estado civil e ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado civil */}
          {data?.audience_marital_status && Object.keys(data.audience_marital_status).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estado Civil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.audience_marital_status)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([status, percentage]: [string, any]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {status === 'single' ? 'Soltero/a' :
                           status === 'married' ? 'Casado/a' :
                           status === 'widowed' ? 'Viudo/a' :
                           status === 'divorced' ? 'Divorciado/a' : status}
                        </span>
                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingresos */}
          {data?.audience_income && Object.keys(data.audience_income).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ingresos Anuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.audience_income)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([income, percentage]: [string, any]) => (
                      <div key={income} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {income === '0k-5k' ? '$0-5K' :
                           income === '5k-10k' ? '$5K-10K' :
                           income === '10k-25k' ? '$10K-25K' :
                           income === '25k-50k' ? '$25K-50K' :
                           income === '50k-75k' ? '$50K-75K' :
                           income === '75k-100k' ? '$75K-100K' :
                           income === '100k-150k' ? '$100K-150K' :
                           income === '150k-200k' ? '$150K-200K' :
                           income === '200k+' ? '$200K+' : income}
                        </span>
                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

                 {/* Intereses de la audiencia */}
         {data?.audience_interests && data.audience_interests.length > 0 && (
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Target className="h-5 w-5" />
                 Intereses de la Audiencia
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {data.audience_interests.slice(0, 9).map((interest: any, index: number) => {
                   // Manejar tanto arrays como strings
                   const interestName = Array.isArray(interest) ? interest[0] : interest;
                   const interestPercentage = Array.isArray(interest) ? interest[1] : 0;
                   
                   return (
                     <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                       <span className="text-sm font-medium">{interestName}</span>
                       <Badge variant="outline" className="text-xs">
                         {interestPercentage ? (interestPercentage * 100).toFixed(0) : 'N/A'}%
                       </Badge>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>
         )}

                 

                   {/* Calidad de la Audiencia */}
         {data?.audience_quality && (
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5" />
                 Calidad de la Audiencia
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="text-center p-4 bg-blue-50 rounded-lg">
                   <div className="text-2xl font-bold text-blue-600">
                     {data.audience_quality.audience_age_21_plus?.toFixed(1)}%
                   </div>
                   <div className="text-sm text-gray-600">Mayores de 21 años</div>
                 </div>
                 
                 {data.audience_quality.media_per_week?.value && (
                   <div className="text-center p-4 bg-green-50 rounded-lg">
                     <div className="text-2xl font-bold text-green-600">
                       {data.audience_quality.media_per_week.value}
                     </div>
                     <div className="text-sm text-gray-600">Media por semana</div>
                     <div className={`text-xs mt-1 px-2 py-1 rounded ${
                       data.audience_quality.media_per_week.mark === 'good' ? 'bg-green-100 text-green-800' :
                       data.audience_quality.media_per_week.mark === 'poor' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800'
                     }`}>
                       {data.audience_quality.media_per_week.mark === 'good' ? 'Bueno' : 
                        data.audience_quality.media_per_week.mark === 'poor' ? 'Bajo' : 'Promedio'}
                     </div>
                   </div>
                 )}
                 
                 {data.audience_quality.geo_quality?.title && (
                   <div className="text-center p-4 bg-purple-50 rounded-lg">
                     <div className="text-lg font-bold text-purple-600">
                       {data.audience_quality.geo_quality.title}
                     </div>
                     <div className="text-sm text-gray-600">Calidad Geográfica</div>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
         )}

         {/* Gráfico de Radar - Métricas Clave */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Target className="h-5 w-5" />
               Análisis de Métricas Clave
             </CardTitle>
             <p className="text-sm text-gray-600">
               Comparación visual de las métricas más importantes
             </p>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Engagement Rate */}
               <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                 <div className="text-2xl font-bold text-green-700">
                   {(data?.engagement_rate * 100 || 0).toFixed(2)}%
                 </div>
                 <div className="text-sm text-green-600 font-medium">Engagement</div>
                 <div className="text-xs text-green-500 mt-1">
                   {data?.er_title || 'Promedio del mercado'}
                 </div>
               </div>

               {/* Authenticity Score */}
               <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                 <div className="text-2xl font-bold text-blue-700">
                   {data?.authenticity_score || 0}
                 </div>
                 <div className="text-sm text-blue-600 font-medium">Autenticidad</div>
                 <div className="text-xs text-blue-500 mt-1">
                   {data?.authenticity_score >= 90 ? 'Excelente' : 
                    data?.authenticity_score >= 80 ? 'Bueno' : 'Promedio'}
                 </div>
               </div>

               {/* Quality Score */}
               <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                 <div className="text-2xl font-bold text-yellow-700">
                   {data?.quality_score || 0}
                 </div>
                 <div className="text-sm text-yellow-600 font-medium">Calidad</div>
                 <div className="text-xs text-yellow-500 mt-1">
                   {data?.quality_score >= 90 ? 'Excelente' : 
                    data?.quality_score >= 80 ? 'Bueno' : 'Promedio'}
                 </div>
               </div>

               {/* Growth Trend */}
               <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                 <div className={`text-2xl font-bold ${(data?.yearly_growth || 0) >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                   {(data?.yearly_growth || 0) >= 0 ? '+' : ''}{(data?.yearly_growth || 0).toFixed(2)}%
                 </div>
                 <div className="text-sm text-purple-600 font-medium">Crecimiento</div>
                 <div className="text-xs text-purple-500 mt-1">
                   {data?.growth_title || 'Últimos 12 meses'}
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

                  {/* Raw data for debugging */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Ver datos completos (debug)
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  const renderYouTubeAudience = () => {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-lg font-semibold mb-2">Datos de YouTube</h3>
            <p>Próximamente - Integración con YouTube Analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTikTokAudience = () => {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold mb-2">Datos de TikTok</h3>
            <p>Próximamente - Integración con TikTok Analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs de plataformas */}
      <div className="flex gap-2 border-b">
        {availablePlatforms.map((platform) => (
          <button
            key={platform.key}
            className={`pb-2 px-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activePlatform === platform.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setActivePlatform(platform.key as any)}
          >
            <span>{platform.icon}</span>
            {platform.label}
          </button>
        ))}
      </div>

             {/* Contenido de la plataforma seleccionada */}
       <div className="transition-all duration-300 ease-in-out">
         {renderAudienceContent()}
       </div>
    </div>
  );
}
