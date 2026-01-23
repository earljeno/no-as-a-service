import { db, getCurrentUser, onAuthChange } from "./firebase.js";
import { collection, query, where, getDocs, deleteDoc, addDoc, orderBy, doc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

onAuthChange(async user => {
    if (!user) return window.location.href = "auth.html";
    await loadHistory();
    await renderHistory();
});

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById('generate-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnContent = document.getElementById('btn-content');
    const outputText = document.getElementById('output-text');
    const historyModal = document.getElementById('history-modal');
    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');
    const historyCount = document.getElementById('history-count');
    const toast = document.getElementById('toast');

    let historyLog = [];
    window.handleCopy = handleCopy;

    generateBtn.addEventListener("click", handleDecline);

    async function handleDecline() {
        const user = getCurrentUser();
        if (!user) return;

        generateBtn.disabled = true;
        btnSpinner.classList.remove('hidden');
        btnContent.classList.add('opacity-0');
        outputText.style.opacity = '0.3';

        try {
            const res = await fetch("https://naas.isalman.dev/no");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();

            await addToHistory(data.reason);

            outputText.textContent = data.reason;
            outputText.classList.remove('text-gray-400', 'italic');
            outputText.classList.add('text-gray-800');
            outputText.style.opacity = '1';

            const container = document.getElementById('output-container');
            container.classList.remove('shake-active');
            void container.offsetWidth;
            container.classList.add('shake-active');
        } catch (err) {
            console.error(err);
        } finally {
            generateBtn.disabled = false;
            btnSpinner.classList.add('hidden');
            btnContent.classList.remove('opacity-0');
        }
    }

    async function addToHistory(text) {
        const user = getCurrentUser();
        if (!user) return;

        await addDoc(collection(db, "systemLogs"), {
            user: user.uid,
            generated: text,
            timestamp: Date.now()
        });

        historyLog.unshift({ text, timestamp: Date.now() });
        renderHistory();
        historyCount.innerText = historyLog.length;
        historyCount.classList.remove('hidden');
    }

    async function loadHistory() {
        const user = getCurrentUser();
        if (!user) return;

        const q = query(
            collection(db, "systemLogs"),
            where("user", "==", user.uid),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);
        historyLog = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            historyLog.push({
                text: data.generated,
                timestamp: data.timestamp
            });
        });

        renderHistory();
    }

    function renderHistory() {
        emptyHistory.classList.toggle('hidden', historyLog.length > 0);
        historyCount.innerText = historyLog.length;
        historyCount.classList.remove('hidden');

        historyList.querySelectorAll('li:not(#empty-history)').forEach(li => li.remove());

        historyLog.forEach(entry => {
            const li = document.createElement('li');
            li.className = "bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-indigo-200 transition-colors group relative";

            const date = new Date(entry.timestamp);
            const timeStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

            li.innerHTML = `
                <p class="text-sm text-gray-800 pr-8 italic">"${entry.text}"</p>
                <button onclick="handleCopy('${entry.text.replace(/'/g, "\\'")}')" class="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 bg-white rounded-md p-1.5 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy again">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                </button>
                <span class="text-xs text-gray-300 mt-2 block">${timeStr}</span>
            `;
            historyList.appendChild(li);
        });
    }

    function handleCopy(text) {
        if (!text || text.includes("Tap below")) return;
        navigator.clipboard.writeText(text).then(showToast);
    }

    function showToast() {
        toast.classList.remove('translate-y-[-150%]');
        setTimeout(() => toast.classList.add('translate-y-[-150%]'), 3000);
    }

    window.toggleHistory = () => {
        if (historyModal.classList.contains('hidden')) {
            historyModal.classList.remove('hidden');
            setTimeout(() => historyPanel.classList.remove('translate-x-full'), 10);
        } else {
            historyPanel.classList.add('translate-x-full');
            setTimeout(() => historyModal.classList.add('hidden'), 500);
        }
    };

    window.clearHistory = async () => {
        const user = getCurrentUser();
        if (!user) return;

        const q = query(collection(db, "systemLogs"), where("user", "==", user.uid));
        const snapshot = await getDocs(q);

        const deletions = snapshot.docs.map(d => deleteDoc(doc(db, "systemLogs", d.id)));
        await Promise.all(deletions);

        historyLog.length = 0;
        historyCount.innerText = "0";
        historyCount.classList.add("hidden");
        historyList.querySelectorAll("li:not(#empty-history)").forEach(li => li.remove());
        emptyHistory.classList.remove("hidden");
    };

});
