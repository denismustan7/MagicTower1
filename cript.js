// Konfiguration & Variablen
const colors = ['♠', '♣', '♥', '♦'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const valMap = { '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14 };

let score = 0;
let round = 1;
let timer;
let timeLeft;
let targetCard = null;
let deck = [];
let players = [
    { id: 1, name: "Du", score: 0, active: true },
    { id: 2, name: "Bot 1", score: 0, active: true },
    { id: 3, name: "Bot 2", score: 0, active: true },
    { id: 4, name: "Bot 3", score: 0, active: true }
];

// 1. Initialisierung
function initGame() {
    createDeck();
    setupRound();
}

function createDeck() {
    deck = [];
    colors.forEach(s => {
        values.forEach(v => {
            deck.push({ suit: s, val: v, color: (s==='♥'||s==='♦') ? 'red' : 'black' });
        });
    });
    deck = deck.sort(() => Math.random() - 0.5);
}

function setupRound() {
    document.getElementById('round-num').innerText = round;
    document.getElementById('tower-container').innerHTML = '';
    
    // Timer Logik
    timeLeft = round <= 5 ? 60 : 60 - (round - 5) * 5;
    startTimer();

    // Karten im Turm anordnen (Drei Pyramiden-Spitzen)
    let towerCards = deck.splice(0, 21);
    towerCards.forEach((c, i) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${c.color}`;
        cardEl.innerHTML = `${c.val}<br>${c.suit}`;
        cardEl.dataset.value = c.val;
        
        // Einfache Positionierung für "Tower" Look
        const row = Math.floor(i / 7);
        const col = i % 7;
        cardEl.style.left = (col * 80) + "px";
        cardEl.style.top = (row * 40) + "px";
        
        cardEl.onclick = () => tryPlayCard(cardEl, c);
        document.getElementById('tower-container').appendChild(cardEl);
    });

    // Start-Zielkarte
    drawNewTarget();
}

function drawNewTarget() {
    if (deck.length === 0) return;
    targetCard = deck.pop();
    const targetEl = document.getElementById('current-target-card');
    targetEl.innerHTML = `${targetCard.val}<br>${targetCard.suit}`;
    targetEl.className = `card ${targetCard.color}`;
}

function tryPlayCard(cardEl, cardData) {
    const v1 = valMap[cardData.val];
    const v2 = valMap[targetCard.val];

    // Magic Tower Regel: Abweichung genau 1 (Ass auf König oder 2)
    const diff = Math.abs(v1 - v2);
    if (diff === 1 || (v1 === 14 && v2 === 2) || (v1 === 2 && v2 === 14)) {
        targetCard = cardData;
        const targetEl = document.getElementById('current-target-card');
        targetEl.innerHTML = cardEl.innerHTML;
        targetEl.className = cardEl.className;
        cardEl.remove();
        
        score += 100 * round;
        document.getElementById('player-score').innerText = score;
        players[0].score = score;
        simulateOpponents();
    }
}

function startTimer() {
    clearInterval(timer);
    const bar = document.getElementById('timer-bar');
    const startLife = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        const percent = (timeLeft / startLife) * 100;
        bar.style.width = percent + "%";
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextRound();
        }
    }, 1000);
}

function simulateOpponents() {
    // Simuliert Punkte für die anderen 3 Spieler
    players.forEach(p => {
        if (p.id !== 1 && p.active) {
            p.score += Math.floor(Math.random() * 80 * round);
            const slot = document.getElementById(`opp-${p.id}`);
            if (slot) slot.querySelector('.mini-score').innerText = p.score;
        }
    });
}

function nextRound() {
    // Ausscheidungslogik
    if (round >= 6) {
        let activeOnes = players.filter(p => p.active);
        activeOnes.sort((a, b) => a.score - b.score);
        
        // Den schlechtesten eliminieren
        let loser = activeOnes[0];
        loser.active = false;
        
        if (loser.id === 1) {
            alert("Du bist raus!");
            showRanking();
            return;
        } else {
            const slot = document.getElementById(`opp-${loser.id}`);
            slot.classList.add('eliminated');
            slot.querySelector('.opp-status').innerText = "💀 AUS";
        }
    }

    if (round < 8) {
        round++;
        createDeck();
        setupRound();
    } else {
        showRanking();
    }
}

function showRanking() {
    document.getElementById('rank-overlay').classList.remove('hidden');
    const list = document.getElementById('rank-list');
    players.sort((a, b) => b.score - a.score);
    
    players.forEach((p, i) => {
        const li = document.createElement('li');
        li.innerText = `${i+1}. ${p.name} - ${p.score} Pkt`;
        list.appendChild(li);
    });
}

document.getElementById('draw-pile').onclick = drawNewTarget;
initGame();
