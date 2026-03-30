// Header Scroll Effect
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle Logic
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('mobile-active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });
}

// Section Switching Logic
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');

function showSection(id) {
    sections.forEach(section => section.classList.remove('active-section'));
    navLinks.forEach(link => link.classList.remove('active-link'));

    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }

    if (mainNav) mainNav.classList.remove('mobile-active');
    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
    }

    const activeLink = document.querySelector(`nav a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add('active-link');

    if (id !== 'home') header.classList.add('scrolled');
    else header.classList.remove('scrolled');
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            const id = href.substring(1);
            e.preventDefault();
            showSection(id);
            window.scrollTo(0, 0);
        }
    });
});

// --- Data & API ---
const brand = window.BRAND || 'iticket'; // القيمة الافتراضية
const API_URL = `/api/${brand}/trips`;
let allTrips = [];
let filteredTrips = [];
let activeCategory = 'all';
let cardImageIndexes = {};

async function fetchTrips() {
    try {
        const response = await fetch(API_URL);
        allTrips = await response.json() || [];
        filteredTrips = allTrips;
        renderFilterBar();
        renderMainTrips();
    } catch (error) {
        console.error("API Error:", error);
    }
}

function renderFilterBar() {
    const filterBar = document.getElementById('category-filter-bar');
    if (!filterBar) return;

    // الحصول على كل التصنيفات الفريدة
    let categories = [];
    if (brand === 'manama') {
        categories = ['all', 'hotel_resort', 'chalet_pool'];
    } else {
        categories = ['all', ...new Set(allTrips.map(t => t.category).filter(c => c && c.trim() !== ''))];
    }

    filterBar.innerHTML = categories.map(cat => {
        let label = cat;
        if (cat === 'all') label = 'عرض الكل';
        else if (cat === 'hotel_resort') label = 'فنادق ومنتجعات';
        else if (cat === 'chalet_pool') label = 'شاليهات واستراحات';
        
        return `
            <div class="category-chip ${activeCategory === cat ? 'active' : ''}" 
                 onclick="filterByCategory('${cat}')">
                ${label}
            </div>
        `;
    }).join('');
}

window.filterByCategory = (category) => {
    activeCategory = category;
    if (category === 'all') {
        filteredTrips = allTrips;
    } else {
        if (brand === 'manama') {
            filteredTrips = allTrips.filter(t => t.type === category);
        } else {
            filteredTrips = allTrips.filter(t => t.category === category);
        }
    }
    renderFilterBar();
    renderMainTrips();
};

function renderMainTrips() {
    const grid = document.getElementById('main-package-grid');
    if (!grid) return;

    if (filteredTrips.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">عذراً، لا توجد رحلات لهذه الوجهة حالياً.</p>';
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

    const hasMultiImages = imgs.length > 1;

    return `
        <div class="package-card" id="card-${trip.id}" onclick="location.href='/trip?id=${trip.id}&brand=${brand}'" style="cursor: pointer;">
            <div class="package-img">
                <img src="${displayImg}" class="main-img" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                ${trip.badge ? `<div class="package-badge">${trip.badge}</div>` : ''}
                
                ${hasMultiImages ? `
                    <button class="carousel-arrow prev" onclick="event.stopPropagation(); changeCardImage('${trip.id}', 1)">❮</button>
                    <button class="carousel-arrow next" onclick="event.stopPropagation(); changeCardImage('${trip.id}', -1)">❯</button>
                    <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 10px; font-size: 10px; color: white;"> ${currentIndex + 1} / ${imgs.length} </div>
                ` : ''}
            </div>
            <div class="package-content">
                <div style="font-size: 0.8rem; color: var(--primary-red); font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">
                    ${brand === 'manama' ? (trip.type === 'hotel_resort' ? 'فندق ومنتجع' : 'شاليه واستراحة') : (trip.category || 'عام')}
                </div>
                <h3 style="margin-bottom: 15px;">${trip.name}</h3>
                <div class="package-info">
                    <span><i class="fa fa-calendar-days"></i> ${trip.duration}</span>
                    <span><i class="fa fa-plane"></i> ${trip.transport}</span>
                </div>
                
                <div class="package-price-container">
                    ${prices.map(p => `
                        <div class="package-price-row">
                            <span class="package-price-label">${p.label}</span>
                            <span class="package-price-value">${p.value} <span>دينار</span></span>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="/trip?id=${trip.id}&brand=${brand}" class="book-btn" onclick="event.stopPropagation()" style="background: var(--card-bg); border: 1px solid var(--primary-red); color: white; flex: 1; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                        <i class="fa fa-eye"></i> التفاصيل
                    </a>
                    <button class="book-btn" onclick="event.stopPropagation(); bookViaWhatsapp('${trip.name}', '${trip.id}')" style="flex: 2;">
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

    const imgs = trip.images && trip.images.length > 0 ? trip.images : (trip.image ? [trip.image] : []);
    if (imgs.length <= 1) return;

    let newIndex = (cardImageIndexes[tripId] || 0) + delta;
    if (newIndex >= imgs.length) newIndex = 0;
    if (newIndex < 0) newIndex = imgs.length - 1;

    cardImageIndexes[tripId] = newIndex;

    const card = document.getElementById(`card-${tripId}`);
    if (card) {
        const img = card.querySelector('.main-img');
        const counter = card.querySelector('div[style*="font-size: 10px"]');
        if (img) img.src = imgs[newIndex];
        if (counter) counter.innerText = `${newIndex + 1} / ${imgs.length}`;
    }
};

// Search Logic
const searchBtn = document.getElementById('search-btn-hero');
const searchInput = document.getElementById('trip-search-input');
const typeSelect = document.getElementById('trip-type-select');
const resultsContainer = document.getElementById('search-results-home');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = (searchInput.value || "").trim().toLowerCase();
        const selectedType = typeSelect.value;

        if (searchTerm === "" && selectedType === "") {
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
            }
            showSection('packages');
            return;
        }

        const filtered = allTrips.filter(trip => {
            const matchesSearch = trip.name.toLowerCase().includes(searchTerm);
            let matchesType = !selectedType;
            
            if (selectedType === 'hotel_resort') {
                matchesType = trip.type === 'hotel' || trip.type === 'resort';
            } else if (selectedType === 'chalet_pool') {
                matchesType = trip.type === 'chalet' || trip.type === 'pool' || trip.type === 'resort_pool'; // تعميم بسيط
            } else if (selectedType) {
                matchesType = trip.type === selectedType;
            }
            
            return matchesSearch && matchesType;
        });

        if (resultsContainer) {
            if (filtered.length > 0) {
                resultsContainer.innerHTML = filtered.map(trip => generateTripCard(trip)).join('');
                resultsContainer.style.display = 'grid';
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert('عذراً، لا توجد رحلات تطابق بحثك حالياً.');
                resultsContainer.style.display = 'none';
            }
        }
    });
}

// Global Booking
window.bookViaWhatsapp = (packageName, tripId) => {
    const tripUrl = tripId ? `${window.location.origin}/trip?id=${tripId}&brand=${brand}` : '';
    const phone = brand === 'manama' ? '97313313100' : '97317550054';
    const brandName = brand === 'manama' ? 'Manama Holidays' : 'i Ticket';
    const message = `أهلاً "${brandName}"، أرغب في الاستفسار عن وحجز: ${packageName}${tripUrl ? `\nرابط التفاصيل: ${tripUrl}` : ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

// Start
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    fetchTrips();
});
