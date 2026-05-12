const axios = require('axios');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6Xn7MET1MkjxfsvotgqbSYQf5EURObS9M6q2kkp_sFUNS0bqMWLmAWOyjbLq7wYlOaA/exec';

async function getTripsFromSheet() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) return null;

    try {
        const response = await axios.get(APPS_SCRIPT_URL);
        // البيانات القادمة هي مصفوفة JSON مباشرة
        return response.data;
    } catch (error) {
        console.error('Error fetching from JSON Sheet:', error.message);
        return null;
    }
}

async function syncTripsToSheet(trips) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) return false;

    try {
        await axios.post(APPS_SCRIPT_URL, trips);
        return true;
    } catch (error) {
        console.error('Error syncing to JSON Sheet:', error.message);
        return false;
    }
}

module.exports = {
    getTripsFromSheet,
    syncTripsToSheet
};
