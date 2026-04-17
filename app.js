// --- Global Config ---
let currentCategories = [];
const brand = window.BRAND || 'iticket';
const API_URL = `/api/${brand}/trips`;
const CONFIG_URL = '/api/config';
let allTrips = [];
let filteredTrips = [];
let activeCategory = 'all';
let cardImageIndexes = {};

// 1. Fetch Everything
async function initApp() {
    try {
        const configRes = await fetch(CONFIG_URL);
        const config = await configRes.json();
        
        if (brand === 'manama') {
            currentCategories = config.manama_categories || [
                { id: 'hotels', label: 'فنادق', icon: 'fa-hotel' },
                { id: 'resorts', label: 'منتجع', icon: 'fa-umbrella-beach' },
                { id: 'chalets', label: 'شاليهات', icon: 'fa-house-chimney' },
                { id: 'rest_houses', label: 'استراحات', icon: 'fa-tree' },
                { id: 'jacuzzi', label: 'جاكوزي', icon: 'fa-hot-tub-person' },
                { id: 'romantic_dinner', label: 'عشاء رومانسي', icon: 'fa-utensils' },
                { id: 'sea_trips', label: 'رحلات بحرية', icon: 'fa-ship' },
                { id: 'horse_riding', label: 'ركوب الخيل', icon: 'fa-horse' }
            ];
        } else {
            currentCategories = config.iticket_categories || [
                { id: 'flight_tickets', label: 'تذاكر طيران', icon: 'fa-plane' },
                { id: 'group_trips', label: 'رحلات جماعية', icon: 'fa-users' },
                { id: 'individual_trips', label: 'رحلات فردية', icon: 'fa-user' },
                { id: 'religious', label: 'رحلات دينية', icon: 'fa-mosque' }
            ];
        }

        renderChoicesGrid(); // نعبئ التصنيفات بالأعلى
        
        const tripsRes = await fetch(API_URL);
        allTrips = await tripsRes.json() || [];
        filteredTrips = allTrips;
        
        renderFilterBar();
        renderMainTrips();
        // renderRecentTrips() removed per user request
    } catch (e) {
        console.error("Initialization Error:", e);
    }
}

// 2. Render Choices Grid (Top)
function renderChoicesGrid() {
    const grid = document.getElementById('main-choices-grid');
    if (!grid) return;
    
    // أضفنا خيار "عرض الكل" في البداية
    const categories = [{ id: 'all', label: 'عرض الكل', icon: 'fa-border-all' }, ...currentCategories];
    
    grid.innerHTML = categories.map(cat => `
        <a href="javascript:void(0)" onclick="filterByCategory('${cat.id}')" class="choice-item">
            <i class="fa-solid ${cat.icon}"></i>
            <span>${cat.label}</span>
        </a>
    `).join('');
}

// 3. Render Filter Bar (Main + Sub)
function renderFilterBar() {
    const filterContainer = document.getElementById('category-filter-bar');
    if (!filterContainer) return;

    // Main Categories Row
    const mainCats = [{ id: 'all', label: 'عرض الكل' }, ...currentCategories];
    let html = `
        <div class="main-filter-row" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
            ${mainCats.map(cat => `
                <div class="category-chip ${activeCategory === cat.id ? 'active' : ''}" 
                     onclick="filterByCategory('${cat.id}')">
                    ${cat.label}
                </div>
            `).join('')}
        </div>
    `;

    // Sub-Categories Row (Destinations)
    if (activeCategory !== 'all') {
        const subCategories = [...new Set(allTrips
            .filter(t => t.type === activeCategory && t.category)
            .map(t => t.category))];

        if (subCategories.length > 0) {
            html += `
                <div class="sub-filter-row" style="display: flex; gap: 8px; overflow-x: auto; padding: 5px 0; border-top: 1px solid #eee; margin-top: 5px;">
                    <div class="sub-chip ${!window.activeSubCategory ? 'active' : ''}" onclick="filterBySubCategory(null)">الكل</div>
                    ${subCategories.map(sub => `
                        <div class="sub-chip ${window.activeSubCategory === sub ? 'active' : ''}" 
                             onclick="filterBySubCategory('${sub}')">
                            ${sub}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    filterContainer.innerHTML = html;
}

// 4. Filtering Logic
window.filterByCategory = (category) => {
    activeCategory = category;
    window.activeSubCategory = null; // Reset sub when main changes
    applyFilters();
    renderFilterBar();

    // Scroll
    const target = document.getElementById('trips-section') || document.getElementById('services-section') || document.getElementById('main-package-grid');
    if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
};

window.filterBySubCategory = (sub) => {
    window.activeSubCategory = sub;
    applyFilters();
    renderFilterBar();
};

function applyFilters() {
    if (activeCategory === 'all') {
        filteredTrips = allTrips;
    } else {
        filteredTrips = allTrips.filter(t => t.type === activeCategory);
        if (window.activeSubCategory) {
            filteredTrips = filteredTrips.filter(t => t.category === window.activeSubCategory);
        }
    }
    renderMainTrips();
}

function getCategoryLabel(type) {
    if (type === 'all') return 'عام';
    const found = currentCategories.find(c => c.id === type);
    return found ? found.label : 'وجهة';
}

function initRecentSlider() {
    const track = document.getElementById('recent-trips-track');
    const container = document.querySelector('.offers-section');
    if (!track || !container) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoPlayInterval;

    const startAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            if (isDown) return;
            const max = track.scrollWidth - track.clientWidth;
            if (track.scrollLeft >= max - 5) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: 280, behavior: 'smooth' });
            }
        }, 3000);
    };

    const stopAutoPlay = () => clearInterval(autoPlayInterval);

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        stopAutoPlay();
    });
    track.addEventListener('mouseleave', () => { isDown = false; startAutoPlay(); });
    track.addEventListener('mouseup', () => { isDown = false; startAutoPlay(); });
    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2;
        track.scrollLeft = scrollLeft - walk;
    });
    track.addEventListener('touchstart', stopAutoPlay);
    track.addEventListener('touchend', startAutoPlay);

    startAutoPlay();
}

// 6. Main Grid Rendering
function renderMainTrips() {
    const grid = document.getElementById('main-package-grid');
    if (!grid) return;

    if (filteredTrips.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: #888;">عذراً، لا توجد نتائج حالياً لهذا التصنيف.</p>';
        return;
    }

    grid.innerHTML = filteredTrips.map(trip => generateTripCard(trip)).join('');
}

function generateTripCard(trip) {
    const imgs = trip.images && trip.images.length > 0 ? trip.images : (trip.image ? [trip.image] : []);
    const prices = trip.prices && trip.prices.length > 0 ? trip.prices : [{ label: 'السعر', value: trip.price }];

    if (cardImageIndexes[trip.id] === undefined) cardImageIndexes[trip.id] = 0;
    const currentIndex = cardImageIndexes[trip.id];
    const displayImg = imgs[currentIndex] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop';

    return `
        <div class="package-card" id="card-${trip.id}" onclick="location.href='/trip?id=${trip.id}&brand=${brand}'" style="cursor:pointer;">
            <div class="package-img">
                <img src="${displayImg}" class="main-img" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                ${trip.badge ? `<div class="package-badge">${trip.badge}</div>` : ''}
                ${imgs.length > 1 ? `
                    <button class="carousel-arrow prev" onclick="event.stopPropagation(); changeCardImage('${trip.id}', 1)">❮</button>
                    <button class="carousel-arrow next" onclick="event.stopPropagation(); changeCardImage('${trip.id}', -1)">❯</button>
                    <div class="img-counter" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 10px; font-size: 10px; color: white;">${currentIndex + 1} / ${imgs.length}</div>
                ` : ''}
            </div>
            <div class="package-content">
                <div class="package-category" style="font-size: 0.8rem; color: var(--primary-red); font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">${getCategoryLabel(trip.type)}</div>
                <h3 style="margin-bottom: 10px;">${trip.name}</h3>
                <div class="package-info" style="display: flex; gap: 15px; font-size: 0.8rem; color: #666; margin-bottom: 15px;">
                    <span><i class="fa fa-calendar-days"></i> ${trip.duration}</span>
                    <span><i class="fa ${brand === 'manama' ? 'fa-hotel' : 'fa-plane'}"></i> ${trip.transport}</span>
                </div>
                <div class="package-price-container">
                    ${prices.map(p => `
                        <div class="package-price-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span class="package-price-label" style="color: #888;">${p.label}</span>
                            <span class="package-price-value" style="font-weight: 800; color: var(--primary-red);">${p.value} <span>دينار</span></span>
                        </div>
                    `).join('')}
                </div>
                <div class="package-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="/trip?id=${trip.id}&brand=${brand}" class="btn-details" style="flex: 1; text-align: center; border: 1px solid #ddd; padding: 10px; border-radius: 8px; text-decoration: none; color: #333; font-size: 0.9rem;" onclick="event.stopPropagation()">التفاصيل</a>
                    <button class="btn-whatsapp" style="flex: 2; background: #25d366; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;" onclick="event.stopPropagation(); bookViaWhatsapp('${trip.name}', '${trip.id}')">
                        <i class="fa-brands fa-whatsapp"></i> احجز واتساب
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.changeCardImage = (tripId, delta) => {
    const trip = allTrips.find(t => t.id.toString() === tripId.toString());
    if (!trip) return;
    const imgs = trip.images || [];
    let newIndex = (cardImageIndexes[tripId] || 0) + delta;
    if (newIndex >= imgs.length) newIndex = 0;
    if (newIndex < 0) newIndex = imgs.length - 1;
    cardImageIndexes[tripId] = newIndex;
    const card = document.getElementById(`card-${tripId}`);
    if (card) {
        card.querySelector('.main-img').src = imgs[newIndex];
        const counter = card.querySelector('div[style*="font-size: 10px"]');
        if (counter) counter.innerText = `${newIndex + 1} / ${imgs.length}`;
    }
};

window.bookViaWhatsapp = (name, id) => {
    const phone = brand === 'iticket' ? '97317550054' : '97313313100';
    const text = `السلام عليكم، أرغب في الاستفسار عن ${name} (ID: ${id})`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};

// Start
initApp();
