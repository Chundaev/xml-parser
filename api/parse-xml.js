const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const url = 'https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml';
    console.log('Запрашиваю XML...');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const xmlText = await response.text();

    // Извлекаем все offer через регулярки
    const offersMatch = xmlText.match(/<offer[^>]*>[\s\S]*?<\/offer>/g) || [];
    
    const parsedOffers = offersMatch.map(offerStr => {
      // Извлекаем internal-id
      const idMatch = offerStr.match(/internal-id\s*=\s*["']([^"']+)["']/);
      const id = idMatch ? idMatch[1] : 'N/A';

      // Извлекаем price.value
      const priceMatch = offerStr.match(/<price>\s*<value>([\d.]+)<\/value>/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

      // Извлекаем area.value
      const areaMatch = offerStr.match(/<area>\s*<value>([\d.]+)<\/value>/);
      const area = areaMatch ? parseFloat(areaMatch[1]) : 0;

      // Извлекаем rooms
      const roomsMatch = offerStr.match(/<rooms>(\d+)<\/rooms>/);
      const rooms = roomsMatch ? parseInt(roomsMatch[1]) : 0;

      // Извлекаем floor
      const floorMatch = offerStr.match(/<floor>(\d+)<\/floor>/);
      const floor = floorMatch ? parseInt(floorMatch[1]) : 0;

      // Извлекаем floors-total
      const floorsTotalMatch = offerStr.match(/<floors-total>(\d+)<\/floors-total>/);
      const floorsTotal = floorsTotalMatch ? parseInt(floorsTotalMatch[1]) : 0;

      // Извлекаем built-year
      const builtYearMatch = offerStr.match(/<built-year>(\d{4})<\/built-year>/);
      const builtYear = builtYearMatch ? builtYearMatch[1] : 'N/A';

      // Извлекаем первое image
      const imageMatch = offerStr.match(/<image[^>]*>(.*?)<\/image>/);
      const image = imageMatch ? imageMatch[1].trim() : '';

      // Извлекаем locality-name
      const localityMatch = offerStr.match(/<locality-name>(.*?)<\/locality-name>/);
      const locality = localityMatch ? localityMatch[1].trim() : '';

      // Извлекаем address
      const addressMatch = offerStr.match(/<address>(.*?)<\/address>/);
      const address = addressMatch ? addressMatch[1].trim() : '';

      // Извлекаем living-space и kitchen-space
      const livingMatch = offerStr.match(/<living-space>\s*<value>([\d.]+)<\/value>/);
      const livingSpace = livingMatch ? parseFloat(livingMatch[1]) : 0;

      const kitchenMatch = offerStr.match(/<kitchen-space>\s*<value>([\d.]+)<\/value>/);
      const kitchenSpace = kitchenMatch ? parseFloat(kitchenMatch[1]) : 0;

      // ✅ УБРАЛИ description — НЕ ВКЛЮЧАЕМ ЕГО В ОТВЕТ!
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

    // Сортировка: по площади ↑, затем по цене ↑
    const sortedOffers = parsedOffers.sort((a, b) => {
      if (a.area !== b.area) return a.area - b.area;
      return a.price - b.price;
    });

    // Формируем диапазоны
    const prices = sortedOffers.map(ap => ap.price).filter(p => p > 0);
    const areas = sortedOffers.map(ap => ap.area).filter(a => a > 0);
    const roomsList = sortedOffers.map(ap => ap.rooms).filter(r => r >= 0);

    const result = {
      apartments: sortedOffers, // ← Без description!
      ranges: {
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 20000000,
        minArea: areas.length ? Math.min(...areas) : 0,
        maxArea: areas.length ? Math.max(...areas) : 300,
        minRooms: roomsList.length ? Math.min(...roomsList) : 0,
        maxRooms: roomsList.length ? Math.max(...roomsList) : 4
      }
    };

    console.log('✅ Отдаем:', sortedOffers.length, 'квартир без description');
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({
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
