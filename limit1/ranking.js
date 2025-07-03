/**
 * ランキングを表示し、管理するためのスクリプト
 */

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
        let htmlContent = `${entry.name} (${entry.date}) - ポイント: ${entry.point}, 体力: ${entry.stamina}, 時間: ${entry.time}`;
        if (entry.cards && entry.cards.length > 0) {
            htmlContent += `<br>使用カード: [${entry.cards.join(', ')}]`;
        }
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