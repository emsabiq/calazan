const iframeA = document.getElementById("iframe-a");
const iframeB = document.getElementById("iframe-b");
const indonesiaRaya = document.getElementById("indonesia-raya");
const adzanAudio = document.getElementById("adzan-audio");

const slides = Array.from({ length: 8 }, (_, i) => document.getElementById(`slide${i + 1}`));
let currentIndex = 0;
let currentView = "iframe";

function toggleView() {
    requestAnimationFrame(() => {
        if (currentView === "iframe") {
            iframeA.classList.remove("visible");
            iframeB.classList.remove("visible");
            slides[currentIndex].classList.add("visible");
            currentView = "image";
        } else {
            slides[currentIndex].classList.remove("visible");
            currentIndex = (currentIndex + 1) % slides.length;
            iframeA.classList.add("visible"); // Hanya iframe-a yang ditampilkan
            currentView = "iframe";
        }
    });
}
setInterval(toggleView, 30000);

// Lagu Indonesia Raya pukul 09:59
function checkTimeAndPlayIndonesiaRaya() {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const lastPlayedDate = localStorage.getItem("lastPlayedIndonesia");

    if (now.getHours() === 9 && now.getMinutes() === 59 && lastPlayedDate !== today) {
        if (indonesiaRaya.paused) {
            indonesiaRaya.play().then(() => {
                localStorage.setItem("lastPlayedIndonesia", today);
                console.log("✅ Indonesia Raya diputar pukul 09:59");
            }).catch(err => console.warn("⚠️ Autoplay dicegah:", err));
        }
    }
}

// Adzan system
let jadwalSholat = {};
let lastPlayedKey = '';

function fetchJadwal() {
    const params = new URLSearchParams({
        latitude: 3.5952,
        longitude: 98.6722,
        method: 2
    });

    fetch(`https://api.aladhan.com/v1/timings?${params}`)
        .then(res => res.json())
        .then(data => {
            const timings = data.data.timings;

            jadwalSholat = {
                subuh: timings.Fajr.slice(0, 5),
                dzuhur: timings.Dhuhr.slice(0, 5),
                ashar: timings.Asr.slice(0, 5),
                maghrib: timings.Maghrib.slice(0, 5),
                isya: timings.Isha.slice(0, 5)
            };

            for (let key in jadwalSholat) {
                const el = document.getElementById(key);
                if (el) el.textContent = jadwalSholat[key];
            }

            console.log("✅ Jadwal sholat dimuat:", jadwalSholat);
        })
        .catch(err => console.error("❌ Gagal memuat jadwal:", err));
}

function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const currentTime = `${hours}:${minutes}:${seconds}`;
    document.getElementById("current-time").textContent = currentTime;

    const currentTimeCompare = `${hours}:${minutes}`;

    const today = new Date().toISOString().split("T")[0];

    for (let key in jadwalSholat) {
        if (jadwalSholat[key] === currentTimeCompare && lastPlayedKey !== today + key) {
            adzanAudio.play().then(() => {
                lastPlayedKey = today + key;
            }).catch(err => console.warn("⚠️ Gagal autoplay:", err));
        }
    }

    checkTimeAndPlayIndonesiaRaya();
}


document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        updateClock();
    }
});

fetchJadwal();
setInterval(updateClock, 1000);
