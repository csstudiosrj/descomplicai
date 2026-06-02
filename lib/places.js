/**
 * Cliente para Google Places API — busca de locais e fornecedores
 * @module lib/places
 */

const GOOGLE_PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

/**
 * Busca locais por texto e localização
 * @param {string} query
 * @param {{lat: number, lng: number}} location
 * @param {number} radius — em metros, default 50000
 * @returns {Promise<Array<{name: string, address: string, rating: number, placeId: string}>>}
 */
export async function buscarLocais(query, location, radius = 50000) {
  if (!GOOGLE_PLACES_KEY) {
    console.warn('NEXT_PUBLIC_GOOGLE_PLACES_KEY não configurado');
    throw new Error('Google Places não configurado');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('location', `${location.lat},${location.lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('key', GOOGLE_PLACES_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Erro na busca Google Places');

  const data = await res.json();
  return (data.results || []).map(r => ({
    name: r.name,
    address: r.formatted_address,
    rating: r.rating,
    placeId: r.place_id,
    types: r.types,
  }));
}

/**
 * Busca detalhes de um local pelo Place ID
 * @param {string} placeId
 * @returns {Promise<Object>}
 */
export async function buscarDetalhesLocal(placeId) {
  if (!GOOGLE_PLACES_KEY) throw new Error('Google Places não configurado');

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,website,rating,photos,opening_hours');
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('key', GOOGLE_PLACES_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Erro ao buscar detalhes');
  return res.json();
}

/**
 * Autocomplete de endereços
 * @param {string} input
 * @returns {Promise<Array<{description: string, placeId: string}>>}
 */
export async function autocompleteEndereco(input) {
  if (!GOOGLE_PLACES_KEY) throw new Error('Google Places não configurado');

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', input);
  url.searchParams.set('types', 'address');
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('components', 'country:br');
  url.searchParams.set('key', GOOGLE_PLACES_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Erro no autocomplete');
  const data = await res.json();
  return (data.predictions || []).map(p => ({
    description: p.description,
    placeId: p.place_id,
  }));
}