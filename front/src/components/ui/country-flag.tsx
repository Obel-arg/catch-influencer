import React from 'react';

interface CountryFlagProps {
  country: string;
  size?: number;
  className?: string;
}

// Mapeo de nombres de países y códigos a archivos de bandera
const countryToFlagMap: Record<string, string> = {
  // Nombres completos
  'Argentina': '/banderas/Argentina.png',
  'Brazil': '/banderas/Brazil.png',
  'Chile': '/banderas/Chile.png',
  'Colombia': '/banderas/Colombia.png',
  'Ecuador': '/banderas/Ecuador.png',
  'Mexico': '/banderas/Mexico.png',
  'Peru': '/banderas/Peru.png',
  'Uruguay': '/banderas/Uruguay.png',
  'Venezuela': '/banderas/Venezuela.png',
  'Paraguay': '/banderas/Paraguay.png',
  'Bolivia': '/banderas/Bolivia.png',
  'Cuba': '/banderas/Cuba.png',
  'Dominican Republic': '/banderas/Dominican Republic.png',
  'Puerto Rico': '/banderas/Puerto Rico.png',
  'Costa Rica': '/banderas/Costa Rica.png',
  'El Salvador': '/banderas/El Salvador.png',
  'Guatemala': '/banderas/Guatemala.png',
  'Honduras': '/banderas/Honduras.png',
  'Nicaragua': '/banderas/Nicaragua.png',
  // 'Panama': '/banderas/Panama.png', // Comentado porque no existe el archivo
  'Belize': '/banderas/Belize.png',
  'Bahamas': '/banderas/Bahamas.png',
  'Barbados': '/banderas/Barbados.png',
  'Bermuda': '/banderas/Bermuda.png',
  'Dominica': '/banderas/Dominica.png',
  'Haiti': '/banderas/Haiti.png',
  'Jamaica': '/banderas/Jamaica.png',
  'United States': '/banderas/United States.png',
  'Canada': '/banderas/Canada.png',
  'United Kingdom': '/banderas/United Kingdom.png',
  'Spain': '/banderas/Spain.png',
  'France': '/banderas/France.png',
  'Germany': '/banderas/Germany.png',
  'Italy': '/banderas/Italy.png',
  'Portugal': '/banderas/Portugal.png',
  'Greece': '/banderas/Greece.png',
  'China': '/banderas/China.png',
  'Japan': '/banderas/Japan.png',
  'Hong Kong': '/banderas/Hong Kong.png',
  'Arab Emirates': '/banderas/Arab Emirates.png',
  
  // Códigos de país
  'ARG': '/banderas/Argentina.png',
  'BRA': '/banderas/Brazil.png',
  'CHL': '/banderas/Chile.png',
  'COL': '/banderas/Colombia.png',
  'ECU': '/banderas/Ecuador.png',
  'MEX': '/banderas/Mexico.png',
  'PER': '/banderas/Peru.png',
  'URY': '/banderas/Uruguay.png',
  'VEN': '/banderas/Venezuela.png',
  'PRY': '/banderas/Paraguay.png',
  'BOL': '/banderas/Bolivia.png',
  'CUB': '/banderas/Cuba.png',
  'DOM': '/banderas/Dominican Republic.png',
  'PRI': '/banderas/Puerto Rico.png',
  'CRI': '/banderas/Costa Rica.png',
  'SLV': '/banderas/El Salvador.png',
  'GTM': '/banderas/Guatemala.png',
  'HND': '/banderas/Honduras.png',
  'NIC': '/banderas/Nicaragua.png',
  'BLZ': '/banderas/Belize.png',
  'BHS': '/banderas/Bahamas.png',
  'BRB': '/banderas/Barbados.png',
  'BMU': '/banderas/Bermuda.png',
  'DMA': '/banderas/Dominica.png',
  'HTI': '/banderas/Haiti.png',
  'JAM': '/banderas/Jamaica.png',
  'USA': '/banderas/United States.png',
  'CAN': '/banderas/Canada.png',
  'GBR': '/banderas/United Kingdom.png',
  'ESP': '/banderas/Spain.png',
  'FRA': '/banderas/France.png',
  'DEU': '/banderas/Germany.png',
  'ITA': '/banderas/Italy.png',
  'PRT': '/banderas/Portugal.png',
  'GRC': '/banderas/Greece.png',
  'CHN': '/banderas/China.png',
  'JPN': '/banderas/Japan.png',
  'HKG': '/banderas/Hong Kong.png',
  'ARE': '/banderas/Arab Emirates.png',
};

// Mapeo de códigos a nombres completos para mostrar
const countryCodeToName: Record<string, string> = {
  'ARG': 'Argentina',
  'BRA': 'Brazil',
  'CHL': 'Chile',
  'COL': 'Colombia',
  'ECU': 'Ecuador',
  'MEX': 'Mexico',
  'PER': 'Peru',
  'URY': 'Uruguay',
  'VEN': 'Venezuela',
  'PRY': 'Paraguay',
  'BOL': 'Bolivia',
  'CUB': 'Cuba',
  'DOM': 'Dominican Republic',
  'PRI': 'Puerto Rico',
  'CRI': 'Costa Rica',
  'SLV': 'El Salvador',
  'GTM': 'Guatemala',
  'HND': 'Honduras',
  'NIC': 'Nicaragua',
  'BLZ': 'Belize',
  'BHS': 'Bahamas',
  'BRB': 'Barbados',
  'BMU': 'Bermuda',
  'DMA': 'Dominica',
  'HTI': 'Haiti',
  'JAM': 'Jamaica',
  'USA': 'United States',
  'CAN': 'Canada',
  'GBR': 'United Kingdom',
  'ESP': 'Spain',
  'FRA': 'France',
  'DEU': 'Germany',
  'ITA': 'Italy',
  'PRT': 'Portugal',
  'GRC': 'Greece',
  'CHN': 'China',
  'JPN': 'Japan',
  'HKG': 'Hong Kong',
  'ARE': 'Arab Emirates',
};

export const CountryFlag: React.FC<CountryFlagProps> = ({ 
  country, 
  size = 16, 
  className = "" 
}) => {
  const flagPath = countryToFlagMap[country];
  
  // Obtener el nombre completo si es un código
  const displayName = countryCodeToName[country] || country;
  
  if (!flagPath) {
    // Si no hay bandera disponible, mostrar solo el texto del país
    return (
      <span className={`inline-flex items-center ${className}`}>
        {displayName}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={flagPath}
        alt={`Bandera de ${displayName}`}
        title={displayName}
        style={{ 
          width: size, 
          height: size * 0.75, // Proporción típica de banderas
          objectFit: 'cover',
          borderRadius: '2px'
        }}
        className="border border-gray-200"
        onError={(e) => {
          // Si la imagen falla, ocultar la imagen y mostrar solo el texto
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <span>{displayName}</span>
    </span>
  );
};

// Componente solo para la bandera sin texto
export const FlagOnly: React.FC<CountryFlagProps> = ({ 
  country, 
  size = 16, 
  className = "" 
}) => {
  const flagPath = countryToFlagMap[country];
  
  if (!flagPath) {
    return null;
  }

  return (
    <img
      src={flagPath}
      alt={`Bandera de ${country}`}
      title={country}
      style={{ 
        width: size, 
        height: size * 0.75,
        objectFit: 'cover',
        borderRadius: '2px'
      }}
      className={`border border-gray-200 ${className}`}
      onError={(e) => {
        // Si la imagen falla, ocultar la imagen
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};
