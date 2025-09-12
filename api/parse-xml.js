const fetch = require('node-fetch');
const xml2js = require('xml2js');

module.exports = async (req, res) => {
  try {
    const { minPrice = 0, maxPrice = Infinity, minArea = 0, maxArea = Infinity, minRooms = 0, maxRooms = Infinity } = req.query;
    const response = await fetch('https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml');
    if (!response.ok) {
      return res.status(500).json({ error: 'Не удалось загрузить XML-фид: ' + response.status });
    }
    const xmlText = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlText);
    console.log('Парсинг XML завершён. Корневой элемент:', Object.keys(result)[0]); // Для отладки
    
    // Динамический поиск offer в любом корневом элементе
    const rootKey = Object.keys(result)[0];
    const allOffers = result[rootKey]?.offer || [];
    console.log('Найдено offer:', allOffers.length); // Для отладки
    
    const parsedOffers = allOffers
      .map(offer => ({
        id: offer['$']['internal-id'] || 'N/A',
        price: parseFloat(offer.price?.[0]?.value?.[0]) || 0,
        area: parseFloat(offer.area?.[0]?.value?.[0]) || 0,
        rooms: parseInt(offer.rooms?.[0]) || 0,
        floor: parseInt(offer.floor?.[0]) || 0,
        floorsTotal: parseInt(offer['floors-total']?.[0]) || 0,
        livingSpace: parseFloat(offer['living-space']?.[0]?.value?.[0]) || 0,
        kitchenSpace: parseFloat(offer['kitchen-space']?.[0]?.value?.[0]) || 0,
        builtYear: offer['built-year']?.[0] || 'N/A',
        description: offer.description?.[0]?.replace(/ЖК\s*«Grand\s*Bereg».*?(Республика\s*Дагестан,\s*Махачкала,\s*в\s*районе\s*Ипподрома\s*,)/gis, '').trim() || '',
        image: offer.image?.[0] || ''
      }))
      .filter(offer =>
        offer.price >= parseFloat(minPrice) && offer.price <= parseFloat(maxPrice) &&
        offer.area >= parseFloat(minArea) && offer.area <= parseFloat(maxArea) &&
        offer.rooms >= parseInt(minRooms) && offer.rooms <= parseInt(maxRooms)
      );
    res.status(200).json(parsedOffers);
  } catch (error) {
    console.error('Ошибка в API:', error); // Для логов Vercel
    res.status(500).json({ error: 'Ошибка обработки XML: ' + error.message });
  }
};
