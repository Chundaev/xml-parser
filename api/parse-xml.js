const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // CORS — обязательно для Tilda
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const url = 'https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml';
    console.log('Запрашиваю XML...');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // ✅ ИСПОЛЬЗУЕМ ПРОСТОЙ ПАРСИНГ ЧЕРЕЗ REGEXP — БЫСТРО, НАДЕЖНО, БЕЗ XML2JS
    const priceValues = xmlText.match(/<price>\s*<value>([\d.]+)<\/value>/g) || [];
    const areaValues = xmlText.match(/<area>\s*<value>([\d.]+)<\/value>/g) || [];
    const roomValues = xmlText.match(/<rooms>(\d+)<\/rooms>/g) || [];

    const prices = priceValues.map(p => parseFloat(p.match(/<value>([\d.]+)/)[1]));
    const areas = areaValues.map(a => parseFloat(a.match(/<value>([\d.]+)/)[1]));
    const rooms = roomValues.map(r => parseInt(r.match(/<rooms>(\d+)/)[1]));

    // Фильтруем только положительные значения
    const validPrices = prices.filter(p => p > 0);
    const validAreas = areas.filter(a => a > 0);
    const validRooms = rooms.filter(r => r >= 0);

    const result = {
      ranges: {
        minPrice: validPrices.length ? Math.min(...validPrices) : 0,
        maxPrice: validPrices.length ? Math.max(...validPrices) : 20000000,
        minArea: validAreas.length ? Math.min(...validAreas) : 0,
        maxArea: validAreas.length ? Math.max(...validAreas) : 300,
        minRooms: validRooms.length ? Math.min(...validRooms) : 0,
        maxRooms: validRooms.length ? Math.max(...validRooms) : 4
      }
    };

    console.log('✅ Отдаем диапазоны:', result.ranges);
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({
      error: 'Ошибка получения данных: ' + error.message,
      ranges: {
        minPrice: 0,
        maxPrice: 20000000,
        minArea: 0,
        maxArea: 300,
        minRooms: 0,
        maxRooms: 4
      }
    });
  }
};
