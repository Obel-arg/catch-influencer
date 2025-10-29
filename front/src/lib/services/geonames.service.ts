/**
 * Geonames API Service
 * Fetches city data from geonames.org API
 */

export interface GeonamesCity {
  id: number;
  name: string;
  adminName1?: string; // State/Province name
  countryCode: string;
}

class GeonamesService {
  private readonly baseUrl = 'http://api.geonames.org';
  // Use environment variable or fallback to demo (limited to 20k requests/day)
  private readonly username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME || 'demo';

  /**
   * Fetches cities for a given country code
   * @param countryCode Two-letter ISO 3166 country code (e.g., "US", "MX")
   * @returns Array of cities with geonames ID and name
   */
  async getCitiesByCountry(countryCode: string): Promise<GeonamesCity[]> {
    try {
      // Geonames API requires HTTP (not HTTPS) for free tier
      const url = `${this.baseUrl}/searchJSON?country=${countryCode}&featureClass=P&maxRows=1000&username=${this.username}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geonames API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for API error status (e.g., daily limit exceeded)
      if (data.status && data.status.value !== 0) {
        const errorMessage = data.status.message || 'Geonames API error';
        console.error('Geonames API error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (data.geonames && Array.isArray(data.geonames)) {
        return data.geonames.map((city: any) => ({
          id: parseInt(city.geonameId, 10),
          name: city.name,
          adminName1: city.adminName1,
          countryCode: city.countryCode,
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching cities from Geonames:', error);
      // Re-throw the error so the UI can handle it appropriately
      throw error;
    }
  }

  /**
   * Searches for cities by name within a country
   * @param query City name search query
   * @param countryCode Optional country code to limit search
   * @returns Array of matching cities
   */
  async searchCities(query: string, countryCode?: string): Promise<GeonamesCity[]> {
    try {
      let url = `${this.baseUrl}/searchJSON?name=${encodeURIComponent(query)}&featureClass=P&maxRows=50&username=${this.username}`;
      
      if (countryCode) {
        url += `&country=${countryCode}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geonames API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for API error status
      if (data.status && data.status.value !== 0) {
        const errorMessage = data.status.message || 'Geonames API error';
        console.error('Geonames API error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (data.geonames && Array.isArray(data.geonames)) {
        return data.geonames.map((city: any) => ({
          id: parseInt(city.geonameId, 10),
          name: city.name,
          adminName1: city.adminName1,
          countryCode: city.countryCode,
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error searching cities from Geonames:', error);
      throw error;
    }
  }
}

export const geonamesService = new GeonamesService();

