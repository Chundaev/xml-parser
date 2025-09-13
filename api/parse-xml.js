const fetch = require('node-fetch');
const xml2js = require('xml2js');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { minPrice = 0, maxPrice = Infinity, minArea = 0, maxArea = Infinity, minRooms = 0, maxRooms = Infinity } = req.query;
    const response = await fetch('https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml');
    if (!response.ok) {
      return res.status(500).json({ error: 'Не удалось загрузить XML-фид: ' + response.status });
    }
    const xmlText = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlText);

    const rootKey = Object.keys(result)[0];
    const allOffers = result[rootKey]?.offer || [];

    const parsedOffers = allOffers
      .map(offer => {
        // Парсинг данных (адаптируйте под структуру вашего XML)
        const rooms = parseInt(offer.rooms?.[0] || 0);
        const floor = parseInt(offer.floor?.[0] || 0);
        const floorsTotal = parseInt(offer['floors-total']?.[0] || 0);
        const builtYear = offer['built-year']?.[0] || 'N/A';
        let description = offer.description?.[0] || '';
        
        // Важно: проверьте структуру вашего XML!
        const priceValue = offer.price?.[0] || 0; // Прямое значение
        const areaValue = offer.area?.[0] || 0; // Прямое значение
        const livingSpaceValue = offer['living-space']?.[0] || 0;
        const kitchenSpaceValue = offer['kitchen-space']?.[0] || 0;

        // Парсинг изображений
        let image = '';
        const images = offer.image || [];
        if (images.length > 0) {
          image = typeof images[0] === 'string' ? images[0] : images[0]._;
        }

        const id = offer['$']['internal-id'] || 'N/A';

        return {
          id: id,
          price: parseFloat(priceValue),
          area: parseFloat(areaValue),
          rooms: rooms,
          floor: floor,
          floorsTotal: floorsTotal,
          livingSpace: parseFloat(livingSpaceValue),
          kitchenSpace: parseFloat(kitchenSpaceValue),
          builtYear: builtYear,
          description: description,
          image: image
        };
      })
      .filter(offer => {
        const validOffer = offer.price > 0 && offer.area > 0 && offer.rooms >= 0;
        return validOffer &&
          offer.price >= parseFloat(minPrice) && offer.price <= parseFloat(maxPrice) &&
          offer.area >= parseFloat(minArea) && offer.area <= parseFloat(maxArea) &&
          offer.rooms >= parseInt(minRooms) && offer.rooms <= parseInt(maxRooms);
      });

    // Если запрос без параметров - возвращаем все данные + информацию о диапазонах
    if (Object.keys(req.query).length === 0) {
      const prices = parsedOffers.map(ap => ap.price).filter(p => p > 0);
      const areas = parsedOffers.map(ap => ap.area).filter(a => a > 0);
      const rooms = parsedOffers.map(ap => ap.rooms).filter(r => r >= 0);
      
      const responseData = {
        apartments: parsedOffers,
        ranges: {
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          minArea: Math.min(...areas),
          maxArea: Math.max(...areas),
          minRooms: Math.min(...rooms),
          maxRooms: Math.max(...rooms)
        }
      };
      
      return res.status(200).json(responseData);
    }

    // Если есть параметры фильтрации - возвращаем только отфильтрованные данные
    res.status(200).json(parsedOffers);
  } catch (error) {
    console.error('Ошибка в API:', error);
    res.status(500).json({ error: 'Ошибка обработки XML: ' + error.message });
  }
};
