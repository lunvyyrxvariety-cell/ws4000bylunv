// WS4000+ Weather Fetcher

async function getCoordinates(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WS4000Plus-Emulator' }
  });
  const data = await res.json();
  if (!data.length) throw new Error('City not found');
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}

async function getNWSGridpoint(lat, lon) {
  const url = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WS4000Plus-Emulator (your@email.com)' }
  });
  if (!res.ok) throw new Error('NWS does not cover this location (outside US)');
  const data = await res.json();
  return {
    forecastUrl: data.properties.forecast,
    forecastHourlyUrl: data.properties.forecastHourly,
    city: data.properties.relativeLocation.properties.city,
    state: data.properties.relativeLocation.properties.state
  };
}

async function getForecast(forecastUrl) {
  const res = await fetch(forecastUrl, {
    headers: { 'User-Agent': 'WS4000Plus-Emulator (your@email.com)' }
  });
  const data = await res.json();
  return data.properties.periods; // array of forecast periods
}

// Main function — call this with a city name
async function getWeatherForCity(city) {
  const coords = await getCoordinates(city);
  const gridpoint = await getNWSGridpoint(coords.lat, coords.lon);
  const forecast = await getForecast(gridpoint.forecastUrl);

  return {
    location: `${gridpoint.city}, ${gridpoint.state}`,
    current: forecast[0],      // tonight or today
    periods: forecast.slice(0, 8) // next ~4 days
  };
}

// Example usage:
// getWeatherForCity("Chicago").then(data => console.log(data));
