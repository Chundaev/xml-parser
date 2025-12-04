// ===== Глобальный in-memory кэш для Vercel Function =====
let lastResult = null;          // сюда положим готовый { apartments, ranges }
let lastUpdated = 0;            // timestamp последнего успешного обновления
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

module.exports = async (req, res) => {
  // --- CORS заголовки ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Preflight (OPTIONS) ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Тип ответа и кэш HTTP (для Vercel CDN)
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // s-maxage=300 => CDN может кэшировать 5 минут, stale-while-revalidate=600 => 10 минут можно отдавать старый, пока обновляется
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const now = Date.now();

  // ===== 1. Если есть актуальный кэш — отдаём его сразу =====
  if (lastResult && now - lastUpdated < CACHE_TTL_MS) {
    console.log('✅ Отдаю данные из in-memory кэша на Vercel');
    return res.status(200).json(lastResult);
  }

  // ===== 2. Иначе тянем свежий XML, парсим, обновляем кэш =====
  try {
    const url = 'https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml';
    console.log('Запрашиваю XML с Unistroy...');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const xmlText = await response.text();

    // Извлекаем все offer через регулярки
    const offersMatch = xmlText.match(/<offer[^>]*>[\s\S]*?<\/offer>/g) || [];

    const parsedOffers = offersMatch.map(offerStr => {
      // internal-id
      const idMatch = offerStr.match(/internal-id\s*=\s*["']([^"']+)["']/);
      const id = idMatch ? idMatch[1] : 'N/A';

      // price.value
      const priceMatch = offerStr.match(/<price>\s*<value>([\d.]+)<\/value>/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

      // area.value
      const areaMatch = offerStr.match(/<area>\s*<value>([\d.]+)<\/value>/);
      const area = areaMatch ? parseFloat(areaMatch[1]) : 0;

      // rooms
      const roomsMatch = offerStr.match(/<rooms>(\d+)<\/rooms>/);
      const rooms = roomsMatch ? parseInt(roomsMatch[1]) : 0;

      // floor
      const floorMatch = offerStr.match(/<floor>(\d+)<\/floor>/);
      const floor = floorMatch ? parseInt(floorMatch[1]) : 0;

      // floors-total
      const floorsTotalMatch = offerStr.match(/<floors-total>(\d+)<\/floors-total>/);
      const floorsTotal = floorsTotalMatch ? parseInt(floorsTotalMatch[1]) : 0;

      // built-year
      const builtYearMatch = offerStr.match(/<built-year>(\d{4})<\/built-year>/);
      const builtYear = builtYearMatch ? builtYearMatch[1] : 'N/A';

      // первое image
      const imageMatch = offerStr.match(/<image[^>]*>(.*?)<\/image>/);
      const image = imageMatch ? imageMatch[1].trim() : '';

      // locality-name
      const localityMatch = offerStr.match(/<locality-name>(.*?)<\/locality-name>/);
      const locality = localityMatch ? localityMatch[1].trim() : '';

      // address
      const addressMatch = offerStr.match(/<address>(.*?)<\/address>/);
      const address = addressMatch ? addressMatch[1].trim() : '';

      // living-space
      const livingMatch = offerStr.match(/<living-space>\s*<value>([\d.]+)<\/value>/);
      const livingSpace = livingMatch ? parseFloat(livingMatch[1]) : 0;

      // kitchen-space
      const kitchenMatch = offerStr.match(/<kitchen-space>\s*<value>([\d.]+)<\/value>/);
      const kitchenSpace = kitchenMatch ? parseFloat(kitchenMatch[1]) : 0;

      // description специально НЕ включаем (как у тебя было)
      return {
        id,
        price,
        area,
        rooms,
        floor,
        floorsTotal,
        builtYear,
        image,
        locality,
        address,
        livingSpace,
        kitchenSpace
      };
    })
    .filter(ap => ap.price > 0 && ap.area > 0 && ap.rooms >= 0);

    // Сортировка: сначала по площади, потом по цене
    const sortedOffers = parsedOffers.sort((a, b) => {
      if (a.area !== b.area) return a.area - b.area;
      return a.price - b.price;
    });

    // Диапазоны
    const prices = sortedOffers.map(ap => ap.price).filter(p => p > 0);
    const areas = sortedOffers.map(ap => ap.area).filter(a => a > 0);
    const roomsList = sortedOffers.map(ap => ap.rooms).filter(r => r >= 0);

    const result = {
      apartments: sortedOffers,
      ranges: {
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 20000000,
        minArea: areas.length ? Math.min(...areas) : 0,
        maxArea: areas.length ? Math.max(...areas) : 300,
        minRooms: roomsList.length ? Math.min(...roomsList) : 0,
        maxRooms: roomsList.length ? Math.max(...roomsList) : 4
      }
    };

    console.log('✅ Обновили данные из XML, всего квартир:', sortedOffers.length);

    // Обновляем глобальный кэш
    lastResult = result;
    lastUpdated = now;

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Ошибка при получении/парсинге XML:', error.message);

    // Если у нас уже есть старый кэш — лучше отдать его, чем 500
    if (lastResult) {
      console.warn('⚠️ Отдаю старый кэш, так как свежие данные получить не удалось');
      return res.status(200).json(lastResult);
    }

    // Если вообще ничего нет — только тогда 500
    return res.status(500).json({
      apartments: [],
      ranges: {
        minPrice: 0,
        maxPrice: 20000000,
        minArea: 0,
        maxArea: 300,
        minRooms: 0,
        maxRooms: 4
      },
      error: 'Ошибка получения данных: ' + error.message
    });
  }
};
