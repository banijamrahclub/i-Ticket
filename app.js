// Header Scroll Effect
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Section Switching Logic
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');

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

// Update showSection to close mobile menu
function showSection(id) {
    sections.forEach(section => section.classList.remove('active-section'));
    navLinks.forEach(link => link.classList.remove('active-link'));

    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }

    // Close mobile menu if open
    if (mainNav) mainNav.classList.remove('mobile-active');
    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
    }

    // Highlight active link in Nav
    const activeLink = document.querySelector(`nav a[href="#${id}"]`);
    if (activeLink) {
        activeLink.classList.add('active-link');
    }

    // Header fix for internal pages
    if (id !== 'home') {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
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

// Set default section
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});

// --- Configuration ---
// يوسف: بمجرد الحصول على الرابط من SheetDB، ضعه هنا بين القوسين
const SHEETDB_URL = "YOUR_SHEETDB_API_URL";

// Backup/Default Data
const defaultTrips = [
    { id: 101, name: 'إسطنبول الساحرة - صيف 2024', type: 'tourism', price: 350, duration: '8 أيام', transport: 'طيران الخليج', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2071&auto=format&fit=crop', badge: 'الأكثر مبيعاً' },
    { id: 102, name: 'باكو وقبلة - طبيعة أذربيجان', type: 'tourism', price: 290, duration: '7 أيام', transport: 'شامل الفنادق', image: 'https://images.unsplash.com/photo-1528643501235-9856d8facfa4?q=80&w=1974&auto=format&fit=crop', badge: 'خصم 10%' },
    { id: 103, name: 'عمرة شهر رمضان المبارك', type: 'religious', price: 120, duration: '10 أيام', transport: 'باصات VIP', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 104, name: 'بوكيت - شواطئ تايلاند', type: 'tourism', price: 420, duration: '9 أيام', transport: 'شامل الجولات', image: 'https://images.unsplash.com/photo-1589394815844-d4f13459526b?q=80&w=2076&auto=format&fit=crop', badge: 'صيف 2024' },
    { id: 105, name: 'زيارة كربلاء المقدسة - الأربعين', type: 'religious', price: 180, duration: '12 يوم', transport: 'طيران + سكن', image: 'https://images.unsplash.com/photo-1628131349581-22949646b158?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' }
    // ... باقي الرحلات موجودة في الذاكرة
];

let allTrips = [];

// Fetch Data from Google Sheets
async function fetchTrips() {
    try {
        if (SHEETDB_URL.includes("YOUR_")) {
            console.log("Using default trips until API is set");
            allTrips = defaultTrips;
            renderMainTrips();
            return;
        }
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        allTrips = data.length > 0 ? data : defaultTrips;
        renderMainTrips();
    } catch (error) {
        console.error("Error fetching trips:", error);
        allTrips = defaultTrips;
        renderMainTrips();
    }
}

function renderMainTrips() {
    if (!packageGrid) return;

    if (allTrips.length === 0) {
        packageGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">جاري التحميل...</p>';
        return;
    }

    packageGrid.innerHTML = allTrips.map(trip => `
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

// Initial Load
fetchTrips();

// Global Booking Function
window.bookViaWhatsapp = (packageName) => {
    const message = `أهلاً "i Ticket للسفر"، أرغب في الاستفسار عن وحجز: ${packageName}`;
    const whatsappUrl = `https://wa.me/97317550054?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};

// Update Search Logic to work with Dynamic elements
const searchBtn = document.getElementById('search-btn-hero');
const searchInput = document.getElementById('trip-search-input');
const typeSelect = document.getElementById('trip-type-select');
const resultsContainer = document.getElementById('search-results-home');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedType = typeSelect.value;
        const trips = getTrips();
        let foundAny = false;

        // NEW: If search is empty, go to the packages page instead of showing results here
        if (searchTerm === "" && selectedType === "") {
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
            }
            showSection('packages');
            return;
        }

        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }

        trips.forEach(trip => {
            const matchesSearch = trip.name.toLowerCase().includes(searchTerm);
            const matchesType = selectedType === "" ||
                (selectedType === "religious" && trip.type === "religious") ||
                (selectedType === "tourism" && trip.type === "tourism");

            if (matchesSearch && matchesType) {
                const cardHtml = `
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
                `;
                if (resultsContainer) {
                    resultsContainer.innerHTML += cardHtml;
                }
                foundAny = true;
            }
        });

        if (foundAny) {
            if (resultsContainer) {
                resultsContainer.style.display = 'grid';
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            alert('عذراً، لا توجد رحلات تطابق بحثك حالياً.');
        }
    });
}

// Listen for updates from Admin Panel
window.addEventListener('storage', renderMainTrips);

// Initial Render
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    renderMainTrips();
});
