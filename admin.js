// --- Global Database Configuration (Zero-Config) ---
const DB_URL = "https://kvdb.io/Mz7u4p9Y3oE8K1S9V2B5T6/trips_data";

let allTrips = [];

// Fetch Data
async function fetchTrips() {
    try {
        const response = await fetch(DB_URL);
        if (response.ok) {
            allTrips = await response.json();
            renderTrips();
        }
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

// Save Data (Global Sync)
async function saveAllToCloud(trips) {
    try {
        await fetch(DB_URL, {
            method: 'POST',
            body: JSON.stringify(trips)
        });
        allTrips = trips;
        renderTrips();
    } catch (error) {
        alert("خطأ في حفظ البيانات سحابياً");
    }
}

// UI Elements
const tripsList = document.getElementById('trips-list');
const tripModal = document.getElementById('trip-modal');
const tripForm = document.getElementById('trip-form');
const openAddModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = document.getElementById('close-modal');

// Render Table
function renderTrips() {
    if (!tripsList) return;
    tripsList.innerHTML = allTrips.map((trip, index) => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${trip.image}" class="trip-img-mini" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                    <span>${trip.name}</span>
                </div>
            </td>
            <td>${trip.type === 'religious' ? 'دينية' : 'سياحية'}</td>
            <td>${trip.price} دينار</td>
            <td>${trip.duration}</td>
            <td>
                <div class="actions">
                    <i class="fa fa-edit btn-edit" onclick="editTrip(${index})"></i>
                    <i class="fa fa-trash btn-delete" onclick="deleteTrip(${index})"></i>
                </div>
            </td>
        </tr>
    `).join('');
}

// Delete Trip
window.deleteTrip = async (index) => {
    if (confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
        const updated = [...allTrips];
        updated.splice(index, 1);
        await saveAllToCloud(updated);
    }
}

// Form Submission (Add/Edit)
tripForm.onsubmit = async (e) => {
    e.preventDefault();
    const index = document.getElementById('trip-id').value;
    const isEdit = index !== "";

    const tripData = {
        id: isEdit ? allTrips[index].id : Date.now().toString(),
        name: document.getElementById('trip-name').value,
        type: document.getElementById('trip-type').value,
        price: document.getElementById('trip-price').value,
        duration: document.getElementById('trip-duration').value,
        transport: document.getElementById('trip-transport').value,
        image: document.getElementById('trip-image').value,
        badge: document.getElementById('trip-badge').value
    };

    const updated = [...allTrips];
    if (isEdit) updated[index] = tripData;
    else updated.push(tripData);

    await saveAllToCloud(updated);
    tripModal.style.display = 'none';
};

// Open Modals
openAddModalBtn.onclick = () => {
    tripForm.reset();
    document.getElementById('trip-id').value = '';
    document.getElementById('modal-title').innerText = 'إضافة رحلة جديدة';
    document.getElementById('image-preview').style.display = 'none';
    tripModal.style.display = 'flex';
}

closeModalBtn.onclick = () => { tripModal.style.display = 'none'; }

// Live Image Preview
document.getElementById('trip-image').addEventListener('input', function (e) {
    const preview = document.getElementById('image-preview');
    if (e.target.value) { preview.src = e.target.value; preview.style.display = 'block'; }
    else { preview.style.display = 'none'; }
});

// Edit Trip Setup
window.editTrip = (index) => {
    const trip = allTrips[index];
    if (trip) {
        document.getElementById('trip-id').value = index;
        document.getElementById('trip-name').value = trip.name;
        document.getElementById('trip-type').value = trip.type;
        document.getElementById('trip-price').value = trip.price;
        document.getElementById('trip-duration').value = trip.duration;
        document.getElementById('trip-transport').value = trip.transport;
        document.getElementById('trip-image').value = trip.image;
        document.getElementById('trip-badge').value = trip.badge;
        const preview = document.getElementById('image-preview');
        preview.src = trip.image;
        preview.style.display = 'block';
        document.getElementById('modal-title').innerText = 'تعديل بيانات الرحلة';
        tripModal.style.display = 'flex';
    }
}

// Initial Load
fetchTrips();
