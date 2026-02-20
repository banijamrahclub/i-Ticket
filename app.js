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
const API_URL = "/api/trips";
const packageGrid = document.getElementById('main-package-grid');
let allTrips = [];

const defaultTrips = [
    { id: 101, name: 'إسطنبول الساحرة - صيف 2024', type: 'tourism', price: 350, duration: '8 أيام', transport: 'طيران الخليج', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2071&auto=format&fit=crop', badge: 'الأكثر مبيعاً' },
    { id: 102, name: 'باكو وقبلة - طبيعة أذربيجان', type: 'tourism', price: 290, duration: '7 أيام', transport: 'شامل الفنادق', image: 'https://images.unsplash.com/photo-1528643501235-9856d8facfa4?q=80&w=1974&auto=format&fit=crop', badge: 'خصم 10%' },
    { id: 103, name: 'عمرة شهر رمضان المبارك', type: 'religious', price: 120, duration: '10 أيام', transport: 'باصات VIP', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 104, name: 'بوكيت - شواطئ تايلاند', type: 'tourism', price: 420, duration: '9 أيام', transport: 'شامل الجولات', image: 'https://images.unsplash.com/photo-1589394815844-d4f13459526b?q=80&w=2076&auto=format&fit=crop', badge: 'صيف 2024' },
    { id: 105, name: 'زيارة كربلاء المقدسة - الأربعين', type: 'religious', price: 180, duration: '12 يوم', transport: 'طيران + سكن', image: 'https://images.unsplash.com/photo-1628131349581-22949646b158?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 106, name: 'سراييفو - جمال البوسنة', type: 'tourism', price: 480, duration: '10 أيام', transport: 'طيران مباشر', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1974&auto=format&fit=crop', badge: 'طبيعة' },
    { id: 107, name: 'ماليزيا - كوالالمبور ولنكاوي', type: 'tourism', price: 390, duration: '8 أيام', transport: 'فنادق 4 نجوم', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop', badge: '' },
    { id: 108, name: 'جورجيا - تبليسي وباتومي', type: 'tourism', price: 310, duration: '7 أيام', transport: 'مرشد سياحي', image: 'https://images.unsplash.com/photo-1565008518242-20dc95116123?q=80&w=2071&auto=format&fit=crop', badge: 'عرض محدود' },
    { id: 109, name: 'المدينة المنورة - زيارة النبي (ص)', type: 'religious', price: 95, duration: '5 أيام', transport: 'باص حديث', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 110, name: 'دبي - تسوق وترفيه', type: 'tourism', price: 250, duration: '4 أيام', transport: 'طيران الإمارات', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop', badge: 'قريب جداً' },
    { id: 111, name: 'المالديف - منتجع فاخر', type: 'tourism', price: 850, duration: '6 أيام', transport: 'إقامة شاملة', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1965&auto=format&fit=crop', badge: 'VIP' },
    { id: 112, name: 'مشهد المقدسة - الإمام الرضا (ع)', type: 'religious', price: 220, duration: '8 أيام', transport: 'طيران + سكن', image: 'https://images.unsplash.com/photo-1599581102925-50e5040e34b9?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 113, name: 'شرم الشيخ - غوص وسباحة', type: 'tourism', price: 210, duration: '5 أيام', transport: 'فنادق 5 نجوم', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1974&auto=format&fit=crop', badge: 'موسم الشتاء' },
    { id: 114, name: 'باريس - مدينة الأضواء', type: 'tourism', price: 590, duration: '7 أيام', transport: 'طيران فرنسي', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop', badge: 'رومانسي' },
    { id: 115, name: 'لندن - جولة ضبابية', type: 'tourism', price: 620, duration: '7 أيام', transport: 'بريطانيا ترافل', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop', badge: '' },
    { id: 116, name: 'النجف الأشرف - ضيافة حيدرية', type: 'religious', price: 140, duration: '7 أيام', transport: 'باصات حديثة', image: 'https://images.unsplash.com/photo-1628131349581-22949646b158?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 117, name: 'روما - رحلة التاريخ', type: 'tourism', price: 540, duration: '6 أيام', transport: 'بيتزا تورز', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop', badge: 'ثقافة' },
    { id: 118, name: 'كابادوكيا - مدينة المناطيد', type: 'tourism', price: 380, duration: '5 أيام', transport: 'تصوير احترافي', image: 'https://images.unsplash.com/photo-1558230559-00965492cc2e?q=80&w=2070&auto=format&fit=crop', badge: 'مطلوب جداً' },
    { id: 119, name: 'القدس - رحلة الأقصى', type: 'religious', price: 0, duration: 'قريباً', transport: '-', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop', badge: 'قريبا بإذن الله' },
    { id: 120, name: 'سويسرا - جبال الألب', type: 'tourism', price: 920, duration: '10 أيام', transport: 'طيران فاخر', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop', badge: 'فخامة' },
    { id: 121, name: 'القاهرة - الأهرامات والنيل', type: 'tourism', price: 230, duration: '6 أيام', transport: 'مصر للطيران', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2070&auto=format&fit=crop', badge: 'تاريخي' },
    { id: 122, name: 'بالي - جنة إندونيسيا', type: 'tourism', price: 470, duration: '9 أيام', transport: 'منتجعات شاطئية', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2076&auto=format&fit=crop', badge: 'استرخاء' },
    { id: 123, name: 'رحلة قم المقدسة - زيارة السيدة', type: 'religious', price: 130, duration: '6 أيام', transport: 'باص VIP', image: 'https://images.unsplash.com/photo-1560086701-d00735bfa95f?q=80&w=1932&auto=format&fit=crop', badge: 'دينية' },
    { id: 124, name: 'النمسا - زيارة فيينا', type: 'tourism', price: 560, duration: '7 أيام', transport: 'طيران مباشر', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2072&auto=format&fit=crop', badge: '' },
    { id: 125, name: 'اليونان - صيف سانتوريني', type: 'tourism', price: 680, duration: '7 أيام', transport: 'فنادق إطلالة', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2070&auto=format&fit=crop', badge: 'شهر عسل' },
    { id: 126, name: 'موسكو - الساحة الحمراء', type: 'tourism', price: 410, duration: '8 أيام', transport: 'فنادق روسية', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop', badge: 'شتاء روسي' },
    { id: 127, name: 'سنغافورة - جولة عصرية', type: 'tourism', price: 530, duration: '6 أيام', transport: 'طيران راقي', image: 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?q=80&w=1974&auto=format&fit=crop', badge: '' },
    { id: 128, name: 'الأردن - البتراء ووادي رم', type: 'tourism', price: 270, duration: '5 أيام', transport: 'رحلة برية', image: 'https://images.unsplash.com/photo-1547228224-34042858544d?q=80&w=1964&auto=format&fit=crop', badge: 'مغامرة' },
    { id: 129, name: 'عمان - صلالة الخضراء', type: 'tourism', price: 190, duration: '5 أيام', transport: 'باصات مريحة', image: 'https://images.unsplash.com/photo-1578918942944-79354924c8c7?q=80&w=2070&auto=format&fit=crop', badge: 'خريف صلالة' },
    { id: 130, name: 'شيراز - جنة إيران', type: 'tourism', price: 210, duration: '7 أيام', transport: 'طيران + سياحة', image: 'https://images.unsplash.com/photo-1566373721348-7357c9197931?q=80&w=2070&auto=format&fit=crop', badge: 'طبيعة' }
];

async function fetchTrips() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data || data.length === 0) {
            allTrips = defaultTrips;
            // Seed defaults to server
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(defaultTrips)
            });
        } else {
            allTrips = data;
        }
    } catch (error) {
        console.error("API Error:", error);
        allTrips = defaultTrips;
    }
    renderMainTrips();
}

function renderMainTrips() {
    const grid = document.getElementById('main-package-grid');
    if (!grid) return;

    if (allTrips.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">جاري التحميل...</p>';
        return;
    }

    grid.innerHTML = allTrips.map(trip => `
        <div class="package-card">
            <div class="package-img">
                <img src="${trip.image}" alt="${trip.name}" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                ${trip.badge ? `<div class="package-badge">${trip.badge}</div>` : ''}
            </div>
            <div class="package-content">
                <h3>${trip.name}</h3>
                <div class="package-info">
                    <span><i class="fa fa-calendar-days"></i> ${trip.duration}</span>
                    <span><i class="fa fa-plane"></i> ${trip.transport}</span>
                </div>
                <div class="package-price">${trip.price} <span>دينار</span></div>
                <button class="book-btn" onclick="bookViaWhatsapp('${trip.name}')">
                    <i class="fa-brands fa-whatsapp"></i> احجز الآن عبر واتساب
                </button>
            </div>
        </div>
    `).join('');
}

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
            const matchesType = !selectedType || trip.type === selectedType;
            return matchesSearch && matchesType;
        });

        if (resultsContainer) {
            if (filtered.length > 0) {
                resultsContainer.innerHTML = filtered.map(trip => `
                    <div class="package-card">
                        <div class="package-img">
                            <img src="${trip.image}" alt="${trip.name}" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                            ${trip.badge ? `<div class="package-badge">${trip.badge}</div>` : ''}
                        </div>
                        <div class="package-content">
                            <h3>${trip.name}</h3>
                            <div class="package-info">
                                <span><i class="fa fa-calendar-days"></i> ${trip.duration}</span>
                                <span><i class="fa fa-plane"></i> ${trip.transport}</span>
                            </div>
                            <div class="package-price">${trip.price} <span>دينار</span></div>
                            <button class="book-btn" onclick="bookViaWhatsapp('${trip.name}')">
                                <i class="fa-brands fa-whatsapp"></i> احجز الآن عبر واتساب
                            </button>
                        </div>
                    </div>
                `).join('');
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
window.bookViaWhatsapp = (packageName) => {
    const message = `أهلاً "i Ticket للسفر"، أرغب في الاستفسار عن وحجز: ${packageName}`;
    window.open(`https://wa.me/97317550054?text=${encodeURIComponent(message)}`, '_blank');
};

// Start
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    fetchTrips();
});
