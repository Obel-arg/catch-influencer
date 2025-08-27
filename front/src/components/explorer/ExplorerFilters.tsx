"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { hypeAuditorDiscoveryService, HypeAuditorTaxonomyCategory } from "@/lib/services/hypeauditor-discovery.service";
import { getCategoriesForPlatform, getPlatformDisplayName, HypeAuditorCategory } from "@/constants/hypeauditor-categories";
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
  Calendar,
  Globe,
  MonitorPlay,
  ChefHat,
  Coffee,
  Utensils,
  Shield,
  Activity,
  Palette,
  HelpCircle,
  Stethoscope,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import HypeAuditorFilters from "./HypeAuditorFilters";

// Interfaz para los filtros activos
interface ActiveFilter {
  id: string;
  label: string;
  icon: string | null;
  iconColor?: string;
  type: string;
  data?: string;
}

// Función para formatear números
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

interface ExplorerFiltersProps {
  platform: string;
  setPlatform: Dispatch<SetStateAction<string>>;
  topics: string[];
  setTopics: Dispatch<SetStateAction<string[]>>;

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


  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;

  selectedCategories: string[];
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
  categories: string[];
  locations: string[];
  handleSearch: () => void;
  handleClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  
  // Filtros de audiencia para HypeAuditor
  audienceGender: { gender: 'male' | 'female' | 'any'; percentage: number };
  setAudienceGender: Dispatch<SetStateAction<{ gender: 'male' | 'female' | 'any'; percentage: number }>>;
  audienceAge: { minAge: number; maxAge: number; percentage: number };
  setAudienceAge: Dispatch<SetStateAction<{ minAge: number; maxAge: number; percentage: number }>>;
  audienceGeo: { countries: { [key: string]: number }; cities: { [key: string]: number } };
  setAudienceGeo: Dispatch<SetStateAction<{ countries: { [key: string]: number }; cities: { [key: string]: number } }>>;

  // ✨ NUEVO: Categorías del taxonomy de HypeAuditor
  taxonomyCategories: { include: string[]; exclude: string[] };
  setTaxonomyCategories: Dispatch<SetStateAction<{ include: string[]; exclude: string[] }>>;
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




// 🎯 NUEVAS INTERFACES PARA FILTROS DE HYPEAUDITOR DISCOVERY
interface AudienceGenderFilter {
  gender: 'male' | 'female' | 'any';
  percentage: number;
}



interface AudienceGeoFilter {
  countries: string[];
  cities: string[];
}

export default function ExplorerFilters(props: ExplorerFiltersProps) {
  const {
    platform,
    setPlatform,
    topics,
    setTopics,

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

    searchQuery,
    setSearchQuery,

    selectedCategories,
    setSelectedCategories,
    categories,
    locations,
    handleSearch,
    handleClearFilters,
    showFilters,
    setShowFilters,
    
    // Filtros de audiencia para HypeAuditor
    audienceGender,
    setAudienceGender,
    audienceAge,
    setAudienceAge,
    audienceGeo,
    setAudienceGeo,
    
    // ✨ NUEVO: Props para categorías del taxonomy
    taxonomyCategories,
    setTaxonomyCategories,
  } = props;

  const [countrySearch, setCountrySearch] = useState("");
  const [topicsSearch, setTopicsSearch] = useState(""); // ✨ NUEVO: Estado para búsqueda de tópicos
  const [selectedCountryForEdit, setSelectedCountryForEdit] = useState<string | null>(null); // País seleccionado para editar porcentaje

  const [activeTab, setActiveTab] = useState("basicos");

  // 🎯 NUEVOS ESTADOS PARA FILTROS DE HYPEAUDITOR DISCOVERY
  // audienceGender, audienceAge y audienceGeo se pasan como props desde Explorer.tsx
  const [accountType, setAccountType] = useState<'brand' | 'human' | 'any'>('any');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [hasContacts, setHasContacts] = useState<boolean | null>(null);
  const [hasLaunchedAdvertising, setHasLaunchedAdvertising] = useState<boolean | null>(null);
  const [aqsRange, setAqsRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [cqsRange, setCqsRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });

  // 🎯 NUEVO: Funciones para verificar compatibilidad de filtros por plataforma
  const isFilterDisabled = (filterType: string): boolean => {
    if (platform === "TikTok") {
      const disabledFilters = {
        categories: true, // TikTok no tiene categorías en el taxonomy actual
      };
      return disabledFilters[filterType as keyof typeof disabledFilters] || false;
    }
    
    return false;
  };

  const getTikTokDisabledMessage = (filterType: string): string => {
    const messages = {
      categories: "TikTok actualmente no soporta filtrado por categorías en el taxonomy",
      location: "Este filtro no está disponible para esta plataforma",
      engagement: "Este filtro no está disponible para esta plataforma",
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



  const getSelectedCountryName = () => {
    if (location === "all") return "Todos los países";
    const country = countryList.find((c) => c.code === location);
    return country ? country.name : location;
  };

  // ✨ FUNCIÓN: Obtener texto de categorías seleccionadas
  const getSelectedCategoriesText = () => {
    if (selectedCategories.length === 0) {
      return "Seleccionar categorías";
    }
    if (selectedCategories.length === 1) return formatCategoryName(selectedCategories[0]);
    return `${selectedCategories.length} categorías seleccionadas`;
  };

  // ✨ NUEVA FUNCIÓN: Obtener texto del audience gender seleccionado
  const getSelectedAudienceGenderText = () => {
    if (audienceGender.gender === 'any') return "Any gender";
    const genderText = audienceGender.gender === 'male' ? 'Male' : 'Female';
    return `${genderText} >${audienceGender.percentage}%`;
  };

  // ✨ NUEVA FUNCIÓN: Obtener texto del audience age seleccionado
  const getSelectedAudienceAgeText = () => {
    if (audienceAge.minAge === 18 && audienceAge.maxAge === 54 && audienceAge.percentage === 10) {
      return "Any age";
    }
    return `${audienceAge.minAge}-${audienceAge.maxAge} years >${audienceAge.percentage}%`;
  };

  // ✨ NUEVA FUNCIÓN: Obtener texto del audience geo seleccionado
  const getSelectedAudienceGeoText = () => {
    const countriesCount = Object.keys(audienceGeo.countries).length;
    const citiesCount = Object.keys(audienceGeo.cities).length;
    const totalSelected = countriesCount + citiesCount;
    
    if (totalSelected === 0) return "Any location";
    if (totalSelected === 1) {
      if (countriesCount > 0) {
        const countryCode = Object.keys(audienceGeo.countries)[0];
        const country = countryList.find(c => c.code === countryCode);
        const locationName = country ? country.name : countryCode;
        return `${locationName} >${audienceGeo.countries[countryCode]}%`;
      } else {
        const cityName = Object.keys(audienceGeo.cities)[0];
        return `${cityName} >${audienceGeo.cities[cityName]}%`;
      }
    }
    return `${totalSelected} locations selected`;
  };

  // ✨ FUNCIÓN: Toggle categoría del taxonomy de HypeAuditor
  const toggleCategory = (categoryCode: string) => {
    const categoryId = getTaxonomyCategoryId(categoryCode);
    if (!categoryId || !setTaxonomyCategories) return;

    // Actualizar taxonomyCategories (para el backend)
    setTaxonomyCategories((prev: { include: string[]; exclude: string[] }) => {
      const isCurrentlyIncluded = prev.include.includes(categoryId);
      
      if (isCurrentlyIncluded) {
        // Remover de include
        return {
          ...prev,
          include: prev.include.filter((id: string) => id !== categoryId)
        };
      } else {
        // Agregar a include
        return {
          ...prev,
          include: [...prev.include, categoryId]
        };
      }
    });
    
    // Actualizar selectedCategories (para la UI)
    if (selectedCategories.includes(categoryCode)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryCode));
    } else {
      setSelectedCategories([...selectedCategories, categoryCode]);
    }
  };



  // ✨ NUEVA FUNCIÓN: Limpiar búsqueda cuando se selecciona un filtro
  const clearSearchOnFilterChange = () => {
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
  };

    // 🎯 NUEVA FUNCIÓN: Limpiar filtros incompatibles cuando se cambia de plataforma
  const clearIncompatibleFilters = (newPlatform: string) => {
    // Solo TikTok tiene filtros deshabilitados actualmente
    if (newPlatform === "TikTok") {
      // TikTok no tiene categorías en el taxonomy, limpiar categorías seleccionadas
      if (selectedCategories.length > 0) {
        setSelectedCategories([]);
      }
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

 

  // 🎯 FUNCIÓN: Obtener categorías del taxonomy de HypeAuditor según la plataforma
  const getAvailableCategories = (): string[] => {
    // Si la plataforma es "all" (por defecto), usar las categorías del taxonomy de Instagram
    if (platform === "all") {
      const instagramTaxonomyCategories = getCategoriesForPlatform("Instagram");
      return instagramTaxonomyCategories.map(cat => cat.name);
    }
    
    const taxonomyCategories = getCategoriesForPlatform(platform);
    return taxonomyCategories.map(cat => cat.name);
  };

  // 🎯 FUNCIÓN: Obtener el ID de la categoría del taxonomy
  const getTaxonomyCategoryId = (categoryName: string): string | null => {
    // Si la plataforma es "all", usar Instagram por defecto para los IDs
    const platformForId = platform === "all" ? "Instagram" : platform;
    const taxonomyCategories = getCategoriesForPlatform(platformForId);
    const found = taxonomyCategories.find(cat => cat.name === categoryName);
    return found ? found.id : null;
  };

  // 🎯 FUNCIÓN PARA OBTENER EL ICONO DE LA CATEGORÍA
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      // ✨ CATEGORÍAS DEL TAXONOMY DE INSTAGRAM (cuando platform === "all")
      case "Beauty":
        return "Heart";
      case "Fashion":
        return "Camera";
      case "Fitness & Gym":
        return "Trophy";
      case "Food & Cooking":
        return "ChefHat";
      case "Gaming":
        return "Gamepad2";
      case "Music":
        return "Music";
      case "Travel":
        return "Plane";
      case "Lifestyle":
        return "Heart";
      case "Modeling":
        return "Camera";
      case "Art/Artists":
        return "Mic";
      case "Photography":
        return "Camera";
      case "Sports with a ball":
        return "Trophy";
      case "Education":
        return "GraduationCap";
      case "Business & Careers":
        return "Building2";
      case "Health & Medicine":
        return "Heart";
      case "Accessories & Jewellery":
        return "Award";
      case "Cinema & Actors/actresses":
        return "Film";
      case "Clothing & Outfits":
        return "Scissors";
      case "Computers & Gadgets":
        return "Zap";
      case "Family":
        return "Baby";
      case "Finance & Economics":
        return "Building2";
      case "Nature & landscapes":
        return "PawPrint";
      case "Trainers & Coaches":
        return "Award";
      case "Crypto":
        return "Zap";
      case "NFT":
        return "Zap";
        
      // 🎯 CATEGORÍAS GENERALES PARA INSTAGRAM Y TIKTOK (legacy)
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
      case "Entertainment website":
        return "MonitorPlay";
      case "Sports team":
        return "Shield";
      case "Comedian":
        return "Laugh";
      case "Sportsperson":
        return "Award";
      case "Sports":
        return "Trophy";
      case "Politician":
        return "Vote";
        
      // ✨ CATEGORÍAS ESPECÍFICAS DEL TAXONOMY DE YOUTUBE
      case "Fitness":
        return "Trophy";
      case "Food & Drinks":
        return "Coffee";
      case "Music & Dance":
        return "Music";
      case "Video games":
        return "Gamepad2";
      case "Animals & Pets":
        return "PawPrint";
      case "Animation":
        return "Video";
      case "ASMR":
        return "Activity";
      case "Daily vlogs":
        return "Camera";
      case "Design/art":
        return "Palette";
      case "DIY & Life Hacks":
        return "Scissors";
      case "Family & Parenting":
        return "Baby";
      case "Health & Self Help":
        return "Stethoscope";
      case "Humor":
        return "Laugh";
      case "Movies":
        return "Film";
      case "Mystery":
        return "HelpCircle";
      case "Show":
        return "Tv";
      case "Toys":
        return "Baby";

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
      // ✨ COLORES PARA CATEGORÍAS DEL TAXONOMY DE INSTAGRAM (cuando platform === "all")
      case "Beauty":
        return "text-pink-500";
      case "Fashion":
        return "text-purple-500";
      case "Fitness & Gym":
        return "text-red-500";
      case "Food & Cooking":
        return "text-orange-500";
      case "Gaming":
        return "text-blue-500";
      case "Music":
        return "text-green-500";
      case "Travel":
        return "text-cyan-500";
      case "Lifestyle":
        return "text-pink-400";
      case "Modeling":
        return "text-purple-400";
      case "Art/Artists":
        return "text-purple-600";
      case "Photography":
        return "text-indigo-500";
      case "Sports with a ball":
        return "text-red-600";
      case "Business & Careers":
        return "text-blue-600";
      case "Health & Medicine":
        return "text-green-600";
      case "Accessories & Jewellery":
        return "text-amber-500";
      case "Cinema & Actors/actresses":
        return "text-orange-600";
      case "Clothing & Outfits":
        return "text-indigo-400";
      case "Computers & Gadgets":
        return "text-blue-700";
      case "Family":
        return "text-pink-600";
      case "Finance & Economics":
        return "text-green-700";
      case "Nature & landscapes":
        return "text-emerald-500";
      case "Trainers & Coaches":
        return "text-yellow-600";
      case "Crypto":
        return "text-yellow-500";
      case "NFT":
        return "text-purple-700";
        
      // 🎯 COLORES PARA CATEGORÍAS GENERALES (legacy)
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
      case "Entertainment website":
        return "text-purple-600";
      case "Sports team":
        return "text-indigo-500";
      case "Comedian":
        return "text-purple-500";
      case "Sportsperson":
        return "text-red-500";
      case "Sports":
        return "text-blue-500";
      case "Education":
        return "text-teal-500";
      case "Politician":
        return "text-gray-600";
        
      // ✨ COLORES PARA CATEGORÍAS ESPECÍFICAS DEL TAXONOMY DE YOUTUBE
      case "Fitness":
        return "text-red-500";
      case "Food & Drinks":
        return "text-amber-600";
      case "Music & Dance":
        return "text-green-600";
      case "Video games":
        return "text-blue-600";
      case "Animals & Pets":
        return "text-amber-600";
      case "Animation":
        return "text-purple-600";
      case "ASMR":
        return "text-indigo-600";
      case "Daily vlogs":
        return "text-pink-600";
      case "Design/art":
        return "text-purple-700";
      case "DIY & Life Hacks":
        return "text-orange-700";
      case "Family & Parenting":
        return "text-pink-700";
      case "Health & Self Help":
        return "text-green-700";
      case "Humor":
        return "text-yellow-600";
      case "Movies":
        return "text-orange-800";
      case "Mystery":
        return "text-gray-700";
      case "Show":
        return "text-purple-800";
      case "Toys":
        return "text-pink-800";

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

    // Filtro de audience gender
    if (audienceGender.gender !== 'any') {
          filters.push({
        id: "audienceGender",
        label: `${audienceGender.gender === 'male' ? 'Male' : 'Female'} >${audienceGender.percentage}%`,
        icon: audienceGender.gender === 'male' ? '👨' : '👩',
        type: "audienceGender",
      });
    }

    // Filtro de audience age
    if (audienceAge.minAge !== 18 || audienceAge.maxAge !== 54 || audienceAge.percentage !== 10) {
      filters.push({
        id: "audienceAge",
        label: `${audienceAge.minAge}-${audienceAge.maxAge} years >${audienceAge.percentage}%`,
        icon: '🎂',
        type: "audienceAge",
      });
    }

    // Filtros de audience geo - un chip por cada país/ciudad
    Object.entries(audienceGeo.countries).forEach(([countryCode, percentage]) => {
      const country = countryList.find(c => c.code === countryCode);
      const countryName = country ? country.name : countryCode;
      filters.push({
        id: `audienceGeo-country-${countryCode}`,
        label: `${countryName} >${percentage}%`,
        icon: '🌍',
        type: "audienceGeoCountry",
        data: countryCode,
      });
    });
    
    Object.entries(audienceGeo.cities).forEach(([cityName, percentage]) => {
        filters.push({
        id: `audienceGeo-city-${cityName}`,
        label: `${cityName} >${percentage}%`,
        icon: '🏙️',
        type: "audienceGeoCity", 
        data: cityName,
        });
      });

    return filters;
  };

  // ✨ NUEVA FUNCIÓN: Eliminar filtro específico
  const removeFilter = (filter: ActiveFilter) => {
    switch (filter.type) {
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



      case "category":
        const category = filter.id.replace("category-", "");
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
        break;
      case "audienceGender":
        setAudienceGender({ gender: 'any', percentage: 50 });
        break;
      case "audienceAge":
        setAudienceAge({ minAge: 18, maxAge: 54, percentage: 10 });
        break;
      case "audienceGeoCountry":
        if (filter.data) {
          const newCountries = { ...audienceGeo.countries };
          delete newCountries[filter.data];
          setAudienceGeo({ ...audienceGeo, countries: newCountries });
        }
        break;
      case "audienceGeoCity":
        if (filter.data) {
          const newCities = { ...audienceGeo.cities };
          delete newCities[filter.data];
          setAudienceGeo({ ...audienceGeo, cities: newCities });
        }
        break;
    }
  };

  return (
    <Card
      className={cn(
        "sticky top-4 bg-white border-0 shadow-xl rounded-xl overflow-hidden transition-all duration-200",
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
          <div className="px-6 py-3 bg-white border-b">
            <div className="flex flex-wrap gap-2">
              {getActiveFilters().map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-100 cursor-pointer shadow-md whitespace-nowrap"
                  onClick={() => removeFilter(filter)}
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
                      {filter.icon === "MonitorPlay" && (
                        <MonitorPlay className="h-3 w-3" />
                      )}
                      {filter.icon === "Shield" && (
                        <Shield className="h-3 w-3" />
                      )}
                      {filter.icon === "Users" && <Users className="h-3 w-3" />}
                      {filter.icon === "Laugh" && <Laugh className="h-3 w-3" />}
                      {filter.icon === "Award" && <Award className="h-3 w-3" />}
                      {filter.icon === "GraduationCap" && (
                        <GraduationCap className="h-3 w-3" />
                      )}
                      {filter.icon === "Vote" && <Vote className="h-3 w-3" />}
                      {filter.icon === "ChefHat" && (
                        <ChefHat className="h-3 w-3" />
                      )}
                      {filter.icon === "Coffee" && (
                        <Coffee className="h-3 w-3" />
                      )}
                      {filter.icon === "Tv" && <Tv className="h-3 w-3" />}
                      {filter.icon === "Gamepad2" && (
                        <Gamepad2 className="h-3 w-3" />
                      )}
                      {filter.icon === "Video" && (
                        <Video className="h-3 w-3" />
                      )}
                      {filter.icon === "Car" && (
                        <Car className="h-3 w-3" />
                      )}
                      {filter.icon === "Baby" && (
                        <Baby className="h-3 w-3" />
                      )}
                      {filter.icon === "Scissors" && (
                        <Scissors className="h-3 w-3" />
                      )}
                      {filter.icon === "Heart" && (
                        <Heart className="h-3 w-3" />
                      )}
                      {filter.icon === "PawPrint" && (
                        <PawPrint className="h-3 w-3" />
                      )}
                      {filter.icon === "Zap" && (
                        <Zap className="h-3 w-3" />
                      )}
                      {filter.icon === "Play" && (
                        <Play className="h-3 w-3" />
                      )}
                      {filter.icon === "Film" && (
                        <Film className="h-3 w-3" />
                      )}
                      {filter.icon === "Plane" && (
                        <Plane className="h-3 w-3" />
                      )}
                      {filter.icon === "Activity" && (
                        <Activity className="h-3 w-3" />
                      )}
                      {filter.icon === "Palette" && (
                        <Palette className="h-3 w-3" />
                      )}
                      {filter.icon === "HelpCircle" && (
                        <HelpCircle className="h-3 w-3" />
                      )}
                      {filter.icon === "Stethoscope" && (
                        <Stethoscope className="h-3 w-3" />
                      )}
                    </div>
                  ) : filter.icon && typeof filter.icon === "string" ? (
                    <span className="text-xs">{filter.icon}</span>
                  ) : null}
                  <span className="text-xs font-medium text-gray-700">
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Location Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account location</label>
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
                      {getTikTokDisabledMessage("location")}
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
                          : `${formatNumber(minFollowers)} - ${formatNumber(
                              maxFollowers
                            )}`}
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
                      {getTikTokDisabledMessage("engagement")}
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

            {/* ✨ AUDIENCE GENDER - Dropdown con filtro de género de audiencia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Audience gender
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {getSelectedAudienceGenderText()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                  className="w-[280px] bg-white p-3"
                >
                  <div className="space-y-3">
                    {/* Radio buttons para seleccionar género */}
                    <div className="space-y-2">
                      {[
                        { value: 'any', label: 'Any', icon: '👥' },
                        { value: 'male', label: 'Male', icon: '👨' },
                        { value: 'female', label: 'Female', icon: '👩' }
                      ].map((option) => (
                    <Button
                          key={option.value}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-9 px-2 rounded-md text-left text-sm",
                            audienceGender.gender === option.value
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => setAudienceGender({ ...audienceGender, gender: option.value as 'male' | 'female' | 'any' })}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-sm">{option.icon}</span>
                            <span className="flex-1 text-left font-medium">
                              {option.label}
                            </span>
                            {audienceGender.gender === option.value && (
                              <Check className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                        </Button>
                      ))}
                        </div>
                    
                    {/* Slider para porcentaje - solo se muestra si no es 'any' */}
                    {audienceGender.gender !== 'any' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-center mb-3">
                          <span className="text-xs font-medium text-gray-700">
                            More than {audienceGender.percentage}% of audience
                          </span>
                    </div>
                        
                        <div className="relative px-2 py-1">
                          <Slider
                            value={[audienceGender.percentage]}
                            onValueChange={(value) => setAudienceGender({ ...audienceGender, percentage: value[0] })}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full [&>span:first-child]:bg-gray-300 [&>span:first-child]:h-1.5 [&>span:first-child]:rounded-full [&>span:last-child]:bg-blue-600 [&>span:last-child]:h-1.5 [&>span:last-child]:rounded-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-600 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 [&_[role=slider]:hover]:scale-110 [&_[role=slider]:focus]:scale-110 [&_[role=slider]:focus]:ring-2 [&_[role=slider]:focus]:ring-blue-200 [&_[role=slider]]:translate-y-[-6px]"
                          />
                  </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 mt-2 px-0.5">
                          <span className="font-medium">0%</span>
                          <span className="font-medium">50%</span>
                          <span className="font-medium">100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ✨ AUDIENCE AGE - Dropdown con filtro de edad de audiencia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Audience age
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {getSelectedAudienceAgeText()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[300px] bg-white p-3"
                >
                  <div className="space-y-4">
                    {/* Inputs numéricos para rango de edad */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 text-center">
                        Age Range
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">From</label>
                <Input
                            type="number"
                            min={13}
                            max={80}
                            value={audienceAge.minAge}
                            onChange={(e) => setAudienceAge({ ...audienceAge, minAge: parseInt(e.target.value) || 13 })}
                            className="text-center h-9"
                          />
                  </div>
                        
                        <div className="mt-5 text-gray-400">-</div>
                        
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">To</label>
                          <Input
                            type="number"
                            min={13}
                            max={80}
                            value={audienceAge.maxAge}
                            onChange={(e) => setAudienceAge({ ...audienceAge, maxAge: parseInt(e.target.value) || 54 })}
                            className="text-center h-9"
                          />
                        </div>
              </div>
            </div>

                    {/* Slider para porcentaje */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-center mb-3">
                        <span className="text-xs font-medium text-gray-700">
                          More than {audienceAge.percentage}% of audience
                        </span>
                      </div>
                      
                      <div className="relative px-2 py-1">
                        <Slider
                          value={[audienceAge.percentage]}
                          onValueChange={(value) => setAudienceAge({ ...audienceAge, percentage: value[0] })}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full [&>span:first-child]:bg-gray-300 [&>span:first-child]:h-1.5 [&>span:first-child]:rounded-full [&>span:last-child]:bg-blue-600 [&>span:last-child]:h-1.5 [&>span:last-child]:rounded-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-600 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 [&_[role=slider]:hover]:scale-110 [&_[role=slider]:focus]:scale-110 [&_[role=slider]:focus]:ring-2 [&_[role=slider]:focus]:ring-blue-200 [&_[role=slider]]:translate-y-[-6px]"
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2 px-0.5">
                        <span className="font-medium">0%</span>
                        <span className="font-medium">50%</span>
                        <span className="font-medium">100%</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ✨ AUDIENCE GEO - Dropdown con filtro de ubicación de audiencia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Audience location
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {getSelectedAudienceGeoText()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  className="w-[320px] bg-white p-3"
                >
                  <div className="space-y-4">
                    {/* Búsqueda de países */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">
                        Countries
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full pl-8 bg-white border-gray-200 h-9"
                        />
                        </div>

                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {countryList
                          .filter(country => 
                            countrySearch === "" || 
                            country.name.toLowerCase().includes(countrySearch.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((country) => (
                        <Button
                            key={country.code}
                          variant="ghost"
                          className={cn(
                              "w-full justify-start h-8 px-2 text-sm",
                              country.code in audienceGeo.countries
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => {
                              const newCountries = { ...audienceGeo.countries };
                              if (country.code in newCountries) {
                                delete newCountries[country.code];
                                if (selectedCountryForEdit === country.code) {
                                  setSelectedCountryForEdit(null);
                                }
                              } else {
                                newCountries[country.code] = 30; // Porcentaje por defecto
                                setSelectedCountryForEdit(country.code); // Auto-seleccionar para editar
                              }
                              setAudienceGeo({ ...audienceGeo, countries: newCountries });
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <img
                                src={`/banderas/${country.name}.png`}
                                alt={country.name}
                                className="h-3 w-5 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <span className="flex-1 text-left">{country.name}</span>
                              {country.code in audienceGeo.countries && (
                                <Check className="h-3 w-3 text-blue-600" />
                              )}
                          </div>
                        </Button>
                      ))}
                    </div>
                    </div>

                    {/* Mostrar países seleccionados como chips clickeables */}
                    {Object.keys(audienceGeo.countries).length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-gray-600">
                          Selected Countries: 
                          {!selectedCountryForEdit && (
                            <span className="text-blue-600 ml-1">(click to edit %)</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(audienceGeo.countries).map(([countryCode, percentage]) => {
                            const country = countryList.find(c => c.code === countryCode);
                            if (!country) return null;
                            
                            return (
                              <Badge 
                                key={countryCode} 
                                variant="secondary"
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all duration-200 border-2",
                                  selectedCountryForEdit === countryCode 
                                    ? "bg-blue-50 text-blue-900 border-blue-500 hover:bg-blue-100 shadow-md" 
                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                )}
                                onClick={() => setSelectedCountryForEdit(
                                  selectedCountryForEdit === countryCode ? null : countryCode
                                )}
                              >
                                <img
                                  src={`/banderas/${country.name}.png`}
                                  alt={country.name}
                                  className={cn(
                                    "h-3 w-4 object-cover rounded-sm",
                                    selectedCountryForEdit === countryCode ? "ring-1 ring-blue-400" : ""
                                  )}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span className={cn(
                                  "text-xs font-medium",
                                  selectedCountryForEdit === countryCode ? "text-blue-900" : "text-gray-700"
                                )}>
                                  {country.name}
                                </span>
                                <span className={cn(
                                  "text-xs font-semibold",
                                  selectedCountryForEdit === countryCode ? "text-blue-700" : "text-gray-600"
                                )}>
                                  &gt;{percentage}%
                                </span>
                                <X 
                                  className={cn(
                                    "h-3 w-3 cursor-pointer transition-colors",
                                    selectedCountryForEdit === countryCode 
                                      ? "text-blue-600 hover:text-red-500" 
                                      : "text-gray-500 hover:text-red-500"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newCountries = { ...audienceGeo.countries };
                                    delete newCountries[countryCode];
                                    setAudienceGeo({ ...audienceGeo, countries: newCountries });
                                    if (selectedCountryForEdit === countryCode) {
                                      setSelectedCountryForEdit(null);
                                    }
                                  }}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Slider único para el país seleccionado */}
                    {selectedCountryForEdit && audienceGeo.countries[selectedCountryForEdit] && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-center mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            {(() => {
                              const country = countryList.find(c => c.code === selectedCountryForEdit);
                              return `More than ${audienceGeo.countries[selectedCountryForEdit]}% of audience from ${country?.name || selectedCountryForEdit}`;
                            })()}
                          </span>
                        </div>
                        
                        <div className="relative px-2 py-1">
                          <Slider
                            value={[audienceGeo.countries[selectedCountryForEdit]]}
                            onValueChange={(value) => {
                              const newCountries = { ...audienceGeo.countries };
                              newCountries[selectedCountryForEdit] = value[0];
                              setAudienceGeo({ ...audienceGeo, countries: newCountries });
                            }}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full [&>span:first-child]:bg-blue-200 [&>span:first-child]:h-1.5 [&>span:first-child]:rounded-full [&>span:last-child]:bg-blue-600 [&>span:last-child]:h-1.5 [&>span:last-child]:rounded-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-600 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 [&_[role=slider]:hover]:scale-110 [&_[role=slider]:focus]:scale-110 [&_[role=slider]:focus]:ring-2 [&_[role=slider]:focus]:ring-blue-200 [&_[role=slider]]:translate-y-[-6px]"
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-blue-600 mt-2 px-0.5">
                          <span className="font-medium">0%</span>
                          <span className="font-medium">50%</span>
                          <span className="font-medium">100%</span>
                        </div>
                      </div>
                    )}


                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ✨ CATEGORÍAS - Dropdown con categorías del taxonomy */}
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
                      {getTikTokDisabledMessage("categories")}
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
                             {getCategoryIcon(category) === "MonitorPlay" && <MonitorPlay className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Shield" && <Shield className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Users" && <Users className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Laugh" && <Laugh className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Award" && <Award className="h-4 w-4" />}
                             {getCategoryIcon(category) === "GraduationCap" && <GraduationCap className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Vote" && <Vote className="h-4 w-4" />}
                             {getCategoryIcon(category) === "ChefHat" && <ChefHat className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Coffee" && <Coffee className="h-4 w-4" />}
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
                             {getCategoryIcon(category) === "Activity" && <Activity className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Palette" && <Palette className="h-4 w-4" />}
                             {getCategoryIcon(category) === "HelpCircle" && <HelpCircle className="h-4 w-4" />}
                             {getCategoryIcon(category) === "Stethoscope" && <Stethoscope className="h-4 w-4" />}
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
