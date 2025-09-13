export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name?: string;
}

const sanitizeInput = (input: string): string => {
  const cleaned = input.replace(/[<>\"'`;]/g, '');
  return encodeURIComponent(cleaned);
};

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address || address.trim().length < 3) {
    return null;
  }

  const sanitizedAddress = sanitizeInput(address);
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${sanitizedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'TruckerTimeApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};