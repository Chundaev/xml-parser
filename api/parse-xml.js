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
    console.log('Корневой элемент:', Object.keys(result)[0]);

    const rootKey = Object.keys(result)[0];
    const allOffers = result[rootKey]?.offer || [];
    console.log('Найдено offer:', allOffers.length);

    const parsedOffers = allOffers
      .map(offer => {
        const getValue = (tag) => offer[tag]?.[0] || 'N/A';
        const getNestedValue = (parent, child) => parseFloat(offer[parent]?.[0]?.[child]?.[0]) || 0;
        const getAttr = (attr) => offer['$'] ? offer['$'][attr] || 'N/A' : 'N/A';

        let description = getValue('description');
        description = description.replace(/ЖК\s*«Grand\s*Bereg».*?(Республика\s*Дагестан,\s*Махачкала,\s*в\s*районе\s*Ипподрома\s*,)/gis, '').trim();

        return {
          id: getAttr('internal-id'),
          price: getNestedValue('price', 'value'),
          area: getNestedValue('area', 'value'),
          rooms: parseInt(getValue('rooms')) || 0,
          floor: parseInt(getValue('floor')) || 0,
          floorsTotal: parseInt(getValue('floors-total')) || 0,
          livingSpace: getNestedValue('living-space', 'value'),
          kitchenSpace: getNestedValue('kitchen-space', 'value'),
          builtYear: getValue('built-year'),
          description: description,
          image: getValue('image') ? getValue('image')._ || getValue('image') : ''
        };
      })
      .filter(offer =>
        offer.price >= parseFloat(minPrice) && offer.price <= parseFloat(maxPrice) &&
        offer.area >= parseFloat(minArea) && offer.area <= parseFloat(maxArea) &&
        offer.rooms >= parseInt(minRooms) && offer.rooms <= parseInt(maxRooms)
      );
    res.status(200).json(parsedOffers);
  } catch (error) {
    console.error('Ошибка в API:', error);
    res.status(500).json({ error: 'Ошибка обработки XML: ' + error.message });
  }
};
