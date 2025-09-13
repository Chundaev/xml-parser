<div id="apartment-finder" style="background-color: #f8f5f0; padding: 20px; border-radius: 8px; width: 100%; max-width: 1200px; margin: 0 auto; font-family: 'Tilda Sans', Arial, sans-serif; color: #7d7d7d; box-sizing: border-box; position: relative; min-height: 400px; overflow-x: hidden;">
  <style>
    h2 { 
      display: block;
      color: #ffffff; 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      font-size: 24px; 
      margin: 0 0 10px 0; 
    }
    h2.available-apartments { 
      color: #2e2e2e; 
      margin-bottom: 20px; 
    }
    label { 
      display: block;
      color: #2e2e2e; 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      font-size: 16px; 
      text-align: center;
      margin-bottom: 10px;
    }
    .filters-header { 
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #cba135; 
      color: white; 
      padding: 10px; 
      text-align: center; 
      border-radius: 4px; 
      margin-bottom: 20px; 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      height: 50px;
    }
    .apartment-card { 
      display: flex;
      flex-direction: column;
      background-color: white; 
      border: 1px solid #ccc; 
      padding: 15px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      min-height: 400px; 
      justify-content: space-between; 
      overflow: auto; 
      box-sizing: border-box;
    }
    .apartment-card h3 { 
      color: #2e2e2e; 
      margin-top: 0; 
      font-size: 20px; 
    }
    .apartment-card p { 
      margin: 5px 0; 
      font-size: 16px; 
    }
    .apartment-card img { 
      max-width: 100%; 
      max-height: 200px; 
      object-fit: contain; 
      border-radius: 4px; 
      margin-top: 10px; 
    }
    #apartments-list { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 20px; 
      margin-top: 20px; 
      box-sizing: border-box;
    }
    #error { 
      display: block;
      color: red; 
      text-align: center; 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      font-size: 18px; 
      margin-top: 20px;
    }
    #loading { 
      display: block;
      text-align: center; 
      color: #2e2e2e; 
      font-size: 24px; 
      font-weight: bold; 
      padding: 40px 0; 
      animation: pulse 1.5s infinite; 
    }
    @keyframes pulse { 
      0% { opacity: 0.6; } 
      50% { opacity: 1; } 
      100% { opacity: 0.6; } 
    }
    #show-more { 
      display: block;
      background-color: #a8862b; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      cursor: pointer; 
      border-radius: 4px; 
      margin: 20px auto; 
      font-family: 'Tilda Sans', Arial, sans-serif; 
      font-size: 18px; 
    }
    #show-more:hover { 
      background-color: #dcaf3e; 
    }
    .filter-group { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      margin-bottom: 20px; 
      gap: 10px; 
      box-sizing: border-box;
    }
    .filter-group div { 
      display: flex; 
      gap: 10px; 
      justify-content: center;
    }
    input[type="range"] { 
      -webkit-appearance: none; 
      width: 200px; 
      height: 8px; 
      background: #e8e8e8; 
      border-radius: 5px; 
      outline: none; 
      display: block; 
    }
    input[type="range"]::-webkit-slider-thumb { 
      -webkit-appearance: none; 
      width: 20px; 
      height: 20px; 
      background: #a8862b; 
      border-radius: 50%; 
      cursor: pointer; 
    }
    input[type="range"]::-webkit-slider-thumb:hover { 
      background: #dcaf3e; 
    }
    input[type="range"]::-moz-range-track { 
      background: #e8e8e8; 
      border-radius: 5px; 
    }
    input[type="range"]::-moz-range-thumb { 
      width: 20px; 
      height: 20px; 
      background: #a8862b; 
      border-radius: 50%; 
      cursor: pointer; 
    }
    input[type="range"]::-moz-range-thumb:hover { 
      background: #dcaf3e; 
    }
    @media (max-width: 768px) {
      #apartment-finder {
        padding: 10px;
        min-height: 300px;
      }
      h2 {
        font-size: 20px;
      }
      h2.available-apartments {
        margin-bottom: 15px;
      }
      label {
        font-size: 14px;
      }
      .filters-header {
        padding: 8px;
        margin-bottom: 15px;
      }
      .apartment-card {
        padding: 10px;
        min-height: 300px;
      }
      .apartment-card h3 {
        font-size: 18px;
      }
      .apartment-card p {
        font-size: 14px;
      }
      .apartment-card img {
        max-height: 150px;
      }
      #apartments-list {
        grid-template-columns: 1fr;
        gap: 15px;
        margin-top: 15px;
      }
      #error, #loading {
        font-size: 16px;
        padding: 20px 0;
      }
      #show-more {
        padding: 10px 20px;
        font-size: 16px;
      }
      .filter-group {
        gap: 10px;
      }
      .filter-group div {
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      input[type="range"] {
        width: 100%;
        max-width: 200px;
      }
    }
    @media (max-width: 480px) {
      h2 {
        font-size: 18px;
      }
      label {
        font-size: 12px;
      }
      .apartment-card h3 {
        font-size: 16px;
      }
      .apartment-card p {
        font-size: 12px;
      }
      #error, #loading {
        font-size: 14px;
      }
      #show-more {
        font-size: 14px;
      }
    }
  </style>

  <div class="filters-header">
    <h2>Планировки и цены</h2>
  </div>
  
  <div class="filter-group">
    <label>Цена (руб.): <span id="price-range">0 - 20,000,000</span></label>
    <div>
      <input type="range" id="min-price" min="0" max="20000000" value="0">
      <input type="range" id="max-price" min="0" max="20000000" value="20000000">
    </div>
  </div>
  <div class="filter-group">
    <label>Площадь (кв.м): <span id="area-range">0 - 300</span></label>
    <div>
      <input type="range" id="min-area" min="0" max="300" value="0">
      <input type="range" id="max-area" min="0" max="300" value="300">
    </div>
  </div>
  <div class="filter-group">
    <label>Комнаты: <span id="rooms-range">0 - 3</span></label>
    <div>
      <input type="range" id="min-rooms" min="0" max="3" value="0">
      <input type="range" id="max-rooms" min="0" max="3" value="3">
    </div>
  </div>
  
  <h2 class="available-apartments">Доступные квартиры</h2>
  <div id="apartments-list"></div>
  <button id="show-more" style="display: none;">Показать ещё</button>
  <div id="loading" style="display: block;">Пожалуйста, подождите, идёт загрузка данных...</div>
  <div id="error" style="display: none;">Ошибка загрузки данных. Попробуйте перезагрузить страницу или проверьте подключение.</div>
</div>

<script>
  const apiUrl = 'https://xml-parser-saddam05.vercel.app/api/parse-xml';
  const cacheKey = 'apartmentsData';
  const cacheTTL = 3600000; // 1 час в мс
  
  let apartmentsData = [];
  let filteredData = [];
  let currentPage = 0;
  const itemsPerPage = 9;

  async function loadApartments() {
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheKey + '_time');
    if (cached && cachedTime && Date.now() - parseInt(cachedTime) < cacheTTL) {
      apartmentsData = JSON.parse(cached);
      console.log('Загружено из кэша:', apartmentsData.length, 'квартир');
      console.log('Комнаты в данных:', [...new Set(apartmentsData.map(ap => ap.rooms))]);
      setupRanges();
      applyFilters();
      document.getElementById('loading').style.display = 'none';
      return;
    }

    try {
      const response = await fetch(apiUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      apartmentsData = await response.json();
      console.log('Загружено из API:', apartmentsData.length, 'квартир');
      console.log('Комнаты в данных:', [...new Set(apartmentsData.map(ap => ap.rooms))]);
      
      localStorage.setItem(cacheKey, JSON.stringify(apartmentsData));
      localStorage.setItem(cacheKey + '_time', Date.now());
      
      setupRanges();
      applyFilters();
      document.getElementById('loading').style.display = 'none';
    } catch (error) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').textContent = `Ошибка загрузки данных: ${error.message}. Если проблема сохраняется, свяжитесь с поддержкой.`;
      document.getElementById('error').style.display = 'block';
      console.error('Ошибка:', error.message);

      // Fallback на прокси, если CORS блокирует
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/' + apiUrl;
      try {
        const proxyResponse = await fetch(proxyUrl, { mode: 'cors' });
        if (!proxyResponse.ok) throw new Error(`Proxy error! status: ${proxyResponse.status}`);
        apartmentsData = await proxyResponse.json();
        console.log('Загружено через прокси:', apartmentsData.length, 'квартир');
        console.log('Комнаты в данных:', [...new Set(apartmentsData.map(ap => ap.rooms))]);
        
        localStorage.setItem(cacheKey, JSON.stringify(apartmentsData));
        localStorage.setItem(cacheKey + '_time', Date.now());
        
        setupRanges();
        applyFilters();
        document.getElementById('loading').style.display = 'none';
      } catch (proxyError) {
        document.getElementById('error').textContent = `Ошибка загрузки данных: ${proxyError.message}. Проверьте API или подключение.`;
        console.error('Ошибка прокси:', proxyError.message);
      }
    }
  }

  function setupRanges() {
    if (apartmentsData.length === 0) {
      console.warn('Нет данных для настройки диапазонов');
      document.getElementById('error').textContent = 'Данные о квартирах не загружены. Проверьте подключение или API.';
      document.getElementById('error').style.display = 'block';
      return;
    }
    
    const prices = apartmentsData.map(ap => ap.price).filter(p => p > 0);
    const areas = apartmentsData.map(ap => ap.area).filter(a => a > 0);
    const rooms = apartmentsData.map(ap => ap.rooms).filter(r => r >= 0);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    const minRooms = Math.min(...rooms);
    const maxRooms = Math.max(...rooms);
    
    console.log('Диапазон комнат:', minRooms, '-', maxRooms);
    
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const minAreaInput = document.getElementById('min-area');
    const maxAreaInput = document.getElementById('max-area');
    const minRoomsInput = document.getElementById('min-rooms');
    const maxRoomsInput = document.getElementById('max-rooms');
    
    minPriceInput.min = minPrice;
    minPriceInput.value = minPrice;
    maxPriceInput.min = minPrice;
    maxPriceInput.max = maxPrice;
    maxPriceInput.value = maxPrice;
    
    minAreaInput.min = minArea;
    minAreaInput.value = minArea;
    maxAreaInput.min = minArea;
    maxAreaInput.max = maxArea;
    maxAreaInput.value = maxArea;
    
    minRoomsInput.min = minRooms;
    minRoomsInput.max = maxRooms;
    minRoomsInput.value = minRooms;
    maxRoomsInput.min = minRooms;
    maxRoomsInput.max = maxRooms;
    maxRoomsInput.value = maxRooms;
    
    updateRangeLabels();
  }

  function updateRangeLabels() {
    const minPrice = parseFloat(document.getElementById('min-price').value);
    const maxPrice = parseFloat(document.getElementById('max-price').value);
    const minArea = parseFloat(document.getElementById('min-area').value);
    const maxArea = parseFloat(document.getElementById('max-area').value);
    const minRooms = parseInt(document.getElementById('min-rooms').value);
    const maxRooms = parseInt(document.getElementById('max-rooms').value);
    
    document.getElementById('price-range').textContent = `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    document.getElementById('area-range').textContent = `${Math.round(minArea)} - ${Math.round(maxArea)}`;
    document.getElementById('rooms-range').textContent = `${minRooms} - ${maxRooms}`;
  }

  function applyFilters() {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const minAreaInput = document.getElementById('min-area');
    const maxAreaInput = document.getElementById('max-area');
    const minRoomsInput = document.getElementById('min-rooms');
    const maxRoomsInput = document.getElementById('max-rooms');
    
    if (parseFloat(minPriceInput.value) > parseFloat(maxPriceInput.value)) {
      maxPriceInput.value = minPriceInput.value;
    }
    if (parseFloat(maxPriceInput.value) < parseFloat(minPriceInput.value)) {
      minPriceInput.value = maxPriceInput.value;
    }
    if (parseFloat(minAreaInput.value) > parseFloat(maxAreaInput.value)) {
      maxAreaInput.value = minAreaInput.value;
    }
    if (parseFloat(maxAreaInput.value) < parseFloat(minAreaInput.value)) {
      minAreaInput.value = maxAreaInput.value;
    }
    if (parseInt(minRoomsInput.value) > parseInt(maxRoomsInput.value)) {
      maxRoomsInput.value = minRoomsInput.value;
    }
    if (parseInt(maxRoomsInput.value) < parseInt(minRoomsInput.value)) {
      minRoomsInput.value = maxRoomsInput.value;
    }
    
    const minPrice = parseFloat(minPriceInput.value);
    const maxPrice = parseFloat(maxPriceInput.value);
    const minArea = parseFloat(minAreaInput.value);
    const maxArea = parseFloat(maxAreaInput.value);
    const minRooms = parseInt(minRoomsInput.value);
    const maxRooms = parseInt(maxRoomsInput.value);
    
    updateRangeLabels();
    
    filteredData = apartmentsData.filter(ap => 
      ap.price >= minPrice && ap.price <= maxPrice &&
      ap.area >= minArea && ap.area <= maxArea &&
      ap.rooms >= minRooms && ap.rooms <= maxRooms
    ).sort((a, b) => a.area - b.area); // Сортировка по площади (от меньшей к большей)
    
    currentPage = 0;
    document.getElementById('apartments-list').innerHTML = '';
    renderPage();
  }

  function renderPage() {
    const list = document.getElementById('apartments-list');
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    pageData.forEach(ap => {
      const card = document.createElement('div');
      card.className = 'apartment-card';
      card.innerHTML = `
        <h3>Квартира #${ap.id}</h3>
        <p>Цена: ${ap.price.toLocaleString()} руб.</p>
        <p>Площадь: ${ap.area} м²</p>
        <p>Комнат: ${ap.rooms}</p>
        <p>Этаж: ${ap.floor} из ${ap.floorsTotal}</p>
        <p>Жилая площадь: ${ap.livingSpace} м²</p>
        <p>Кухня: ${ap.kitchenSpace} м²</p>
        <p>Год постройки: ${ap.builtYear}</p>
        ${ap.description ? `<p>${ap.description}</p>` : ''}
        ${ap.image ? `<img src="${ap.image}" alt="Фото квартиры" onerror="this.style.display='none'">` : ''}
      `;
      list.appendChild(card);
    });
    
    const showMore = document.getElementById('show-more');
    if (end < filteredData.length) {
      showMore.style.display = 'block';
    } else {
      showMore.style.display = 'none';
    }
    
    if (filteredData.length === 0) {
      list.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Нет подходящих квартир.</p>';
    }
  }

  document.getElementById('show-more').addEventListener('click', () => {
    currentPage++;
    renderPage();
  });

  ['min-price', 'max-price', 'min-area', 'max-area', 'min-rooms', 'max-rooms'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyFilters);
  });

  loadApartments();
</script>
