"use client";

import React, { useState, useEffect } from 'react';
import { NumberDisplay } from '../ui/NumberDisplay';

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

  // Categorías principales de HypeAuditor
  const categories = [
    { id: '1', name: 'Fashion & Style', icon: '👗' },
    { id: '2', name: 'Beauty & Cosmetics', icon: '💄' },
    { id: '3', name: 'Fitness & Health', icon: '💪' },
    { id: '4', name: 'Food & Cooking', icon: '🍕' },
    { id: '5', name: 'Travel & Tourism', icon: '✈️' },
    { id: '6', name: 'Technology', icon: '📱' },
    { id: '7', name: 'Gaming', icon: '🎮' },
    { id: '8', name: 'Music & Entertainment', icon: '🎵' },
    { id: '9', name: 'Sports', icon: '⚽' },
    { id: '10', name: 'Lifestyle', icon: '✨' },
    { id: '11', name: 'Business & Finance', icon: '💼' },
    { id: '12', name: 'Education', icon: '📚' },
    { id: '13', name: 'Art & Design', icon: '🎨' },
    { id: '14', name: 'Pets & Animals', icon: '🐕' },
    { id: '15', name: 'Home & Garden', icon: '🏠' },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

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
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las plataformas</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="twitter">Twitter</option>
            <option value="twitch">Twitch</option>
          </select>
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
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seguidores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seguidores
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
              placeholder="Mínimo"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxFollowers}
              onChange={(e) => setMaxFollowers(Number(e.target.value))}
              placeholder="Máximo"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Rango: <NumberDisplay value={minFollowers} format="short" /> - <NumberDisplay value={maxFollowers} format="short" />
          </div>
        </div>

        {/* Engagement Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engagement Rate (%)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minEngagement}
              onChange={(e) => setMinEngagement(Number(e.target.value))}
              placeholder="Mínimo"
              min="0"
              max="100"
              step="0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxEngagement}
              onChange={(e) => setMaxEngagement(Number(e.target.value))}
              placeholder="Máximo"
              min="0"
              max="100"
              step="0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Rango: {minEngagement}% - {maxEngagement}%
          </div>
        </div>

        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorías
          </label>
          <select
            multiple
            value={selectedCategories}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedCategories(values);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            size={5}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples categorías
          </p>
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
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="human">Persona</option>
                  <option value="brand">Marca</option>
                </select>
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
      <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Buscando...' : 'Buscar con HypeAuditor'}
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default HypeAuditorFilters;
