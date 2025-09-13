const fetch = require('node-fetch');
const xml2js = require('xml2js');

module.exports = async (req, res) => {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = 'https://partner.unistroyrf.ru/erz/unistroyYandexNedvijMakhachkala.xml';
    console.log('Запрос к XML:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Ошибка HTTP:', response.status, response.statusText);
      return res.status(500).json({ error: `HTTP ${response.status}: ${response.statusText}` });
    }

    const xmlText = await response.text();
    console.log('Получен XML (первые 500 символов):', xmlText.slice(0, 500));

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      xmlns: true
    });

    const result = await parser.parseStringPromise(xmlText);

    const rootKey = 'realty-feed';
    if (!result[rootKey]) {
      console.error('❌ Не найден корневой элемент "realty-feed"');
      return res.status(500).json({ error: 'Неверная структура XML: отсутствует realty-feed' });
    }

    let offers = result[rootKey].offer;
    if (!offers) {
      console.warn('⚠️ offer не найдены');
      return res.status(200).json({ apartments: [], ranges: {} });
    }

    // Если offer — один объект, а не массив — оборачиваем в массив
    const allOffers = Array.isArray(offers) ? offers : [offers];

    const parsedOffers = allOffers.map(offer => {
      const priceValue = parseFloat(offer.price?.value?.[0] || 0);
      const areaValue = parseFloat(offer.area?.value?.[0] || 0);
      const livingSpaceValue = parseFloat(offer['living-space']?.value?.[0] || 0);
      const kitchenSpaceValue = parseFloat(offer['kitchen-space']?.value?.[0] || 0);

      const rooms = parseInt(offer.rooms?.[0] || 0);
      const floor = parseInt(offer.floor?.[0] || 0);
      const floorsTotal = parseInt(offer['floors-total']?.[0] || 0);
      const builtYear = offer['built-year']?.[0] || 'N/A';

      let image = '';
      if (offer.image) {
        const images = Array.isArray(offer.image) ? offer.image : [offer.image];
        image = images[0] || '';
      }

      const id = offer['$']?.['internal-id'] || 'N/A';
      const description = offer.description?.[0] || '';
      const locality = offer.location?.['locality-name']?.[0] || ''; // ✅ ИСПРАВЛЕНО!
      const address = offer.location?.address?.[0] || '';

      // Фильтруем некорректные предложения
      if (priceValue <= 0 || areaValue <= 0 || rooms < 0) return null;

      return {
        id,
        price: priceValue,
        area: areaValue,
        rooms,
        floor,
        floorsTotal,
        livingSpace: livingSpaceValue,
        kitchenSpace: kitchenSpaceValue,
        builtYear,
        description,
        image,
        locality,
        address
      };
    }).filter(Boolean); // Убираем null

    const prices = parsedOffers.map(ap => ap.price).filter(p => p > 0);
    const areas = parsedOffers.map(ap => ap.area).filter(a => a > 0);
    const roomsList = parsedOffers.map(ap => ap.rooms).filter(r => r >= 0);

    const responseData = {
      apartments: parsedOffers,
      ranges: {
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        minArea: areas.length ? Math.min(...areas) : null,
        maxArea: areas.length ? Math.max(...areas) : null,
        minRooms: roomsList.length ? Math.min(...roomsList) : null,
        maxRooms: roomsList.length ? Math.max(...roomsList) : null
      }
    };

    console.log('✅ Успешно обработано:', parsedOffers.length, 'квартир');
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Ошибка в API:', error.stack);
    res.status(500).json({ error: 'Ошибка обработки XML: ' + error.message });
  }
};
