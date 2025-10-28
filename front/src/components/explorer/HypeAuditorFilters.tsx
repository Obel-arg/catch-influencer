"use client";

import React, { useState, useEffect } from 'react';
import { NumberDisplay } from '../ui/NumberDisplay';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { getCategoriesForPlatform, type HypeAuditorCategory } from '@/constants/hypeauditor-categories';

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
  setSelectedGrowthRate: (growth: { min: number; max: number; period: string }) => void;
  
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
  onSearch,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentInput, setContentInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [minFollowersInput, setMinFollowersInput] = useState('');
  const [maxFollowersInput, setMaxFollowersInput] = useState('');
  const [selectedFollowerPreset, setSelectedFollowerPreset] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Países disponibles para HypeAuditor
  const countries = [
    { code: 'all', name: 'Todos los países' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'BR', name: 'Brasil' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Perú' },
    { code: 'ES', name: 'España' },
    { code: 'FR', name: 'Francia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'IT', name: 'Italia' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'CA', name: 'Canadá' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japón' },
    { code: 'KR', name: 'Corea del Sur' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
  ];

  // Categorías: usar el taxonomy oficial por plataforma (default Instagram)
  const categories: HypeAuditorCategory[] = getCategoriesForPlatform(platform);

  const formatFollowersInput = (num: number) => {
    if (!Number.isFinite(num)) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    return String(Math.max(0, Math.floor(num)));
  };

  const parseFollowersInput = (value: string) => {
    const s = value.trim().toLowerCase().replace(/[,\s]/g, '');
    if (!s) return NaN;
    const match = s.match(/^([0-9]*\.?[0-9]+|[0-9]+)(k|m)?$/i);
    if (!match) return NaN;
    const base = parseFloat(match[1]);
    const suffix = match[2];
    if (suffix === 'm') return Math.round(base * 1_000_000);
    if (suffix === 'k') return Math.round(base * 1_000);
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
    { id: '0-10k', label: '0–10K', min: 0, max: 10_000 },
    { id: '10k-100k', label: '10K–100K', min: 10_000, max: 100_000 },
    { id: '100k-500k', label: '100K–500K', min: 100_000, max: 500_000 },
    { id: '500k-plus', label: '500K+', min: 500_000, max: 100_000_000 },
  ];

  const handleAddContent = () => {
    if (contentInput.trim() && !searchContent.includes(contentInput.trim())) {
      setSearchContent([...searchContent, contentInput.trim()]);
      setContentInput('');
    }
  };

  const handleRemoveContent = (index: number) => {
    setSearchContent(searchContent.filter((_, i) => i !== index));
  };

  const handleAddDescription = () => {
    if (descriptionInput.trim() && !searchDescription.includes(descriptionInput.trim())) {
      setSearchDescription([...searchDescription, descriptionInput.trim()]);
      setDescriptionInput('');
    }
  };

  const handleRemoveDescription = (index: number) => {
    setSearchDescription(searchDescription.filter((_, i) => i !== index));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setLocation('all');
    setMinFollowers(0);
    setMaxFollowers(100000000);
    setMinEngagement(0);
    setMaxEngagement(100);
    setAccountType('all');
    setVerified(false);
    setHasContacts(false);
    setAqs({ min: 0, max: 100 });
    setCqs({ min: 0, max: 100 });
    setSearchContent([]);
    setSearchDescription([]);
    setSelectedCategories([]);
    setSelectedGrowthRate({ min: 0, max: 100, period: 'month' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Filtros HypeAuditor
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'} filtros avanzados
        </button>
      </div>

      {/* Paso 1: Filtros básicos */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">1</span>
          Filtros básicos
        </h4>
        <div className="space-y-4">
        {/* Plataforma */}
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

        {/* Búsqueda por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda por texto
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar influencers..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seguidores */}
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
                else setMinFollowersInput(formatFollowersInput(minFollowers));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseFollowersInput(minFollowersInput);
                  if (!Number.isNaN(parsed)) setMinFollowers(parsed);
                  (e.currentTarget as HTMLInputElement).blur();
                }
              }}
              placeholder="Mínimo (p. ej. 10K)"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                else setMaxFollowersInput(formatFollowersInput(maxFollowers));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseFollowersInput(maxFollowersInput);
                  if (!Number.isNaN(parsed)) setMaxFollowers(parsed);
                  (e.currentTarget as HTMLInputElement).blur();
                }
              }}
              placeholder="Máximo (p. ej. 1M)"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-2 overflow-x-auto">
            <ToggleGroup
              type="single"
              value={selectedFollowerPreset ?? undefined}
              onValueChange={(val) => {
                if (!val) return; // ignore empty
                setSelectedFollowerPreset(val);
                const preset = followerPresets.find(p => p.id === val);
                if (preset) {
                  setMinFollowers(preset.min);
                  setMaxFollowers(preset.max);
                }
              }}
              className="flex flex-nowrap gap-2"
            >
              {followerPresets.map(preset => (
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

        {/* Engagement Rate */}
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
          {mounted && (
            <div className="relative h-5 mt-1">
              <span
                className="absolute -translate-x-1/2 top-0 text-[11px] px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-700"
                style={{ left: `${(minEngagement / 100) * 100}%` }}
              >
                {minEngagement}%
              </span>
              <span
                className="absolute -translate-x-1/2 top-0 text-[11px] px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-700"
                style={{ left: `${(maxEngagement / 100) * 100}%` }}
              >
                {maxEngagement}%
              </span>
            </div>
          )}
        </div>
        {/* Categorías (multi-select dropdown) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorías
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                <span className="truncate text-left">
                  {selectedCategories.length === 0
                    ? 'Seleccionar categorías'
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
                      const isSelected = selectedCategories.includes(category.name);
                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            if (isSelected) {
                              setSelectedCategories(selectedCategories.filter((cname) => cname !== category.name));
                            } else {
                              setSelectedCategories([...selectedCategories, category.name]);
                            }
                          }}
                        >
                          <Check className={isSelected ? 'h-4 w-4 mr-2 opacity-100' : 'h-4 w-4 mr-2 opacity-0'} />
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
                      onClick={() => setSelectedCategories(selectedCategories.filter((cname) => cname !== name))}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Paso 2: Filtros avanzados */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">2</span>
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
                <label htmlFor="verified" className="text-sm font-medium text-gray-700">
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
                <label htmlFor="hasContacts" className="text-sm font-medium text-gray-700">
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
                    onChange={(e) => setAqs({ ...aqs, min: Number(e.target.value) })}
                    placeholder="Mínimo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={aqs.max}
                    onChange={(e) => setAqs({ ...aqs, max: Number(e.target.value) })}
                    placeholder="Máximo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setCqs({ ...cqs, min: Number(e.target.value) })}
                    placeholder="Mínimo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={cqs.max}
                    onChange={(e) => setCqs({ ...cqs, max: Number(e.target.value) })}
                    placeholder="Máximo"
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Búsqueda por contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda por contenido
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder="Agregar palabra clave..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddContent()}
                  />
                  <button
                    type="button"
                    onClick={handleAddContent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                {searchContent.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchContent.map((content, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda por descripción
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Agregar palabra clave..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDescription()}
                  />
                  <button
                    type="button"
                    onClick={handleAddDescription}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                {searchDescription.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchDescription.map((description, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
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
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col w-full gap-3">
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Buscando...' : 'Buscar con HypeAuditor'}
        </button>
        <button
          onClick={resetFilters}
          className="w-full flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default HypeAuditorFilters;
