const cardsInfo = {
    1: { point: 0, stamina: 10, time: 0 },//集中
    2: { point: 0, stamina: 10, time: 15 },//好調
    3: { point: 0, stamina: 20, time: 10 },//瞑想
    4: { point: 10, stamina: 10, time: 10 },//勉強
    5: { point: 35, stamina: 50, time: 20 },//狩り
    6: { point: 15, stamina: -40, time: 20 },//食事
    7: { point: 50, stamina: 30, time: 45 },//社会貢献
    8: { point: 0, stamina: -20, time: 10 },//仮眠
    9: { point: 100, stamina: 100, time: 100 },//トレーニング
    10: { point: 20, stamina: 15, time: 10 },//採集
    11: { point: 10, stamina: 5, time: 5 },//探索
    12: { point: 80, stamina: 100, time: 5 },//全力ダッシュ
};
const ALL_CARDS = Object.keys(cardsInfo).map(Number);
let cardOrder = [];

// ▼▼▼ ここからが変更箇所 ▼▼▼
// 最適解のパターンを定義
const OPTIMAL_SOLUTION = [1, 3, 5, 6, 4, 7, 10, 11];
// ▲▲▲ ここまでが変更箇所 ▲▲▲


// ストップウォッチ機能
let timerInterval;
let totalSeconds = 300;
let isTimerRunning = false;

function startStopwatch() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    const stopwatchEl = document.getElementById('stopwatch');

    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            alert("5分が経過しました！");
            stopwatchEl.textContent = "時間切れ";
            return;
        }
        totalSeconds--;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        stopwatchEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function resetStopwatch() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    totalSeconds = 300;
    const stopwatchEl = document.getElementById('stopwatch');
    if (stopwatchEl) {
        stopwatchEl.textContent = "5:00";
    }
}


function addCard() {
    const input = document.getElementById('cardInput');
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = "";

    const cardStrings = input.value.split(',');
    const cardsToAdd = [];

    for (const str of cardStrings) {
        const val = parseInt(str.trim(), 10);
        if (isNaN(val) || val < 1 || val > 12) {
            errorMsg.textContent = `無効な入力 "${str.trim()}" が含まれています。`;
            return;
        }
        cardsToAdd.push(val);
    }

    if (new Set(cardsToAdd).size !== cardsToAdd.length) {
        errorMsg.textContent = "一度に同じカードを複数枚追加することはできません。";
        return;
    }

    for (const val of cardsToAdd) {
        if (cardOrder.includes(val)) {
            errorMsg.textContent = `カード ${val} は既に使用済みです。`;
            return;
        }
    }

    for (const val of cardsToAdd) {
        if (val === 6) {
            const lastCard = cardOrder.length > 0 ? cardOrder[cardOrder.length - 1] : null;
            if (lastCard !== 5) {
                errorMsg.textContent = "カード6はカード5の直後にしか使えません。";
                updateCardList();
                updateLiveResult();
                return;
            }
        }
        cardOrder.push(val);
    }

    updateCardList();
    updateLiveResult();
    input.value = "";
}

function removeLastCard() {
    const errorMsg = document.getElementById('errorMsg');
    if (cardOrder.length === 0) {
        errorMsg.textContent = "削除できるカードがありません";
        return;
    }
    cardOrder.pop();
    errorMsg.textContent = "";
    updateCardList();
    updateLiveResult();
}

function resetAll() {
    cardOrder = [];
    updateCardList();
    document.getElementById('cardInput').value = "";
    document.getElementById('userName').value = "";
    document.getElementById('result').textContent = "";
    document.getElementById('errorMsg').textContent = "";
    document.getElementById('suggestionSection').style.display = 'none';
    updateLiveResult();
    resetStopwatch();
}

function calculateTotal(order) {
    let totalPoint = 0;
    let totalStamina = 0;
    let totalTime = 0;

    order.forEach((num, index) => {
        const card = cardsInfo[num];
        if (card) {
            let point = card.point;
            let stamina = card.stamina;
            let time = card.time;
            const prev = index > 0 ? order[index - 1] : null;
            const prev3 = order.slice(Math.max(0, index - 3), index);
            if (prev === 1) point += 10;
            if (prev === 3) point *= 2;
            if (prev === 4) time = Math.floor(time / 2);
            if (prev3.includes(2)) point = Math.floor(point * 1.2);

            totalPoint += point;
            totalStamina += stamina;
            totalTime += time;
        }
    });
    return { point: totalPoint, stamina: totalStamina, time: totalTime };
}

function updateLiveResult() {
    const liveResultEl = document.getElementById('liveResult');
    const baseStamina = 100;
    const baseTime = 100;

    if (cardOrder.length === 0) {
        liveResultEl.textContent = `ポイント: 0 / 残り体力: ${baseStamina} / 残り時間: ${baseTime}`;
        liveResultEl.style.color = 'blue';
        return;
    }

    const spent = calculateTotal(cardOrder);
    let remainingStamina = baseStamina - spent.stamina;
    let remainingTime = baseTime - spent.time;

    let resultText = `ポイント: ${spent.point} / 残り体力: ${remainingStamina} / 残り時間: ${remainingTime}`;
    liveResultEl.style.color = 'blue';

    if (remainingStamina < 0 || remainingTime < 0) {
        resultText += " [制約条件違反！]";
        liveResultEl.style.color = 'red';
    }
    liveResultEl.textContent = resultText;
}

function finishInput() {
    const errorMsg = document.getElementById('errorMsg');
    const resultEl = document.getElementById('result');
    let name = document.getElementById('userName').value.trim();
    if (!name) {
        name = "名無し";
    }

    if (cardOrder.length === 0) {
        errorMsg.textContent = "最低1枚はカードを追加してください";
        return;
    }
    errorMsg.textContent = "";

    const baseStamina = 100;
    const baseTime = 100;
    const finalScore = calculateTotal(cardOrder);
    let finalPoint = finalScore.point;

    let remainingStamina = baseStamina - finalScore.stamina;
    let remainingTime = baseTime - finalScore.time;

    const resultCardsString = `使用したカード: [${cardOrder.join(', ')}]`;

    // ▼▼▼ ここからが変更箇所 ▼▼▼
    // プレイヤーのカードの並びが最適解と一致するかをチェック
    const isOptimal = JSON.stringify(cardOrder) === JSON.stringify(OPTIMAL_SOLUTION);

    if (remainingStamina < 0 || remainingTime < 0) {
        resultEl.innerHTML = `【${name}さんの結果】<br>${resultCardsString}<br>制約条件違反のため、ポイントは0になります。(残り体力: ${remainingStamina}, 残り時間: ${remainingTime})`;
        finalPoint = 0;
    } else {
        resultEl.innerHTML = `【${name}さんの結果】<br>${resultCardsString}<br>ポイント: ${finalPoint} / 残り体力: ${remainingStamina} / 残り時間: ${remainingTime}`;
        // 最適解だった場合、お祝いメッセージを追加
        if (isOptimal) {
            resultEl.innerHTML += `<br><br><strong style="color: #e67e22; font-size: 1.2em;">🎉 おめでとうございます！最適解を発見しました！ 🥳</strong>`;
        }
    }
    // ▲▲▲ ここまでが変更箇所 ▲▲▲


    saveResult(name, finalPoint, remainingStamina, remainingTime, [...cardOrder]);

    const suggestionSection = document.getElementById('suggestionSection');
    const suggestionText = document.getElementById('suggestionText');
    // 最適解でない場合のみ改善案を表示する
    if (!isOptimal) {
        const suggestion = findImprovedSolution([...cardOrder], finalPoint);
        if (suggestion) {
            suggestionText.innerHTML = `ちなみに、カードの順番を <strong>[${suggestion.order.join(', ')}]</strong> に変えると、<br>ポイントは <strong>${suggestion.score.point}</strong> になります！`;
            suggestionSection.style.display = 'block';
        } else {
            suggestionSection.style.display = 'none';
        }
    } else {
        suggestionSection.style.display = 'none'; // 最適解の場合は改善案を表示しない
    }


    cardOrder = [];
    updateCardList();
    updateLiveResult();
}

function findImprovedSolution(baseOrder, basePoint) {
    if (baseOrder.length === 0) return null;
    const baseStamina = 100;
    const baseTime = 100;

    for (let i = 0; i < 200; i++) {
        let neighborOrder = [...baseOrder];
        const action = Math.random();

        if (action < 0.5 && neighborOrder.length > 0) {
            const availableCards = ALL_CARDS.filter(card => !neighborOrder.includes(card));
            if (availableCards.length === 0) continue;

            const indexToChange = Math.floor(Math.random() * neighborOrder.length);
            const newCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            neighborOrder[indexToChange] = newCard;

        } else {
            if (neighborOrder.length > 1) {
                const index1 = Math.floor(Math.random() * neighborOrder.length);
                let index2 = Math.floor(Math.random() * neighborOrder.length);
                while (index1 === index2) {
                    index2 = Math.floor(Math.random() * neighborOrder.length);
                }
                [neighborOrder[index1], neighborOrder[index2]] = [neighborOrder[index2], neighborOrder[index1]];
            }
        }

        let isValid = true;
        for (let j = 1; j < neighborOrder.length; j++) {
            if (neighborOrder[j] === 6 && neighborOrder[j - 1] !== 5) {
                isValid = false;
                break;
            }
        }
        if (!isValid) continue;

        const neighborScore = calculateTotal(neighborOrder);
        let neighborStamina = baseStamina - neighborScore.stamina;
        let neighborTime = baseTime - neighborScore.time;

        if (neighborStamina >= 0 && neighborTime >= 0 && neighborScore.point > basePoint) {
            return { order: neighborOrder, score: { point: neighborScore.point, stamina: neighborStamina, time: neighborTime } };
        }
    }
    return null;
}

function updateCardList() {
    const list = document.getElementById('cardList');
    list.innerHTML = "";
    cardOrder.forEach((num, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}番目のカード: ${num}`;
        list.appendChild(li);
    });
}
function saveResult(name, totalPoint, totalStamina, totalTime, cards) {
    let ranking = JSON.parse(localStorage.getItem('cardRanking')) || [];
    ranking.push({
        name: name,
        date: new Date().toLocaleString(),
        point: totalPoint,
        stamina: totalStamina,
        time: totalTime,
        cards: cards
    });
    ranking.sort((a, b) => b.point - a.point);
    localStorage.setItem('cardRanking', JSON.stringify(ranking));
}