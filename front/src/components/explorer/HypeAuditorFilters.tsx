"use client";

import React, { useState, useEffect } from "react";
import { NumberDisplay } from "../ui/NumberDisplay";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  getCategoriesForPlatform,
  type HypeAuditorCategory,
} from "@/constants/hypeauditor-categories";
import {
  geonamesService,
  type GeonamesCity,
} from "@/lib/services/geonames.service";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface HypeAuditorFiltersProps {
  // Filtros básicos
  platform: string;
  setPlatform: (platform: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  location: string;
  setLocation: (location: string) => void;

  // Filtros de audiencia
  minFollowers: number;
  setMinFollowers: (min: number) => void;
  maxFollowers: number;
  setMaxFollowers: (max: number) => void;
  minEngagement: number;
  setMinEngagement: (min: number) => void;
  maxEngagement: number;
  setMaxEngagement: (max: number) => void;

  // Filtros de cuenta
  accountType: string;
  setAccountType: (type: string) => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  hasContacts: boolean;
  setHasContacts: (has: boolean) => void;

  // Filtros avanzados
  aqs: { min: number; max: number };
  setAqs: (aqs: { min: number; max: number }) => void;
  cqs: { min: number; max: number };
  setCqs: (cqs: { min: number; max: number }) => void;

  // Búsqueda por contenido
  searchContent: string[];
  setSearchContent: (content: string[]) => void;
  searchDescription: string[];
  setSearchDescription: (description: string[]) => void;

  // Categorías
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;

  // Crecimiento
  selectedGrowthRate: { min: number; max: number; period: string };
  setSelectedGrowthRate: (growth: {
    min: number;
    max: number;
    period: string;
  }) => void;

  // Filtros de audiencia geográfica
  audienceGeo: {
    countries: Array<{ id: string; prc: number }>;
    cities: Array<{ id: number; prc: number }>;
  };
  setAudienceGeo: (geo: {
    countries: Array<{ id: string; prc: number }>;
    cities: Array<{ id: number; prc: number }>;
  }) => void;

  // Filtros de edad de audiencia
  audienceAge: {
    groups: string[];
    prc: number;
  };
  setAudienceAge: (age: { groups: string[]; prc: number }) => void;

  // Callback para búsqueda
  onSearch: () => void;
  isLoading: boolean;
}

const HypeAuditorFilters: React.FC<HypeAuditorFiltersProps> = ({
  platform,
  setPlatform,
  searchQuery,
  setSearchQuery,
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
  accountType,
  setAccountType,
  verified,
  setVerified,
  hasContacts,
  setHasContacts,
  aqs,
  setAqs,
  cqs,
  setCqs,
  searchContent,
  setSearchContent,
  searchDescription,
  setSearchDescription,
  selectedCategories,
  setSelectedCategories,
  selectedGrowthRate,
  setSelectedGrowthRate,
  audienceGeo,
  setAudienceGeo,
  audienceAge,
  setAudienceAge,
  onSearch,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentInput, setContentInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [minFollowersInput, setMinFollowersInput] = useState("");
  const [maxFollowersInput, setMaxFollowersInput] = useState("");
  const [selectedFollowerPreset, setSelectedFollowerPreset] = useState<
    string | null
  >(null);

  // State for cities management
  const [availableCities, setAvailableCities] = useState<GeonamesCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCountryForCities, setSelectedCountryForCities] =
    useState<string>("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Países disponibles para HypeAuditor
  const countries = [
    { code: "all", name: "Todos los países" },
    { code: "US", name: "Estados Unidos" },
    { code: "BR", name: "Brasil" },
    { code: "MX", name: "México" },
    { code: "AR", name: "Argentina" },
    { code: "CO", name: "Colombia" },
    { code: "CL", name: "Chile" },
    { code: "PE", name: "Perú" },
    { code: "ES", name: "España" },
    { code: "FR", name: "Francia" },
    { code: "DE", name: "Alemania" },
    { code: "IT", name: "Italia" },
    { code: "GB", name: "Reino Unido" },
    { code: "CA", name: "Canadá" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japón" },
    { code: "KR", name: "Corea del Sur" },
    { code: "IN", name: "India" },
    { code: "CN", name: "China" },
  ];

  // Categorías: usar el taxonomy oficial por plataforma (default Instagram)
  const categories: HypeAuditorCategory[] = getCategoriesForPlatform(platform);

  const formatFollowersInput = (num: number) => {
    if (!Number.isFinite(num)) return "";
    if (num >= 1_000_000)
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    if (num >= 1_000)
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    return String(Math.max(0, Math.floor(num)));
  };

  const parseFollowersInput = (value: string) => {
    const s = value.trim().toLowerCase().replace(/[,\s]/g, "");
    if (!s) return NaN;
    const match = s.match(/^([0-9]*\.?[0-9]+|[0-9]+)(k|m)?$/i);
    if (!match) return NaN;
    const base = parseFloat(match[1]);
    const suffix = match[2];
    if (suffix === "m") return Math.round(base * 1_000_000);
    if (suffix === "k") return Math.round(base * 1_000);
    return Math.round(base);
  };

  // Keep text inputs in sync with numeric followers values
  useEffect(() => {
    setMinFollowersInput(formatFollowersInput(minFollowers));
  }, [minFollowers]);
  useEffect(() => {
    setMaxFollowersInput(formatFollowersInput(maxFollowers));
  }, [maxFollowers]);

  const followerPresets = [
    { id: "0-10k", label: "0–10K", min: 0, max: 10_000 },
    { id: "10k-100k", label: "10K–100K", min: 10_000, max: 100_000 },
    { id: "100k-500k", label: "100K–500K", min: 100_000, max: 500_000 },
    { id: "500k-plus", label: "500K+", min: 500_000, max: 100_000_000 },
  ];

  const handleAddContent = () => {
    if (contentInput.trim() && !searchContent.includes(contentInput.trim())) {
      setSearchContent([...searchContent, contentInput.trim()]);
      setContentInput("");
    }
  };

  const handleRemoveContent = (index: number) => {
    setSearchContent(searchContent.filter((_, i) => i !== index));
  };

  const handleAddDescription = () => {
    if (
      descriptionInput.trim() &&
      !searchDescription.includes(descriptionInput.trim())
    ) {
      setSearchDescription([...searchDescription, descriptionInput.trim()]);
      setDescriptionInput("");
    }
  };

  const handleRemoveDescription = (index: number) => {
    setSearchDescription(searchDescription.filter((_, i) => i !== index));
  };

  // Handlers for audience geo
  const handleAddCountry = (countryCode: string) => {
    if (countryCode === "all") return;
    const country = countries.find((c) => c.code === countryCode);
    if (!country) return;

    const exists = audienceGeo.countries.some((c) => c.id === countryCode);
    if (!exists) {
      setAudienceGeo({
        ...audienceGeo,
        countries: [...audienceGeo.countries, { id: countryCode, prc: 50 }],
      });

      // If Instagram platform, fetch cities for this country
      if (platform === "instagram" && !selectedCountryForCities) {
        setSelectedCountryForCities(countryCode);
      }
    }
  };

  const handleRemoveCountry = (countryCode: string) => {
    setAudienceGeo({
      ...audienceGeo,
      countries: audienceGeo.countries.filter((c) => c.id !== countryCode),
      // Remove cities from this country too
      cities: audienceGeo.cities.filter((city) => {
        const cityData = availableCities.find((c) => c.id === city.id);
        return cityData?.countryCode !== countryCode;
      }),
    });

    // If no countries left, clear cities selection
    if (audienceGeo.countries.length === 1) {
      setSelectedCountryForCities("");
      setAvailableCities([]);
    }
  };

  const handleUpdateCountryPrc = (countryCode: string, prc: number) => {
    setAudienceGeo({
      ...audienceGeo,
      countries: audienceGeo.countries.map((c) =>
        c.id === countryCode
          ? { ...c, prc: Math.max(0, Math.min(100, prc)) }
          : c
      ),
    });
  };

  const handleAddCity = (city: GeonamesCity) => {
    const exists = audienceGeo.cities.some((c) => c.id === city.id);
    if (!exists) {
      setAudienceGeo({
        ...audienceGeo,
        cities: [...audienceGeo.cities, { id: city.id, prc: 50 }],
      });
      setCitySearchQuery("");
    }
  };

  const handleRemoveCity = (cityId: number) => {
    setAudienceGeo({
      ...audienceGeo,
      cities: audienceGeo.cities.filter((c) => c.id !== cityId),
    });
  };

  const handleUpdateCityPrc = (cityId: number, prc: number) => {
    setAudienceGeo({
      ...audienceGeo,
      cities: audienceGeo.cities.map((c) =>
        c.id === cityId ? { ...c, prc: Math.max(0, Math.min(100, prc)) } : c
      ),
    });
  };

  // Handlers for audience age
  const ageGroups = [
    { key: "13_17", label: "13-17" },
    { key: "18_24", label: "18-24" },
    { key: "25_34", label: "25-34" },
    { key: "35_44", label: "35-44" },
    { key: "45_54", label: "45-54" },
    { key: "55_64", label: "55-64" },
    { key: "65", label: "65+" },
  ];

  const handleToggleAgeGroup = (ageKey: string) => {
    const exists = audienceAge.groups.includes(ageKey);
    if (exists) {
      setAudienceAge({
        groups: audienceAge.groups.filter((g) => g !== ageKey),
        prc: audienceAge.prc,
      });
    } else {
      setAudienceAge({
        groups: [...audienceAge.groups, ageKey],
        prc: audienceAge.prc,
      });
    }
  };

  const handleUpdateAgePrc = (prc: number) => {
    setAudienceAge({
      groups: audienceAge.groups,
      prc: Math.max(0, Math.min(100, prc)),
    });
  };

  // Fetch cities when country is selected and platform is Instagram
  useEffect(() => {
    const fetchCities = async () => {
      if (platform === "instagram" && audienceGeo.countries.length > 0) {
        // Use the first selected country to fetch cities
        const countryCode = audienceGeo.countries[0].id;
        if (countryCode !== selectedCountryForCities) {
          setLoadingCities(true);
          setCitiesError(null);
          setSelectedCountryForCities(countryCode);
          try {
            const cities = await geonamesService.getCitiesByCountry(
              countryCode
            );
            setAvailableCities(cities);
            setCitiesError(null);
          } catch (error: any) {
            console.error("Error fetching cities:", error);
            setAvailableCities([]);
            // Set user-friendly error message
            const errorMessage = error?.message || "Error al cargar ciudades";
            setCitiesError(errorMessage);
          } finally {
            setLoadingCities(false);
          }
        }
      } else {
        if (platform !== "instagram" || audienceGeo.countries.length === 0) {
          setAvailableCities([]);
          setSelectedCountryForCities("");
          setCitiesError(null);
        }
      }
    };

    fetchCities();
  }, [platform, audienceGeo.countries.map((c) => c.id).join(",")]);

  const resetFilters = () => {
    setSearchQuery("");
    setLocation("all");
    setMinFollowers(0);
    setMaxFollowers(100000000);
    setMinEngagement(0);
    setMaxEngagement(100);
    setAccountType("all");
    setVerified(false);
    setHasContacts(false);
    setAqs({ min: 0, max: 100 });
    setCqs({ min: 0, max: 100 });
    setSearchContent([]);
    setSearchDescription([]);
    setSelectedCategories([]);
    setSelectedGrowthRate({ min: 0, max: 100, period: "month" });
    setAudienceGeo({ countries: [], cities: [] });
    setAudienceAge({ groups: [], prc: 50 });
    setAvailableCities([]);
    setSelectedCountryForCities("");
    setCitySearchQuery("");
    setCitiesError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col sticky top-4 h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? "Ocultar" : "Mostrar"} avanzados
        </button>
      </div>

      {/* Scrollable filter content */}
      <div className="flex-1 overflow-y-auto p-6 pt-4">
        {/* Paso 1: Filtros básicos */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
              1
            </span>
            Filtros básicos
          </h4>
          <div className="space-y-4">
            {/* Búsqueda por texto - PRIMERO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda por texto
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSearch();
                  }
                }}
                placeholder="Buscar influencers..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              />
            </div>

            {/* Plataforma - SEGUNDO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma
              </label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las plataformas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ubicación - TERCERO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categorías - CUARTO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorías
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="truncate text-left">
                      {selectedCategories.length === 0
                        ? "Seleccionar categorías"
                        : `${selectedCategories.length} seleccionada(s)`}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-72 bg-white">
                  <Command className="bg-white">
                    <CommandInput placeholder="Buscar categoría..." />
                    <CommandEmpty>Sin resultados.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {categories.map((category) => {
                          const isSelected = selectedCategories.includes(
                            category.name
                          );
                          return (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={() => {
                                if (isSelected) {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (cname) => cname !== category.name
                                    )
                                  );
                                } else {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    category.name,
                                  ]);
                                }
                              }}
                            >
                              <Check
                                className={
                                  isSelected
                                    ? "h-4 w-4 mr-2 opacity-100"
                                    : "h-4 w-4 mr-2 opacity-0"
                                }
                              />
                              {category.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedCategories.map((name) => {
                    const cat = categories.find((c) => c.name === name);
                    if (!cat) return null;
                    return (
                      <span
                        key={name}
                        className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 text-[11px]"
                      >
                        {cat.name}
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setSelectedCategories(
                              selectedCategories.filter(
                                (cname) => cname !== name
                              )
                            )
                          }
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seguidores - QUINTO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seguidores
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={minFollowersInput}
                  onChange={(e) => {
                    setMinFollowersInput(e.target.value);
                    setSelectedFollowerPreset(null);
                  }}
                  onBlur={() => {
                    const parsed = parseFollowersInput(minFollowersInput);
                    if (!Number.isNaN(parsed)) setMinFollowers(parsed);
                    else
                      setMinFollowersInput(formatFollowersInput(minFollowers));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const parsed = parseFollowersInput(minFollowersInput);
                      if (!Number.isNaN(parsed)) setMinFollowers(parsed);
                      (e.currentTarget as HTMLInputElement).blur();
                      onSearch();
                    }
                  }}
                  placeholder="Mínimo (p. ej. 10K)"
                  className="w-1/2 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="text"
                  value={maxFollowersInput}
                  onChange={(e) => {
                    setMaxFollowersInput(e.target.value);
                    setSelectedFollowerPreset(null);
                  }}
                  onBlur={() => {
                    const parsed = parseFollowersInput(maxFollowersInput);
                    if (!Number.isNaN(parsed)) setMaxFollowers(parsed);
                    else
                      setMaxFollowersInput(formatFollowersInput(maxFollowers));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const parsed = parseFollowersInput(maxFollowersInput);
                      if (!Number.isNaN(parsed)) setMaxFollowers(parsed);
                      (e.currentTarget as HTMLInputElement).blur();
                      onSearch();
                    }
                  }}
                  placeholder="Máximo (p. ej. 1M)"
                  className="w-1/2 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
              </div>
              <div className="mt-2 overflow-x-auto">
                <ToggleGroup
                  type="single"
                  value={selectedFollowerPreset ?? undefined}
                  onValueChange={(val) => {
                    if (!val) return; // ignore empty
                    setSelectedFollowerPreset(val);
                    const preset = followerPresets.find((p) => p.id === val);
                    if (preset) {
                      setMinFollowers(preset.min);
                      setMaxFollowers(preset.max);
                    }
                  }}
                  className="flex flex-nowrap gap-2"
                >
                  {followerPresets.map((preset) => (
                    <ToggleGroupItem
                      key={preset.id}
                      value={preset.id}
                      className="rounded-full border h-auto min-h-0 min-w-0 px-2 py-0.5 leading-none text-[11px] whitespace-nowrap transition-colors border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-gray-100 data-[state=on]:border-gray-500 data-[state=on]:text-gray-900"
                    >
                      {preset.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            {/* Engagement Rate - SEXTO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engagement Rate (%)
              </label>
              <div className="px-1 py-2">
                <Slider
                  value={[minEngagement, maxEngagement]}
                  onValueChange={([min, max]) => {
                    setMinEngagement(min);
                    setMaxEngagement(max);
                  }}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>
              <div className="relative h-5 mt-1" suppressHydrationWarning>
                <span
                  className="absolute -translate-x-1 top-0 text-[11px] px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-700"
                  style={{ left: `${(minEngagement / 100) * 100}%` }}
                  suppressHydrationWarning
                >
                  {minEngagement.toFixed(1)}%
                </span>
                <span
                  className="absolute -translate-x-[70%] top-0 text-[11px] px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-700"
                  style={{ left: `${(maxEngagement / 100) * 100}%` }}
                  suppressHydrationWarning
                >
                  {maxEngagement.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 2: Filtros avanzados */}
        {isExpanded && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                2
              </span>
              Filtros avanzados
            </h4>
            <div className="space-y-4">
              {/* Tipo de cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cuenta
                </label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="human">Persona</SelectItem>
                    <SelectItem value="brand">Marca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verificada */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium text-gray-700"
                >
                  Solo cuentas verificadas
                </label>
              </div>

              {/* Tiene contactos */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasContacts"
                  checked={hasContacts}
                  onChange={(e) => setHasContacts(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="hasContacts"
                  className="text-sm font-medium text-gray-700"
                >
                  Tiene información de contacto
                </label>
              </div>

              {/* AQS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience Quality Score (AQS)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={aqs.min}
                    onChange={(e) =>
                      setAqs({ ...aqs, min: Number(e.target.value) })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSearch();
                      }
                    }}
                    placeholder="Mínimo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={aqs.max}
                    onChange={(e) =>
                      setAqs({ ...aqs, max: Number(e.target.value) })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSearch();
                      }
                    }}
                    placeholder="Máximo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
              </div>

              {/* CQS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Quality Score (CQS)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={cqs.min}
                    onChange={(e) =>
                      setCqs({ ...cqs, min: Number(e.target.value) })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSearch();
                      }
                    }}
                    placeholder="Mínimo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={cqs.max}
                    onChange={(e) =>
                      setCqs({ ...cqs, max: Number(e.target.value) })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSearch();
                      }
                    }}
                    placeholder="Máximo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Búsqueda por contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Búsqueda por contenido
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 text-gray-400 cursor-help">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 8v2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2m0 4h.01"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        Keywords to search in content
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          contentInput.trim() &&
                          !searchContent.includes(contentInput.trim())
                        ) {
                          handleAddContent();
                        }
                        onSearch();
                      }
                    }}
                    placeholder="Agregar palabra clave..."
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddContent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Agregar
                  </button>
                </div>
                {searchContent.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchContent.map((content, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md border border-blue-200"
                      >
                        {content}
                        <button
                          onClick={() => handleRemoveContent(index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Búsqueda por descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Búsqueda por descripción
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 text-gray-400 cursor-help">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 8v2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2m0 4h.01"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        Keywords to search in description
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          descriptionInput.trim() &&
                          !searchDescription.includes(descriptionInput.trim())
                        ) {
                          handleAddDescription();
                        }
                        onSearch();
                      }
                    }}
                    placeholder="Agregar palabra clave..."
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddDescription}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Agregar
                  </button>
                </div>
                {searchDescription.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchDescription.map((description, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md border border-green-200"
                      >
                        {description}
                        <button
                          onClick={() => handleRemoveDescription(index)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Audience Geography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación de la audiencia
                </label>

                {/* Country Selection */}
                <div className="mb-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <span className="truncate text-left">
                          Seleccionar países
                        </span>
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-72 bg-white">
                      <Command className="bg-white">
                        <CommandInput placeholder="Buscar país..." />
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {countries
                              .filter((c) => c.code !== "all")
                              .map((country) => {
                                const isSelected = audienceGeo.countries.some(
                                  (c) => c.id === country.code
                                );
                                return (
                                  <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => {
                                      if (isSelected) {
                                        handleRemoveCountry(country.code);
                                      } else {
                                        handleAddCountry(country.code);
                                      }
                                    }}
                                  >
                                    <Check
                                      className={
                                        isSelected
                                          ? "h-4 w-4 mr-2 opacity-100"
                                          : "h-4 w-4 mr-2 opacity-0"
                                      }
                                    />
                                    {country.name}
                                  </CommandItem>
                                );
                              })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Selected Countries */}
                {audienceGeo.countries.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {audienceGeo.countries.map((country) => {
                      const countryData = countries.find(
                        (c) => c.code === country.id
                      );
                      return (
                        <div
                          key={country.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                        >
                          <span className="flex-1 text-sm text-gray-700">
                            {countryData?.name || country.id}
                          </span>
                          <input
                            type="number"
                            value={country.prc}
                            onChange={(e) =>
                              handleUpdateCountryPrc(
                                country.id,
                                Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                onSearch();
                              }
                            }}
                            min="0"
                            max="100"
                            className="w-16 px-2 py-1 border border-input rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCountry(country.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* City Selection - Only for Instagram */}
                {platform === "instagram" &&
                  audienceGeo.countries.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudades (solo Instagram)
                      </label>
                      {citiesError && (
                        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs text-yellow-800">
                            {citiesError.includes("daily limit") ||
                            citiesError.includes("demo") ? (
                              <>
                                Límite diario de Geonames excedido. Para usar
                                esta función, necesitas configurar un usuario de
                                Geonames.
                                <br />
                                <a
                                  href="https://www.geonames.org/login"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-yellow-900 font-medium"
                                >
                                  Regístrate en Geonames
                                </a>
                                {" y configura "}
                                <code className="text-xs bg-yellow-100 px-1 rounded">
                                  NEXT_PUBLIC_GEONAMES_USERNAME
                                </code>
                                {" en tus variables de entorno."}
                              </>
                            ) : (
                              citiesError
                            )}
                          </p>
                        </div>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            disabled={loadingCities || !!citiesError}
                            className="w-full inline-flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="truncate text-left">
                              {loadingCities
                                ? "Cargando ciudades..."
                                : citiesError
                                ? "Error al cargar ciudades"
                                : "Seleccionar ciudades"}
                            </span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        {!citiesError && (
                          <PopoverContent className="p-0 w-72 bg-white max-h-96">
                            <Command className="bg-white">
                              <CommandInput
                                placeholder="Buscar ciudad..."
                                value={citySearchQuery}
                                onValueChange={setCitySearchQuery}
                              />
                              <CommandEmpty>
                                {loadingCities
                                  ? "Cargando..."
                                  : availableCities.length === 0
                                  ? "No hay ciudades disponibles"
                                  : "Sin resultados."}
                              </CommandEmpty>
                              <CommandList>
                                <CommandGroup>
                                  {availableCities
                                    .filter((city) =>
                                      citySearchQuery
                                        ? city.name
                                            .toLowerCase()
                                            .includes(
                                              citySearchQuery.toLowerCase()
                                            )
                                        : true
                                    )
                                    .slice(0, 100)
                                    .map((city) => {
                                      const isSelected =
                                        audienceGeo.cities.some(
                                          (c) => c.id === city.id
                                        );
                                      return (
                                        <CommandItem
                                          key={city.id}
                                          value={`${city.name}${
                                            city.adminName1
                                              ? `, ${city.adminName1}`
                                              : ""
                                          }`}
                                          onSelect={() => {
                                            if (isSelected) {
                                              handleRemoveCity(city.id);
                                            } else {
                                              handleAddCity(city);
                                            }
                                          }}
                                        >
                                          <Check
                                            className={
                                              isSelected
                                                ? "h-4 w-4 mr-2 opacity-100"
                                                : "h-4 w-4 mr-2 opacity-0"
                                            }
                                          />
                                          {city.name}
                                          {city.adminName1 && (
                                            <span className="text-xs text-gray-500 ml-1">
                                              , {city.adminName1}
                                            </span>
                                          )}
                                        </CommandItem>
                                      );
                                    })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                  )}

                {/* Selected Cities */}
                {audienceGeo.cities.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {audienceGeo.cities.map((city) => {
                      const cityData = availableCities.find(
                        (c) => c.id === city.id
                      );
                      return (
                        <div
                          key={city.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                        >
                          <span className="flex-1 text-sm text-gray-700">
                            {cityData?.name || `City ${city.id}`}
                            {cityData?.adminName1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                , {cityData.adminName1}
                              </span>
                            )}
                          </span>
                          <input
                            type="number"
                            value={city.prc}
                            onChange={(e) =>
                              handleUpdateCityPrc(
                                city.id,
                                Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                onSearch();
                              }
                            }}
                            min="0"
                            max="100"
                            className="w-16 px-2 py-1 border border-input rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(city.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audience Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad de la audiencia
                </label>
                <div className="space-y-2">
                  {ageGroups.map((ageGroup) => {
                    const isSelected = audienceAge.groups.includes(
                      ageGroup.key
                    );
                    return (
                      <div
                        key={ageGroup.key}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`age-${ageGroup.key}`}
                          checked={isSelected}
                          onChange={() => handleToggleAgeGroup(ageGroup.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`age-${ageGroup.key}`}
                          className="flex-1 text-sm font-medium text-gray-700"
                        >
                          {ageGroup.label} años
                        </label>
                      </div>
                    );
                  })}
                </div>
                {audienceAge.groups.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Porcentaje:
                    </label>
                    <input
                      type="number"
                      value={audienceAge.prc}
                      onChange={(e) =>
                        handleUpdateAgePrc(Number(e.target.value))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onSearch();
                        }
                      }}
                      min="0"
                      max="100"
                      className="w-20 px-2 py-1 border border-input rounded text-sm"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción (sticky bottom) */}
      <div className="p-6 pt-4 border-t border-gray-200 bg-white flex-shrink-0 space-y-3">
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm transition-colors"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default HypeAuditorFilters;
