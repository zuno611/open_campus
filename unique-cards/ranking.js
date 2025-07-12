/**
 * ランキングを表示し、管理するためのスクリプト
 */

// ▼▼▼ ここからが変更箇所 ▼▼▼
// カード番号とカード名の対応表を定義
const CARD_NAMES = {
    1: "集中",
    2: "好調",
    3: "瞑想",
    4: "勉強",
    5: "狩り",
    6: "食事",
    7: "社会貢献",
    8: "仮眠",
    9: "トレーニング",
    10: "採集",
    11: "探索",
    12: "全力ダッシュ"
};
// ▲▲▲ ここまでが変更箇所 ▲▲▲

// ランキングを表示する関数
function displayRanking() {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = ""; // 表示を一旦空にする

    // localStorageからデータを取得
    const rankingData = JSON.parse(localStorage.getItem('cardRanking')) || [];

    if (rankingData.length === 0) {
        rankingList.innerHTML = "<li>まだデータがありません。</li>";
        return;
    }

    rankingData.forEach(entry => {
        const li = document.createElement('li');
        let htmlContent = `${entry.name} (${entry.date}) - ポイント: ${entry.point}, 残り体力: ${entry.stamina}, 残り時間: ${entry.time}`;

        // ▼▼▼ ここからが変更箇所 ▼▼▼
        // カード番号の配列をカード名の配列に変換して表示
        if (entry.cards && entry.cards.length > 0) {
            const cardNames = entry.cards.map(id => CARD_NAMES[id] || `不明(${id})`);
            htmlContent += `<br>使用カード: [${cardNames.join(', ')}]`;
        }
        // ▲▲▲ ここまでが変更箇所 ▲▲▲

        li.innerHTML = htmlContent;
        rankingList.appendChild(li);
    });
}

// ランキングをリセットする関数
function clearRanking() {
    // 確認ダイアログを表示
    if (confirm("本当にランキングをすべてリセットしますか？この操作は元に戻せません。")) {
        localStorage.removeItem('cardRanking');
        // 表示を更新
        displayRanking();
        alert("ランキングをリセットしました。");
    }
}

// ページが読み込まれたらランキングを表示
window.onload = () => {
    displayRanking();
};