"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Instagram,
  TwitterIcon as TikTok,
  Youtube,
  ChevronDown,
  MapPin,
  Hash,
  Filter,
  Users2,
  Check,
  BarChart2,
  Search,
  TrendingUp,
  X,
  Mic,
  Building2,
  Trophy,
  Music,
  Camera,
  Newspaper,
  Users,
  Laugh,
  Award,
  GraduationCap,
  Vote,
  Tv,
  Gamepad2,
  Video,
  Car,
  Baby,
  Scissors,
  Heart,
  PawPrint,
  Zap,
  Play,
  Film,
  Plane,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { Slider } from "@/components/ui/slider";
import { NumberDisplay } from "@/components/ui/NumberDisplay";
import HypeAuditorFilters from "./HypeAuditorFilters";
=======
>>>>>>> 734e09103dd483d07281a24dbde54f4d174c4fc6

// Interfaz para los filtros activos
interface ActiveFilter {
  id: string;
  label: string;
  icon: string | null;
  iconColor?: string;
  type: string;
}

// Función para formatear números - Evita problemas de hidratación
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  // Para números pequeños, usar formato consistente
  return num.toLocaleString('es-ES', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
};

interface ExplorerFiltersProps {
  platform: string;
  setPlatform: Dispatch<SetStateAction<string>>;
  topics: string[];
  setTopics: Dispatch<SetStateAction<string[]>>;
  niches: string[];
  setNiches: Dispatch<SetStateAction<string[]>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  minFollowers: number;
  setMinFollowers: Dispatch<SetStateAction<number>>;
  maxFollowers: number;
  setMaxFollowers: Dispatch<SetStateAction<number>>;
  minEngagement: number;
  setMinEngagement: Dispatch<SetStateAction<number>>;
  maxEngagement: number;
  setMaxEngagement: Dispatch<SetStateAction<number>>;
  selectedGrowthRate: { min: number; max: number } | null;
  setSelectedGrowthRate: Dispatch<
    SetStateAction<{ min: number; max: number } | null>
  >;

  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  hashtags: string;
  setHashtags: Dispatch<SetStateAction<string>>;
  selectedCategories: string[];
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
  categories: string[];
  locations: string[];
  handleSearch: () => void;
  handleClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
}

const followerRanges = [
  { label: "Nano (<10K)", min: 0, max: 10000 },
  { label: "Micro (10K ~ 50K)", min: 10000, max: 50000 },
  { label: "Mid tier (50K ~ 500K)", min: 50000, max: 500000 },
  { label: "Macro (500K ~ 1M)", min: 500000, max: 1000000 },
  { label: "Mega (1M+)", min: 1000000, max: 100000000 },
];

const engagementRanges = [
  { label: "Bajo (0-2%)", min: 0, max: 2 },
  { label: "Medio (2-5%)", min: 2, max: 5 },
  { label: "Alto (5-10%)", min: 5, max: 10 },
  { label: "Muy alto (>10%)", min: 10, max: 100 },
];

const growthRateRanges = [
  { label: "Decrecimiento (<0%)", min: 0, max: 0 },
  { label: "Estable (0-1%)", min: 0, max: 0.01 },
  { label: "Crecimiento bajo (1-3%)", min: 0.01, max: 0.03 },
  { label: "Crecimiento medio (3-7%)", min: 0.03, max: 0.07 },
  { label: "Crecimiento alto (7-15%)", min: 0.07, max: 0.15 },
  { label: "Crecimiento explosivo (>15%)", min: 0.15, max: 1 },
];

const countryList = [
  { code: "UAE", name: "Arab Emirates" },
  { code: "ARG", name: "Argentina" },
  { code: "BHS", name: "Bahamas" },
  { code: "BRB", name: "Barbados" },
  { code: "BLZ", name: "Belize" },
  { code: "BMU", name: "Bermuda" },
  { code: "BOL", name: "Bolivia" },
  { code: "BRA", name: "Brazil" },
  { code: "CAN", name: "Canada" },
  { code: "CHL", name: "Chile" },
  { code: "CHN", name: "China" },
  { code: "COL", name: "Colombia" },
  { code: "CRI", name: "Costa Rica" },
  { code: "CUB", name: "Cuba" },
  { code: "DMA", name: "Dominica" },
  { code: "DOM", name: "Dominican Republic" },
  { code: "ECU", name: "Ecuador" },
  { code: "SLV", name: "El Salvador" },
  { code: "FRA", name: "France" },
  { code: "DEU", name: "Germany" },
  { code: "GRC", name: "Greece" },
  { code: "GTM", name: "Guatemala" },
  { code: "HTI", name: "Haiti" },
  { code: "HND", name: "Honduras" },
  { code: "HKG", name: "Hong Kong" },
  { code: "ITA", name: "Italy" },
  { code: "JAM", name: "Jamaica" },
  { code: "JPN", name: "Japan" },
  { code: "MEX", name: "Mexico" },
  { code: "NIC", name: "Nicaragua" },
  { code: "PRY", name: "Paraguay" },
  { code: "PER", name: "Peru" },
  { code: "PRT", name: "Portugal" },
  { code: "PRI", name: "Puerto Rico" },
  { code: "ESP", name: "Spain" },
  { code: "GBR", name: "United Kingdom" },
  { code: "USA", name: "United States" },
  { code: "URY", name: "Uruguay" },
  { code: "VEN", name: "Venezuela" },
].sort((a, b) => a.name.localeCompare(b.name));

// 🎯 CATEGORÍAS ESPECÍFICAS DE FACEBOOK
const facebookCategories = [
  "Page · Athlete",
  "Page · Kitchen/cooking", 
  "Page · Broadcasting & media production company",
  "Page · Food & beverage company",
  "Page · Artist"
];

// 🎯 CATEGORÍAS ESPECÍFICAS DE YOUTUBE (mainCategory)
const youtubeCategories = [
  "Anime/Animation",
  "Autos & Vehicles",
  "Comedy",
  "Education",
  "Entertainment",
  "Family",
  "Film & Animation",
  "Gaming",
  "Howto & Style",
  "Music",
  "News & Politics",
  "Nonprofits & Activism",
  "People & Blogs",
  "Pets & Animals",
  "Science & Technology",
  "Shorts",
  "Shows",
  "Sports",
  "Trailers",
  "Travel & Events"
];

// 🎯 CATEGORÍAS GENERALES PARA INSTAGRAM Y TIKTOK
const instagramGeneralCategories = [
  "Artist",
  "Brand",
  "Athlete", 
  "Musician",
  "Fashion model",
  "Media/news company",
  "Entertainment website",
  "Sports team",
  "Comedian",
  "Sportsperson",
  "Sports",
  "Education",
  "Politician"
];

// ⚠️ CATEGORÍAS TEMPORALMENTE DESHABILITADAS - NO FUNCIONAN BIEN
/*
const categoryList = [
  { 
    code: "Gaming", 
    name: "Gaming", 
    icon: "🎮", 
    description: "Gaming, esports, streamers",
    nicheIds: ["id_gaming_All", "id_game_All", "id_gamer_All", "id_twitch_All", "id_fortnite_All"]
  },
  { 
    code: "Music", 
    name: "Music", 
    icon: "🎵", 
    description: "Música, artistas, cantantes",
    nicheIds: ["id_music_All", "id_artist_All", "id_hiphop_All", "id_newmusic_All", "id_song_All"]
  },
  { 
    code: "Lifestyle", 
    name: "Lifestyle", 
    icon: "✨", 
    description: "Fashion, beauty, estilo",
    nicheIds: ["id_fashion_All", "id_beauty_All", "id_style_All", "id_makeup_All", "id_lifestyle_All"]
  },
  { 
    code: "Travel", 
    name: "Travel", 
    icon: "✈️", 
    description: "Viajes, aventuras, turismo",
    nicheIds: ["id_explore_All", "id_travel_All", "id_explorepage_All", "id_vacation_All", "id_adventure_All"]
  },
  { 
    code: "Food", 
    name: "Food", 
    icon: "🍕", 
    description: "Comida, cocina, recetas",
    nicheIds: ["id_food_All", "id_coffee_All", "id_foodie_All", "id_recipe_All", "id_kitchen_All"]
  },
  { 
    code: "Fitness", 
    name: "Fitness", 
    icon: "💪", 
    description: "Ejercicio, salud, gym",
    nicheIds: ["id_fitness_All", "id_gym_All", "id_health_All", "id_sport_All", "id_workout_All"]
  },
  { 
    code: "Entertainment", 
    name: "Entertainment", 
    icon: "😂", 
    description: "Comedia, viral, diversión",
    nicheIds: ["id_viral_All", "id_funny_All", "id_comedy_All", "id_fun_All", "id_meme_All"]
  },
  { 
    code: "Family", 
    name: "Family", 
    icon: "👨‍👩‍👧‍👦", 
    description: "Familia, niños, padres",
    nicheIds: ["id_family_All", "id_baby_All", "id_momlife_All", "id_familytime_All", "id_kids_All"]
  },
  { 
    code: "Art", 
    name: "Art", 
    icon: "🎨", 
    description: "Arte, fotografía, diseño",
    nicheIds: ["id_art_All", "id_photography_All", "id_photooftheday_All", "id_design_All", "id_artist_All"]
  },
  { 
    code: "Education", 
    name: "Education", 
    icon: "📚", 
    description: "Educación, tutoriales",
    nicheIds: ["id_education_All", "id_school_All", "id_makeuptutorial_All", "id_tutorial_All", "id_learning_All"]
  },
  { 
    code: "News", 
    name: "News", 
    icon: "📰", 
    description: "Noticias, política, actualidad",
    nicheIds: ["id_news_All", "id_newsong_All", "id_politics_All", "id_socialmedia_All", "id_media_All"]
  }
].sort((a, b) => a.name.localeCompare(b.name));
*/

// ✅ NICHOS DE INSTAGRAM: Top nichos temáticos basados en CreatorDB (ordenados por popularidad)
const nichesList = [
  // 🔥 MEGA TIER (más de 300K canales)
  {
    code: "love",
    name: "Love",
    icon: "❤️",
    category: "General",
    channels: "515K",
  },
  {
    code: "viral",
    name: "Viral",
    icon: "🚀",
    category: "General",
    channels: "408K",
  },
  {
    code: "fyp",
    name: "FYP",
    icon: "📱",
    category: "General",
    channels: "372K",
  },
  {
    code: "instagram",
    name: "Instagram",
    icon: "📸",
    category: "General",
    channels: "362K",
  },
  {
    code: "explore",
    name: "Explore",
    icon: "🔍",
    category: "General",
    channels: "307K",
  },

  // ⚡ ALTO TIER (200K - 300K canales)
  {
    code: "travel",
    name: "Travel",
    icon: "✈️",
    category: "Viajes",
    channels: "288K",
  },
  {
    code: "trending",
    name: "Trending",
    icon: "📈",
    category: "General",
    channels: "281K",
  },
  {
    code: "music",
    name: "Music",
    icon: "🎵",
    category: "Entretenimiento",
    channels: "274K",
  },
  {
    code: "fashion",
    name: "Fashion",
    icon: "👗",
    category: "Moda",
    channels: "273K",
  },
  {
    code: "family",
    name: "Family",
    icon: "👨‍👩‍👧‍👦",
    category: "Familia",
    channels: "270K",
  },
  { code: "art", name: "Art", icon: "🎨", category: "Arte", channels: "256K" },
  {
    code: "nature",
    name: "Nature",
    icon: "🌿",
    category: "Naturaleza",
    channels: "240K",
  },
  {
    code: "photography",
    name: "Photography",
    icon: "📷",
    category: "Arte",
    channels: "233K",
  },

  // 📈 MEDIO TIER (100K - 200K canales)
  {
    code: "motivation",
    name: "Motivation",
    icon: "💪",
    category: "Inspiración",
    channels: "187K",
  },
  {
    code: "beauty",
    name: "Beauty",
    icon: "💄",
    category: "Belleza",
    channels: "144K",
  },
  {
    code: "life",
    name: "Life",
    icon: "🌟",
    category: "Lifestyle",
    channels: "141K",
  },
  {
    code: "funny",
    name: "Funny",
    icon: "😄",
    category: "Entretenimiento",
    channels: "123K",
  },
  {
    code: "food",
    name: "Food",
    icon: "🍕",
    category: "Gastronomía",
    channels: "116K",
  },
  {
    code: "style",
    name: "Style",
    icon: "✨",
    category: "Moda",
    channels: "114K",
  },
  {
    code: "fitness",
    name: "Fitness",
    icon: "💪",
    category: "Deporte",
    channels: "113K",
  },
  {
    code: "sunset",
    name: "Sunset",
    icon: "🌅",
    category: "Naturaleza",
    channels: "111K",
  },
  {
    code: "vacation",
    name: "Vacation",
    icon: "🏖️",
    category: "Viajes",
    channels: "110K",
  },
  {
    code: "makeup",
    name: "Makeup",
    icon: "💄",
    category: "Belleza",
    channels: "108K",
  },
  {
    code: "comedy",
    name: "Comedy",
    icon: "😂",
    category: "Entretenimiento",
    channels: "101K",
  },
  {
    code: "dance",
    name: "Dance",
    icon: "💃",
    category: "Entretenimiento",
    channels: "100K",
  },

  // 💫 MODERADO TIER (menos de 100K canales)
  {
    code: "beach",
    name: "Beach",
    icon: "🏖️",
    category: "Naturaleza",
    channels: "98K",
  },
  {
    code: "winter",
    name: "Winter",
    icon: "❄️",
    category: "Estacional",
    channels: "93K",
  },
  {
    code: "wedding",
    name: "Wedding",
    icon: "💍",
    category: "Eventos",
    channels: "91K",
  },
  {
    code: "lifestyle",
    name: "Lifestyle",
    icon: "✨",
    category: "Lifestyle",
    channels: "89K",
  },
  {
    code: "birthday",
    name: "Birthday",
    icon: "🎂",
    category: "Eventos",
    channels: "87K",
  },
  {
    code: "inspiration",
    name: "Inspiration",
    icon: "✨",
    category: "Inspiración",
    channels: "86K",
  },
  {
    code: "dog",
    name: "Dog",
    icon: "🐕",
    category: "Mascotas",
    channels: "79K",
  },
  {
    code: "cute",
    name: "Cute",
    icon: "🥰",
    category: "General",
    channels: "72K",
  },
  {
    code: "football",
    name: "Football",
    icon: "⚽",
    category: "Deporte",
    channels: "70K",
  },
  {
    code: "sport",
    name: "Sport",
    icon: "🏃",
    category: "Deporte",
    channels: "67K",
  },

  // 🎯 NICHOS ESPECÍFICOS
  {
    code: "design",
    name: "Design",
    icon: "🎨",
    category: "Arte",
    channels: "67K",
  },
  {
    code: "home",
    name: "Home",
    icon: "🏠",
    category: "Hogar",
    channels: "35K",
  },
  {
    code: "baby",
    name: "Baby",
    icon: "👶",
    category: "Familia",
    channels: "40K",
  },
  {
    code: "flowers",
    name: "Flowers",
    icon: "🌸",
    category: "Naturaleza",
    channels: "30K",
  },
  {
    code: "party",
    name: "Party",
    icon: "🎉",
    category: "Eventos",
    channels: "41K",
  },
  {
    code: "success",
    name: "Success",
    icon: "🏆",
    category: "Inspiración",
    channels: "38K",
  },
  {
    code: "education",
    name: "Education",
    icon: "📚",
    category: "Educación",
    channels: "32K",
  },
  {
    code: "cat",
    name: "Cat",
    icon: "🐱",
    category: "Mascotas",
    channels: "81K",
  },
  {
    code: "game",
    name: "Game",
    icon: "🎮",
    category: "Gaming",
    channels: "12K",
  },
  {
    code: "basketball",
    name: "Basketball",
    icon: "🏀",
    category: "Deporte",
    channels: "12K",
  },
].sort(
  (a, b) =>
    parseInt(b.channels.replace("K", "")) -
    parseInt(a.channels.replace("K", ""))
);

export default function ExplorerFilters(props: ExplorerFiltersProps) {
  const {
    platform,
    setPlatform,
    topics,
    setTopics,
    niches,
    setNiches,
    location,
    setLocation,
    minFollowers,
    setMinFollowers,
    maxFollowers,
    setMaxFollowers,
    minEngagement,
    setMinEngagement,
    maxEngagement,
    setMaxEngagement,
    selectedGrowthRate,
    setSelectedGrowthRate,
    searchQuery,
    setSearchQuery,
    hashtags,
    setHashtags,
    selectedCategories,
    setSelectedCategories,
    categories,
    locations,
    handleSearch,
    handleClearFilters,
    showFilters,
    setShowFilters,
  } = props;

  const [countrySearch, setCountrySearch] = useState("");
  const [topicsSearch, setTopicsSearch] = useState(""); // ✨ NUEVO: Estado para búsqueda de tópicos
  const [nichesSearch, setNichesSearch] = useState(""); // ✨ NUEVO: Estado para búsqueda de nichos
  const [activeTab, setActiveTab] = useState("basicos");

  // 🎯 NUEVO: Funciones para verificar compatibilidad de filtros por plataforma
  const isFilterDisabled = (filterType: string): boolean => {
    if (platform === "Facebook" || platform === "Threads") {
      const disabledFilters = {
        location: true, // Facebook y Threads no tienen country
        engagement: platform === "Threads", // Threads no tiene engagement rate
        niches: true, // Facebook y Threads no tienen nichos
        hashtags: platform === "Facebook", // Facebook no tiene hashtags
        categories: platform === "Threads", // Threads no tiene categorías
      };
      return disabledFilters[filterType as keyof typeof disabledFilters] || false;
    }
    
    if (platform === "TikTok") {
      const disabledFilters = {
        categories: true, // TikTok no tiene categorías
      };
      return disabledFilters[filterType as keyof typeof disabledFilters] || false;
    }

    if (platform === "YouTube") {
      const disabledFilters = {
        hashtags: true, // YouTube no soporta filtros de hashtags
      };
      return disabledFilters[filterType as keyof typeof disabledFilters] || false;
    }
    
    return false;
  };

  const getDisabledMessage = (filterType: string): string => {
    const platformName = platform === "Facebook" ? "Facebook" : "Threads";
    const messages = {
      location: `${platformName} actualmente no soporta filtrado por país`,
      engagement: `${platformName} actualmente no soporta filtrado por engagement rate`,
      niches: `${platformName} actualmente no soporta filtrado por nichos`,
      hashtags: "", // No mostrar mensaje explícito para hashtags en Facebook
      categories: `${platformName} actualmente no soporta filtrado por categorías`,
    };
    return messages[filterType as keyof typeof messages] || "";
  };

  const getTikTokDisabledMessage = (filterType: string): string => {
    const messages = {
      categories: "TikTok actualmente no soporta filtrado por categorías",
    };
    return messages[filterType as keyof typeof messages] || "";
  };

  const getYouTubeDisabledMessage = (filterType: string): string => {
    const messages = {
      hashtags: "YouTube actualmente no soporta filtrado por hashtags",
    };
    return messages[filterType as keyof typeof messages] || "";
  };

  const filteredCountries = countryList.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ⚠️ FUNCIÓN TEMPORALMENTE DESHABILITADA - Filtrar categorías por búsqueda
  // const filteredCategories = categoryList.filter(category =>
  //   category.name.toLowerCase().includes(topicsSearch.toLowerCase()) ||
  //   category.code.toLowerCase().includes(topicsSearch.toLowerCase()) ||
  //   category.description.toLowerCase().includes(topicsSearch.toLowerCase())
  // );

  // ✨ NUEVA FUNCIÓN: Filtrar nichos por búsqueda
  const filteredNiches = nichesList.filter(
    (niche) =>
      niche.name.toLowerCase().includes(nichesSearch.toLowerCase()) ||
      niche.code.toLowerCase().includes(nichesSearch.toLowerCase()) ||
      niche.category.toLowerCase().includes(nichesSearch.toLowerCase())
  );

  const getSelectedCountryName = () => {
    if (location === "all") return "Todos los países";
    const country = countryList.find((c) => c.code === location);
    return country ? country.name : location;
  };

  // ⚠️ FUNCIÓN TEMPORALMENTE DESHABILITADA - Obtener texto de categorías seleccionadas
  const getSelectedCategoriesText = () => {
    if (selectedCategories.length === 0) return "Seleccionar categorías";
    if (selectedCategories.length === 1) return formatCategoryName(selectedCategories[0]);
    return `${selectedCategories.length} categorías seleccionadas`;
  };

  // ✨ NUEVA FUNCIÓN: Toggle categoría seleccionada
  const toggleCategory = (categoryCode: string) => {
    if (selectedCategories.includes(categoryCode)) {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== categoryCode)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryCode]);
    }
  };

  // ✨ NUEVA FUNCIÓN: Obtener texto de nichos seleccionados
  const getSelectedNichesText = () => {
    if (niches.length === 0) return "Todos los nichos";
    if (niches.length === 1) {
      const niche = nichesList.find((n) => n.code === niches[0]);
      return niche ? niche.name : niches[0];
    }
    return `${niches.length} nichos seleccionados`;
  };

  // ✨ NUEVA FUNCIÓN: Obtener texto del growth rate seleccionado
  const getSelectedGrowthRateText = () => {
    if (!selectedGrowthRate) return "Todos los rangos de crecimiento";
    const growthRange = growthRateRanges.find(
      (r) =>
        r.min === selectedGrowthRate.min && r.max === selectedGrowthRate.max
    );
    return growthRange ? growthRange.label : "Rango personalizado";
  };

  // ✨ NUEVA FUNCIÓN: Limpiar búsqueda cuando se selecciona un filtro
  const clearSearchOnFilterChange = () => {
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
  };

  // 🎯 NUEVA FUNCIÓN: Limpiar filtros incompatibles cuando se cambia de plataforma
  const clearIncompatibleFilters = (newPlatform: string) => {
    // Crear un objeto temporal para verificar incompatibilidades
    const tempPlatform = newPlatform;
    
    // Función auxiliar para verificar si un filtro está deshabilitado en la nueva plataforma
    const isFilterDisabledForPlatform = (filterType: string, platform: string): boolean => {
      if (platform === "Facebook" || platform === "Threads") {
        const disabledFilters = {
          location: true, // Facebook y Threads no tienen country
          engagement: platform === "Threads", // Threads no tiene engagement rate
          niches: true, // Facebook y Threads no tienen nichos
          hashtags: platform === "Facebook", // Facebook no tiene hashtags
          categories: platform === "Threads", // Threads no tiene categorías
        };
        return disabledFilters[filterType as keyof typeof disabledFilters] || false;
      }
      
      if (platform === "TikTok") {
        const disabledFilters = {
          categories: true, // TikTok no tiene categorías
        };
        return disabledFilters[filterType as keyof typeof disabledFilters] || false;
      }
      
      return false;
    };

    // Limpiar location si no es compatible
    if (isFilterDisabledForPlatform("location", tempPlatform) && location !== "all") {
      setLocation("all");
    }

    // Limpiar engagement si no es compatible
    if (isFilterDisabledForPlatform("engagement", tempPlatform) && (minEngagement !== 0 || maxEngagement !== 100)) {
      setMinEngagement(0);
      setMaxEngagement(100);
    }

    // Limpiar nichos si no es compatible
    if (isFilterDisabledForPlatform("niches", tempPlatform) && niches.length > 0) {
      setNiches([]);
    }

    // Limpiar hashtags si no es compatible
    if (isFilterDisabledForPlatform("hashtags", tempPlatform) && hashtags.trim()) {
      setHashtags("");
    }

    // Limpiar categorías si no es compatible
    if (isFilterDisabledForPlatform("categories", tempPlatform) && selectedCategories.length > 0) {
      setSelectedCategories([]);
    }
  };

  // ⚠️ FUNCIÓN TEMPORALMENTE DESHABILITADA - Toggle categoría seleccionada
  // const toggleCategory = (categoryCode: string) => {
  //   if (topics.includes(categoryCode)) {
  //     setTopics(topics.filter(t => t !== categoryCode));
  //   } else {
  //     setTopics([...topics, categoryCode]);
  //   }
  // };

  // ✨ NUEVA FUNCIÓN: Toggle nicho seleccionado
  const toggleNiche = (nicheCode: string) => {
    if (niches.includes(nicheCode)) {
      setNiches(niches.filter((n) => n !== nicheCode));
    } else {
      setNiches([...niches, nicheCode]);
    }
  };

  // 🎯 NUEVA FUNCIÓN: Obtener categorías según la plataforma seleccionada
  const getAvailableCategories = (): string[] => {
    if (platform === "Facebook") {
      return facebookCategories;
    }
    if (platform === "YouTube") {
      return youtubeCategories;
    }
    // Para Instagram y TikTok, usar las categorías generales
    return instagramGeneralCategories;
  };

  // 🎯 FUNCIÓN PARA OBTENER EL ICONO DE LA CATEGORÍA
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Artist":
        return "Mic";
      case "Brand":
        return "Building2";
      case "Athlete":
        return "Trophy";
      case "Musician":
        return "Music";
      case "Fashion model":
        return "Camera";
      case "Media/news company":
        return "Newspaper";
      case "SPORTS_TEAM":
        return "Users";
      case "COMEDIAN":
        return "Laugh";
      case "Sportsperson":
        return "Award";
      case "Sports":
        return "Trophy";
      case "Education":
        return "GraduationCap";
      case "Politician":
        return "Vote";
      // 🎯 CATEGORÍAS ESPECÍFICAS DE FACEBOOK
      case "Page · Athlete":
        return "Trophy";
      case "Page · Kitchen/cooking":
        return "Trophy"; // Using Trophy as placeholder for Utensils
      case "Page · Broadcasting & media production company":
        return "Newspaper"; // Using Newspaper as placeholder for Radio
      case "Page · Food & beverage company":
        return "Trophy"; // Using Trophy as placeholder for Coffee
      case "Page · Artist":
        return "Mic";
      // 🎯 CATEGORÍAS ESPECÍFICAS DE YOUTUBE
      case "Anime/Animation":
        return "Video";
      case "Autos & Vehicles":
        return "Car";
      case "Comedy":
        return "Laugh";
      case "Education":
        return "GraduationCap";
      case "Entertainment":
        return "Tv";
      case "Family":
        return "Baby";
      case "Film & Animation":
        return "Video";
      case "Gaming":
        return "Gamepad2";
      case "Howto & Style":
        return "Scissors";
      case "Music":
        return "Music";
      case "News & Politics":
        return "Newspaper";
      case "Nonprofits & Activism":
        return "Heart";
      case "People & Blogs":
        return "Users";
      case "Pets & Animals":
        return "PawPrint";
      case "Science & Technology":
        return "Zap";
      case "Shorts":
        return "Play";
      case "Shows":
        return "Tv";
      case "Sports":
        return "Trophy";
      case "Trailers":
        return "Film";
      case "Travel & Events":
        return "Plane";
      default:
        return null;
    }
  };

  // 🎯 FUNCIÓN PARA OBTENER EL COLOR DEL ICONO
  const getCategoryIconColor = (cat: string) => {
    switch (cat) {
      case "Artist":
        return "text-purple-500";
      case "Brand":
        return "text-blue-500";
      case "Athlete":
        return "text-yellow-500";
      case "Musician":
        return "text-green-500";
      case "Fashion model":
        return "text-pink-500";
      case "Media/news company":
        return "text-orange-500";
      case "SPORTS_TEAM":
        return "text-indigo-500";
      case "COMEDIAN":
        return "text-purple-500";
      case "Sportsperson":
        return "text-red-500";
      case "Sports":
        return "text-blue-500";
      case "Education":
        return "text-teal-500";
      case "Politician":
        return "text-gray-600";
      // 🎯 COLORES PARA CATEGORÍAS DE FACEBOOK
      case "Page · Athlete":
        return "text-yellow-500";
      case "Page · Kitchen/cooking":
        return "text-orange-500";
      case "Page · Broadcasting & media production company":
        return "text-blue-500";
      case "Page · Food & beverage company":
        return "text-green-500";
      case "Page · Artist":
        return "text-purple-500";
      // 🎯 COLORES PARA CATEGORÍAS DE YOUTUBE
      case "Anime/Animation":
        return "text-purple-500";
      case "Autos & Vehicles":
        return "text-gray-600";
      case "Comedy":
        return "text-yellow-500";
      case "Education":
        return "text-teal-500";
      case "Entertainment":
        return "text-purple-500";
      case "Family":
        return "text-pink-500";
      case "Film & Animation":
        return "text-orange-500";
      case "Gaming":
        return "text-blue-500";
      case "Howto & Style":
        return "text-indigo-500";
      case "Music":
        return "text-green-500";
      case "News & Politics":
        return "text-red-500";
      case "Nonprofits & Activism":
        return "text-red-600";
      case "People & Blogs":
        return "text-pink-500";
      case "Pets & Animals":
        return "text-amber-500";
      case "Science & Technology":
        return "text-blue-600";
      case "Shorts":
        return "text-purple-600";
      case "Shows":
        return "text-purple-500";
      case "Sports":
        return "text-red-500";
      case "Trailers":
        return "text-orange-600";
      case "Travel & Events":
        return "text-cyan-500";
      default:
        return "text-gray-500";
    }
  };

  // 🎯 FUNCIÓN PARA FORMATEAR EL NOMBRE DE LA CATEGORÍA
const formatCategoryName = (category: string): string => {
  // Para categorías de Facebook, remover el prefijo "Page ·"
  if (category.startsWith("Page · ")) {
    const withoutPrefix = category.replace("Page · ", "");
    // Caso especial para "Broadcasting & media production company"
    if (withoutPrefix === "Broadcasting & media production company") {
      return "media company";
    }
    return withoutPrefix;
  }
  return category;
  };

  // ✨ NUEVA FUNCIÓN: Obtener filtros activos para mostrar como píldoras
  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    // Filtro de plataforma
    if (platform !== "all") {
      filters.push({
        id: "platform",
        label: platform,
        icon:
          platform === "YouTube"
            ? "/icons/youtube.svg"
            : platform === "Instagram"
            ? "/icons/instagram.svg"
            : platform === "TikTok"
            ? "/icons/tiktok.svg"
            : platform === "Facebook"
            ? "/icons/facebook.svg"
            : platform === "Threads"
            ? "/icons/threads.svg"
            : null,
        type: "platform",
      });
    }

    // Filtro de país
    if (location !== "all") {
      const country = countryList.find((c) => c.code === location);
      if (country) {
        filters.push({
          id: "location",
          label: country.name,
          icon: `/banderas/${country.name}.png`,
          type: "location",
        });
      }
    }

    // Filtro de seguidores
    if (minFollowers !== 0 || maxFollowers !== 100000000) {
      const followerRange = followerRanges.find(
        (r) => r.min === minFollowers && r.max === maxFollowers
      );
      if (followerRange) {
        // Extraer solo los números del rango (parte entre paréntesis)
        const rangeMatch = followerRange.label.match(/\((.*?)\)/);
        const rangeNumbers = rangeMatch ? rangeMatch[1] : followerRange.label;
        filters.push({
          id: "followers",
          label: rangeNumbers,
          icon: null,
          type: "followers",
        });
      } else {
        filters.push({
          id: "followers",
          label: `${formatNumber(minFollowers)} - ${formatNumber(
            maxFollowers
          )}`,
          icon: null,
          type: "followers",
        });
      }
    }

    // Filtro de engagement
    if (minEngagement !== 0 || maxEngagement !== 100) {
      const engagementRange = engagementRanges.find(
        (r) => r.min === minEngagement && r.max === maxEngagement
      );
      if (engagementRange) {
        filters.push({
          id: "engagement",
          label: engagementRange.label,
          icon: null,
          type: "engagement",
        });
      } else {
        filters.push({
          id: "engagement",
          label: `${minEngagement}% - ${maxEngagement}% engagement`,
          icon: null,
          type: "engagement",
        });
      }
    }

    // Filtro de growth rate
    if (selectedGrowthRate) {
      const growthRange = growthRateRanges.find(
        (r) =>
          r.min === selectedGrowthRate.min && r.max === selectedGrowthRate.max
      );
      if (growthRange) {
        filters.push({
          id: "growthRate",
          label: growthRange.label,
          icon: null,
          type: "growthRate",
        });
      }
    }

    // Filtro de nichos
    if (niches.length > 0) {
      niches.forEach((nicheCode) => {
        const niche = nichesList.find((n) => n.code === nicheCode);
        if (niche) {
          filters.push({
            id: `niche-${nicheCode}`,
            label: niche.name,
            icon: niche.icon,
            type: "niche",
          });
        }
      });
    }

    // Filtro de hashtags
    if (hashtags.trim()) {
      filters.push({
        id: "hashtags",
        label: hashtags,
        icon: "#",
        type: "hashtags",
      });
    }

    // Filtro de categorías
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((category) => {
        filters.push({
          id: `category-${category}`,
          label: formatCategoryName(category),
          icon: getCategoryIcon(category),
          iconColor: getCategoryIconColor(category),
          type: "category",
        });
      });
    }

    return filters;
  };

  // ✨ NUEVA FUNCIÓN: Eliminar filtro específico
  const removeFilter = (filterId: string, filterType: string) => {
    switch (filterType) {
      case "platform":
        setPlatform("all");
        break;
      case "location":
        setLocation("all");
        break;
      case "followers":
        setMinFollowers(0);
        setMaxFollowers(100000000);
        break;
      case "engagement":
        setMinEngagement(0);
        setMaxEngagement(100);
        break;
      case "growthRate":
        setSelectedGrowthRate(null);
        break;
      case "niche":
        const nicheCode = filterId.replace("niche-", "");
        setNiches(niches.filter((n) => n !== nicheCode));
        break;
      case "hashtags":
        setHashtags("");
        break;
      case "category":
        const category = filterId.replace("category-", "");
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
        break;
    }
  };

  return (
    <Card
      className={cn(
        "sticky top-4 bg-white border-0 shadow-xl rounded-xl overflow-hidden transition-all duration-200",
        "lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto",
        showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-sm">
            <TabsTrigger
              value="basicos"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm"
            >
              Básicos
            </TabsTrigger>
            <TabsTrigger
              value="avanzados"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm"
            >
              Avanzados
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ✨ NUEVA SECCIÓN: Píldoras de filtros activos */}
        {getActiveFilters().length > 0 && (
          <div className="px-6 py-2 bg-white border-b">
            <div className="grid grid-cols-2 gap-2">
              {getActiveFilters().map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center justify-center gap-2 px-3 py-1 bg-gray-200 hover:bg-gray-100 cursor-pointer shadow-md"
                  onClick={() => removeFilter(filter.id, filter.type)}
                >
                  {filter.icon && typeof filter.icon === "string" && filter.icon.startsWith("/") ? (
                    <img
                      src={filter.icon}
                      alt={filter.label}
                      className="h-3 w-3 object-contain"
                      onError={(e) => {
                        if (e.currentTarget) {
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                  ) : filter.icon && filter.type === "category" ? (
                    <div className={`h-3 w-3 ${filter.iconColor}`}>
                      {filter.icon === "Mic" && <Mic className="h-3 w-3" />}
                      {filter.icon === "Building2" && (
                        <Building2 className="h-3 w-3" />
                      )}
                      {filter.icon === "Trophy" && (
                        <Trophy className="h-3 w-3" />
                      )}
                      {filter.icon === "Music" && <Music className="h-3 w-3" />}
                      {filter.icon === "Camera" && (
                        <Camera className="h-3 w-3" />
                      )}
                      {filter.icon === "Newspaper" && (
                        <Newspaper className="h-3 w-3" />
                      )}
                      {filter.icon === "Users" && <Users className="h-3 w-3" />}
                      {filter.icon === "Laugh" && <Laugh className="h-3 w-3" />}
                      {filter.icon === "Award" && <Award className="h-3 w-3" />}
                      {filter.icon === "GraduationCap" && (
                        <GraduationCap className="h-3 w-3" />
                      )}
                      {filter.icon === "Vote" && <Vote className="h-3 w-3" />}
                    </div>
                  ) : filter.icon && typeof filter.icon === "string" ? (
                    <span className="text-xs">{filter.icon}</span>
                  ) : null}
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {filter.label}
                  </span>
                  <X className="h-3 w-3 ml-1 hover:text-red-600 text-gray-500" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content - Básicos */}
        <TabsContent value="basicos" className="mt-0 h-full">
          <div className="p-6 space-y-5 h-full flex flex-col">
            {/* Búsqueda Principal */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ej: @mrbeast, lali, duki, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* Plataforma - Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Plataforma
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12 px-4 bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {platform === "all" && (
                        <>
                          <Filter className="h-5 w-5 text-blue-600" />
                          <span>Todas las plataformas</span>
                        </>
                      )}
                      {platform === "YouTube" && (
                        <>
                          <img
                            src="/icons/youtube.svg"
                            alt="YouTube"
                            className="h-5 w-5"
                          />
                          <span>YouTube</span>
                        </>
                      )}
                      {platform === "Instagram" && (
                        <>
                          <img
                            src="/icons/instagram.svg"
                            alt="Instagram"
                            className="h-5 w-5"
                          />
                          <span>Instagram</span>
                        </>
                      )}
                      {platform === "TikTok" && (
                        <>
                          <img
                            src="/icons/tiktok.svg"
                            alt="TikTok"
                            className="h-5 w-5"
                          />
                          <span>TikTok</span>
                        </>
                      )}
                      {platform === "Facebook" && (
                        <>
                          <img
                            src="/icons/facebook.svg"
                            alt="Facebook"
                            className="h-5 w-5"
                          />
                          <span>Facebook</span>
                        </>
                      )}
                      {platform === "Threads" && (
                        <>
                          <img
                            src="/icons/threads.svg"
                            alt="Threads"
                            className="h-5 w-5"
                          />
                          <span>Threads</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("all");
                      setPlatform("all");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "all"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Filter className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Todas las plataformas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("YouTube");
                      setPlatform("YouTube");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "YouTube"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <img
                      src="/icons/youtube.svg"
                      alt="YouTube"
                      className="h-5 w-5"
                    />
                    <span className="font-medium">YouTube</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("Instagram");
                      setPlatform("Instagram");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "Instagram"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <img
                      src="/icons/instagram.svg"
                      alt="Instagram"
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("TikTok");
                      setPlatform("TikTok");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "TikTok"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <img
                      src="/icons/tiktok.svg"
                      alt="TikTok"
                      className="h-5 w-5"
                    />
                    <span className="font-medium">TikTok</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("Facebook");
                      setPlatform("Facebook");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "Facebook"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <img
                      src="/icons/facebook.svg"
                      alt="Facebook"
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      clearIncompatibleFilters("Threads");
                      setPlatform("Threads");
                      clearSearchOnFilterChange();
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer",
                      platform === "Threads"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <img
                      src="/icons/threads.svg"
                      alt="Threads"
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Threads</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Location Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">País</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isFilterDisabled("location")}
                    className={cn(
                      "w-full justify-between bg-white border-gray-200",
                      isFilterDisabled("location") 
                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {location !== "all" && !isFilterDisabled("location") && (
                        <img
                          src={`/banderas/${getSelectedCountryName()}.png`}
                          alt={getSelectedCountryName()}
                          className="h-4 w-7 inline-block object-cover"
                          onError={(e) => {
                            // Si falla, oculta la imagen silenciosamente
                            if (e.currentTarget) {
                              e.currentTarget.style.display = "none";
                            }
                          }}
                        />
                      )}
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {isFilterDisabled("location") 
                          ? "No disponible" 
                          : getSelectedCountryName()
                        }
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                {isFilterDisabled("location") ? (
                  <DropdownMenuContent
                    align="start"
                    className="w-[300px] bg-white p-3"
                  >
                    <div className="text-sm text-gray-600 text-center">
                      {platform === "TikTok" ? getTikTokDisabledMessage("location") : getDisabledMessage("location")}
                    </div>
                  </DropdownMenuContent>
                ) : (
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white"
                >
                  <div className="p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar país..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full pl-8 bg-white border-gray-200 h-9"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-9 px-2 mb-1 rounded-md text-left",
                        location === "all"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        setLocation("all");
                        clearSearchOnFilterChange();
                      }}
                    >
                      Todos los países
                    </Button>
                    <DropdownMenuSeparator />
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <Button
                          key={country.code}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-9 px-2 mb-1 rounded-md text-left",
                            location === country.code
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => {
                            setLocation(country.code);
                            clearSearchOnFilterChange();
                          }}
                        >
                          <img
                            src={`/banderas/${country.name}.png`}
                            alt={country.name}
                            className="h-4 w-7 mr-2 inline-block object-cover"
                            onError={(e) => {
                              // Si falla, oculta la imagen silenciosamente
                              if (e.currentTarget) {
                                e.currentTarget.style.display = "none";
                              }
                            }}
                          />
                          {country.name}
                        </Button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          No se encontraron países
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>

            {/* Followers Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Seguidores
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {minFollowers === 0 && maxFollowers === 100000000
                          ? "Todos los rangos"
                          : (
                              <>
                                <NumberDisplay value={minFollowers} format="short" /> - <NumberDisplay value={maxFollowers} format="short" />
                              </>
                            )}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white p-2"
                >
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-left",
                        minFollowers === 0 && maxFollowers === 100000000
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      )}
                      onClick={() => {
                        setMinFollowers(0);
                        setMaxFollowers(100000000);
                        clearSearchOnFilterChange();
                      }}
                    >
                      <span className="text-sm font-medium">
                        Todos los rangos
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    {followerRanges.map((range) => (
                      <div
                        key={range.label}
                        className={cn(
                          "flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-left",
                          minFollowers === range.min &&
                            maxFollowers === range.max
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700"
                        )}
                        onClick={() => {
                          setMinFollowers(range.min);
                          setMaxFollowers(range.max);
                          clearSearchOnFilterChange();
                        }}
                      >
                        <span className="text-sm font-medium">
                          {range.label}
                        </span>
                      </div>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-2 text-center">
                        o
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Desde"
                          value={minFollowers || ""}
                          onChange={(e) =>
                            setMinFollowers(Number(e.target.value))
                          }
                          className="w-1/2 bg-white text-sm h-8"
                        />
                        <span className="text-gray-400">~</span>
                        <Input
                          type="number"
                          placeholder="Hasta"
                          value={maxFollowers || ""}
                          onChange={(e) =>
                            setMaxFollowers(Number(e.target.value))
                          }
                          className="w-1/2 bg-white text-sm h-8"
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Engagement Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Engagement Rate
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isFilterDisabled("engagement")}
                    className={cn(
                      "w-full justify-between bg-white border-gray-200",
                      isFilterDisabled("engagement") 
                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {isFilterDisabled("engagement")
                          ? "No disponible"
                          : minEngagement === 0 && maxEngagement === 100
                          ? "Todos los rangos"
                          : `${minEngagement}% - ${maxEngagement}%`
                        }
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                {isFilterDisabled("engagement") ? (
                  <DropdownMenuContent
                    align="start"
                    className="w-[300px] bg-white p-3"
                  >
                    <div className="text-sm text-gray-600 text-center">
                      {platform === "TikTok" ? getTikTokDisabledMessage("engagement") : getDisabledMessage("engagement")}
                    </div>
                  </DropdownMenuContent>
                ) : (
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white p-2"
                >
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-left",
                        minEngagement === 0 && maxEngagement === 100
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      )}
                      onClick={() => {
                        setMinEngagement(0);
                        setMaxEngagement(100);
                        clearSearchOnFilterChange();
                      }}
                    >
                      <span className="text-sm font-medium">
                        Todos los rangos
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    {engagementRanges.map((range) => (
                      <div
                        key={range.label}
                        className={cn(
                          "flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-left",
                          minEngagement === range.min &&
                            maxEngagement === range.max
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700"
                        )}
                        onClick={() => {
                          setMinEngagement(range.min);
                          setMaxEngagement(range.max);
                          clearSearchOnFilterChange();
                        }}
                      >
                        <span className="text-sm font-medium">
                          {range.label}
                        </span>
                      </div>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-2 text-center">
                        o
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Desde %"
                          value={minEngagement || ""}
                          onChange={(e) =>
                            setMinEngagement(Number(e.target.value))
                          }
                          className="w-1/2 bg-white text-sm h-8"
                        />
                        <span className="text-gray-400">~</span>
                        <Input
                          type="number"
                          placeholder="Hasta %"
                          value={maxEngagement || ""}
                          onChange={(e) =>
                            setMaxEngagement(Number(e.target.value))
                          }
                          className="w-1/2 bg-white text-sm h-8"
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 mt-auto">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
              >
                Buscar
              </Button>
              <Button
                variant="outline"
                className="w-full text-gray-600 bg-white hover:bg-gray-50"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content - Avanzados */}
        <TabsContent value="avanzados" className="mt-0 h-full">
          <div className="p-6 space-y-5 h-full flex flex-col">
            {/* ⚠️ CATEGORÍAS TEMPORALMENTE DESHABILITADAS - NO FUNCIONAN BIEN 
             {/*
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Categorías</label>
                ... sección comentada por problemas de funcionamiento
              </div>
             */}

            {/* ✨ NICHOS - Dropdown con selección múltiple */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nichos (Keywords)
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isFilterDisabled("niches")}
                    className={cn(
                      "w-full justify-between bg-white border-gray-200",
                      isFilterDisabled("niches") 
                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 truncate">
                        {isFilterDisabled("niches")
                          ? "No disponible"
                          : getSelectedNichesText()
                        }
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                {isFilterDisabled("niches") ? (
                  <DropdownMenuContent
                    align="start"
                    className="w-[350px] bg-white p-3"
                  >
                    <div className="text-sm text-gray-600 text-center">
                      {platform === "TikTok" ? getTikTokDisabledMessage("niches") : getDisabledMessage("niches")}
                    </div>
                  </DropdownMenuContent>
                ) : (
                <DropdownMenuContent
                  align="start"
                  className="w-[350px] bg-white"
                >
                  <div className="p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar nicho..."
                        value={nichesSearch}
                        onChange={(e) => setNichesSearch(e.target.value)}
                        className="w-full pl-8 bg-white border-gray-200 h-9"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-9 px-2 mb-1 rounded-md hover:bg-gray-50 text-left"
                      onClick={() => {
                        setNiches([]);
                        clearSearchOnFilterChange();
                      }}
                    >
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      Limpiar nichos
                    </Button>
                    <DropdownMenuSeparator />
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredNiches.map((niche) => (
                        <Button
                          key={niche.code}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-9 px-2 mb-1 rounded-md text-left",
                            niches.includes(niche.code)
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => {
                            toggleNiche(niche.code);
                            clearSearchOnFilterChange();
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span>{niche.icon}</span>
                            <span className="flex-1 text-left">
                              {niche.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {niche.category}
                            </Badge>
                            {niches.includes(niche.code) && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </Button>
                      ))}
                      {filteredNiches.length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          No se encontraron nichos
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>

            {/* ✨ HASHTAGS - Input para escribir hashtags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Hashtags
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isFilterDisabled("hashtags") ? "No disponible" : "Ej: #fitness, #travel, #food..."}
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  disabled={isFilterDisabled("hashtags")}
                  className={cn(
                    "pl-10 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                    isFilterDisabled("hashtags") 
                      ? "opacity-50 cursor-not-allowed bg-gray-100" 
                      : ""
                  )}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                {isFilterDisabled("hashtags") && (
                  <div className="mt-1 text-xs text-gray-500">
                    {platform === "TikTok" ? getTikTokDisabledMessage("hashtags") : 
                     platform === "YouTube" ? getYouTubeDisabledMessage("hashtags") :
                     getDisabledMessage("hashtags")}
                  </div>
                )}
              </div>
            </div>

            {/* ✨ GROWTH RATE - Dropdown con rangos de crecimiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Growth Rate de Followers (30 días)
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {getSelectedGrowthRateText()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white p-2"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-2 rounded-md text-left hover:bg-gray-50"
                        onClick={() => {
                          setSelectedGrowthRate(null);
                          clearSearchOnFilterChange();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              !selectedGrowthRate ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="text-sm">
                            Todos los rangos de crecimiento
                          </span>
                        </div>
                      </Button>
                      {growthRateRanges.map((range) => (
                        <Button
                          key={range.label}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-9 px-2 rounded-md text-left",
                            selectedGrowthRate &&
                              selectedGrowthRate.min === range.min &&
                              selectedGrowthRate.max === range.max
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => {
                            setSelectedGrowthRate(range);
                            clearSearchOnFilterChange();
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedGrowthRate &&
                                  selectedGrowthRate.min === range.min &&
                                  selectedGrowthRate.max === range.max
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="text-sm">{range.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ✨ CATEGORÍAS - Dropdown con categorías de CreatorDB */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Categorías
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isFilterDisabled("categories")}
                    className={cn(
                      "w-full justify-between bg-white border-gray-200",
                      isFilterDisabled("categories") 
                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {isFilterDisabled("categories")
                          ? "No disponible"
                          : getSelectedCategoriesText()
                        }
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                {isFilterDisabled("categories") ? (
                  <DropdownMenuContent
                    align="start"
                    className="w-[300px] bg-white p-3"
                  >
                    <div className="text-sm text-gray-600 text-center">
                      {platform === "TikTok" ? getTikTokDisabledMessage("categories") : getDisabledMessage("categories")}
                    </div>
                  </DropdownMenuContent>
                ) : (
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white p-2"
                >
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 mb-2 text-center">
                      Seleccionar categorías
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {getAvailableCategories().map((category) => (
                      <Button
                          key={category}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-9 px-2 rounded-md text-left",
                            selectedCategories.includes(category)
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => {
                            toggleCategory(category);
                          clearSearchOnFilterChange();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                                selectedCategories.includes(category)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                                                     <div className={`h-4 w-4 ${getCategoryIconColor(category)}`}>
                             {getCategoryIcon(category) === "Mic" && <Mic className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Building2" && <Building2 className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Trophy" && <Trophy className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Music" && <Music className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Camera" && <Camera className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Newspaper" && <Newspaper className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Users" && <Users className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Laugh" && <Laugh className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Award" && <Award className="h-4 w-4" />}
                             {getCategoryIcon(category) === "GraduationCap" && <GraduationCap className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Vote" && <Vote className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Tv" && <Tv className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Gamepad2" && <Gamepad2 className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Video" && <Video className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Car" && <Car className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Baby" && <Baby className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Scissors" && <Scissors className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Heart" && <Heart className="h-4 w-4" />}
                             {getCategoryIcon(category) === "PawPrint" && <PawPrint className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Zap" && <Zap className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Play" && <Play className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Film" && <Film className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Plane" && <Plane className="h-4 w-4" />}
                           </div>
                          <span className="text-sm">{formatCategoryName(category)}</span>
                        </div>
                      </Button>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 mt-auto">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
              >
                Buscar
              </Button>
              <Button
                variant="outline"
                className="w-full text-gray-600 bg-white hover:bg-gray-50"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
