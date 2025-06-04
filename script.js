// グローバル変数
let cardCounter = 2; // 初期カードが2つあるため
let listCounter = 3; // 初期リストが3つあるため
let boardCounter = 1; // 初期ボードが1つあるため
let draggedElement = null;
let draggedList = null;

// DOMContentLoadedイベント
document.addEventListener('DOMContentLoaded', function() {
    // ボード追加ボタンのイベントリスナー
    document.getElementById('addBoardBtn').addEventListener('click', addBoard);
    
    // 設定ボタンのイベントリスナー
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    
    // 設定ダイアログのイベントリスナー
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('dataClearBtn').addEventListener('click', showDataClearConfirm);
    
    // 確認ダイアログのイベントリスナー
    document.getElementById('cancelBtn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmBtn').addEventListener('click', handleConfirmAction);
    
    // モーダルオーバーレイクリックで閉じる
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });
    
    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeConfirmModal();
        }
    });
    
    // 初期化時にローカルストレージからデータを読み込み
    loadFromLocalStorage();
    
    // 初期状態でもイベントリスナーを設定
    attachEventListeners();
});

// ローカルストレージにデータを保存
function saveToLocalStorage() {
    const boardContainer = document.getElementById('boardContainer');
    localStorage.setItem('trelloApp', boardContainer.innerHTML);
    localStorage.setItem('cardCounter', cardCounter);
    localStorage.setItem('listCounter', listCounter);
    localStorage.setItem('boardCounter', boardCounter);
}

// ローカルストレージからデータを読み込み
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('trelloApp');
    const savedCardCounter = localStorage.getItem('cardCounter');
    const savedListCounter = localStorage.getItem('listCounter');
    const savedBoardCounter = localStorage.getItem('boardCounter');
    
    if (savedData) {
        document.getElementById('boardContainer').innerHTML = savedData;
        cardCounter = parseInt(savedCardCounter) || 2;
        listCounter = parseInt(savedListCounter) || 3;
        boardCounter = parseInt(savedBoardCounter) || 1;
        
        // イベントリスナーを再設定
        attachEventListeners();
    }
}

// イベントリスナーを再設定
function attachEventListeners() {
    // すべてのカードにドラッグイベントを設定
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('dragstart', function(e) {
            drag(e);
        });
        // ドラッグ終了時のイベントリスナーも設定
        card.addEventListener('dragend', function(e) {
            e.target.classList.remove('dragging');
            draggedElement = null;
        });
    });
    
    // すべてのカードコンテナにドロップイベントを設定
    const cardContainers = document.querySelectorAll('.cards-container');
    cardContainers.forEach(container => {
        container.addEventListener('drop', function(e) {
            drop(e);
        });
        container.addEventListener('dragover', function(e) {
            allowDrop(e);
        });
    });
    
    // すべてのリストにドラッグイベントを設定
    const lists = document.querySelectorAll('.list');
    lists.forEach(list => {
        list.addEventListener('dragstart', function(e) {
            dragList(e);
        });
        list.addEventListener('dragend', function(e) {
            endDragList(e);
        });
    });
    
    // すべてのリストコンテナにドロップイベントを設定
    const listsContainers = document.querySelectorAll('.lists-container');
    listsContainers.forEach(container => {
        container.addEventListener('drop', function(e) {
            dropList(e);
        });
        container.addEventListener('dragover', function(e) {
            allowDropList(e);
        });
    });
}

// カードを追加
function addCard(listId) {
    cardCounter++;
    const newCardId = `card-${cardCounter}`;
    
    const cardHtml = `
        <div class="card" draggable="true" ondragstart="drag(event)" id="${newCardId}">
            <div class="card-content" contenteditable="true" data-placeholder="新しいタスク"></div>
            <button class="delete-card-btn" onclick="deleteCard('${newCardId}')">×</button>
        </div>
    `;
    
    const list = document.getElementById(listId);
    const cardsContainer = list.querySelector('.cards-container');
    cardsContainer.insertAdjacentHTML('beforeend', cardHtml);
    
    // 新しく追加されたカードにフォーカスを当てる
    const newCard = document.getElementById(newCardId);
    const cardContent = newCard.querySelector('.card-content');
    cardContent.focus();
    
    saveToLocalStorage();
}

// カードを削除
function deleteCard(cardId) {
    if (confirm('このカードを削除しますか？')) {
        const card = document.getElementById(cardId);
        card.remove();
        saveToLocalStorage();
    }
}

// リストを追加
function addList(boardId) {
    listCounter++;
    const newListId = `list-${listCounter}`;
    
    const listHtml = `
        <div class="list" id="${newListId}" data-board="${boardId}" draggable="true" ondragstart="dragList(event)" ondragend="endDragList(event)">
            <div class="list-header">
                <div class="list-drag-handle">⋮⋮</div>
                <h3 class="list-title" contenteditable="true">新しいリスト</h3>
                <button class="delete-list-btn" onclick="deleteList('${newListId}')">×</button>
            </div>
            <div class="cards-container" ondrop="drop(event)" ondragover="allowDrop(event)">
            </div>
            <button class="add-card-btn" onclick="addCard('${newListId}')">+ カードを追加</button>
        </div>
    `;
    
    const board = document.getElementById(boardId);
    const listsContainer = board.querySelector('.lists-container');
    const addListContainer = listsContainer.querySelector('.add-list-container');
    
    // 新しいリストを追加ボタンの前に挿入
    addListContainer.insertAdjacentHTML('beforebegin', listHtml);
    
    // 新しく追加されたリストのタイトルを選択状態にする
    const newList = document.getElementById(newListId);
    const listTitle = newList.querySelector('.list-title');
    listTitle.focus();
    
    // contenteditable要素の場合は、テキストを全選択
    const range = document.createRange();
    range.selectNodeContents(listTitle);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // 新しく追加されたリストにドラッグイベントリスナーを設定
    newList.addEventListener('dragstart', function(e) {
        dragList(e);
    });
    newList.addEventListener('dragend', function(e) {
        endDragList(e);
    });
    
    // 新しく追加されたカードコンテナにドロップイベントリスナーを設定
    const cardsContainer = newList.querySelector('.cards-container');
    cardsContainer.addEventListener('drop', function(e) {
        drop(e);
    });
    cardsContainer.addEventListener('dragover', function(e) {
        allowDrop(e);
    });
    
    saveToLocalStorage();
}

// リストを削除
function deleteList(listId) {
    const list = document.getElementById(listId);
    const cards = list.querySelectorAll('.card');
    
    if (cards.length > 0) {
        if (!confirm('このリストにはカードが含まれています。本当に削除しますか？')) {
            return;
        }
    }
    
    list.remove();
    saveToLocalStorage();
}

// ボードを追加
function addBoard() {
    boardCounter++;
    const newBoardId = `board-${boardCounter}`;
    
    const boardHtml = `
        <div class="board" id="${newBoardId}">
            <div class="board-header">
                <h2 class="board-title" contenteditable="true">新しいボード</h2>
                <button class="delete-board-btn" onclick="deleteBoard('${newBoardId}')">×</button>
            </div>
            <div class="lists-container" ondrop="dropList(event)" ondragover="allowDropList(event)">
                <div class="add-list-container">
                    <button class="add-list-btn" onclick="addList('${newBoardId}')">+ リストを追加</button>
                </div>
            </div>
        </div>
    `;
    
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.insertAdjacentHTML('beforeend', boardHtml);
    
    // 新しく追加されたボードのタイトルを選択状態にする
    const newBoard = document.getElementById(newBoardId);
    const boardTitle = newBoard.querySelector('.board-title');
    boardTitle.focus();
    boardTitle.select();
    
    saveToLocalStorage();
}

// ボードを削除
function deleteBoard(boardId) {
    const board = document.getElementById(boardId);
    const lists = board.querySelectorAll('.list');
    
    if (lists.length > 0) {
        if (!confirm('このボードにはリストが含まれています。本当に削除しますか？')) {
            return;
        }
    }
    
    board.remove();
    saveToLocalStorage();
}

// ドラッグ開始
function drag(event) {
    draggedElement = event.target;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    
    // ドラッグ終了時に必ずdraggingクラスを削除するイベントリスナーを追加
    event.target.addEventListener('dragend', function() {
        event.target.classList.remove('dragging');
        draggedElement = null;
    }, { once: true });
}

// ドラッグ許可
function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // ドラッグオーバー時の視覚的フィードバック
    const cardsContainer = event.currentTarget;
    cardsContainer.classList.add('drag-over');
    
    // マウスが離れた時にクラスを削除
    cardsContainer.addEventListener('dragleave', function(e) {
        if (!cardsContainer.contains(e.relatedTarget)) {
            cardsContainer.classList.remove('drag-over');
        }
    });
}

// ドロップ
function drop(event) {
    event.preventDefault();
    const cardsContainer = event.currentTarget;
    cardsContainer.classList.remove('drag-over');
    
    if (draggedElement) {
        // ドロップ位置を計算
        const afterElement = getDragAfterElement(cardsContainer, event.clientY);
        
        if (afterElement == null) {
            cardsContainer.appendChild(draggedElement);
        } else {
            cardsContainer.insertBefore(draggedElement, afterElement);
        }
        
        // ドラッグ中のクラスを削除
        draggedElement.classList.remove('dragging');
        draggedElement = null;
        
        saveToLocalStorage();
    }
}

// ドロップ位置を決定する関数
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 編集可能要素のイベントハンドリング
document.addEventListener('click', function(event) {
    if (event.target.contentEditable === 'true') {
        let isComposing = false;
        
        // IME composition events
        event.target.addEventListener('compositionstart', function() {
            isComposing = true;
        });
        
        event.target.addEventListener('compositionend', function() {
            isComposing = false;
            saveToLocalStorage();
        });
        
        event.target.addEventListener('input', function() {
            if (!isComposing) {
                saveToLocalStorage();
            }
        });
        
        event.target.addEventListener('blur', saveToLocalStorage);
        event.target.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !isComposing) {
                e.target.blur();
            }
        });
    }
});

// ページ離脱時にデータを保存
window.addEventListener('beforeunload', saveToLocalStorage);

// キーボードショートカット
document.addEventListener('keydown', function(event) {
    // Ctrl+Z または Cmd+Z で元に戻す（簡易実装）
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        // 簡易的な実装のため、ページをリロードして最後に保存された状態に戻す
        if (confirm('最後に保存された状態に戻しますか？')) {
            location.reload();
        }
    }
});

// データをJSONでエクスポート
function exportData() {
    const data = {
        boards: document.getElementById('boardContainer').innerHTML,
        counters: {
            card: cardCounter,
            list: listCounter,
            board: boardCounter
        },
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trello-app-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// データをJSONからインポート
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('現在のデータを上書きしますか？')) {
                document.getElementById('boardContainer').innerHTML = data.boards;
                cardCounter = data.counters.card;
                listCounter = data.counters.list;
                boardCounter = data.counters.board;
                
                attachEventListeners();
                saveToLocalStorage();
                
                alert('データのインポートが完了しました。');
            }
        } catch (error) {
            alert('無効なファイル形式です。');
        }
    };
    reader.readAsText(file);
}

// 検索機能
function searchCards(query) {
    const cards = document.querySelectorAll('.card');
    const searchTerm = query.toLowerCase();
    
    cards.forEach(card => {
        const content = card.querySelector('.card-content').textContent.toLowerCase();
        if (content.includes(searchTerm)) {
            card.style.border = '2px solid #ff6b6b';
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            card.style.border = '';
        }
    });
}

// クリア検索
function clearSearch() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.border = '';
    });
}

// リストドラッグ開始時の座標を記録
let listDragStartX = 0;
let listDragStartY = 0;

// リストドラッグ開始
function dragList(event) {
    console.log('dragList called', event.target, event.currentTarget);
    
    // マウスの座標を記録
    listDragStartX = event.clientX;
    listDragStartY = event.clientY;
    
    // ドラッグハンドルを探す
    const dragHandle = event.currentTarget.querySelector('.list-drag-handle');
    if (!dragHandle) {
        console.log('No drag handle found');
        event.preventDefault();
        return;
    }
    
    // ドラッグハンドルの領域をチェック
    const handleRect = dragHandle.getBoundingClientRect();
    const isInHandleArea = event.clientX >= handleRect.left && 
                          event.clientX <= handleRect.right && 
                          event.clientY >= handleRect.top && 
                          event.clientY <= handleRect.bottom;
    
    console.log('Mouse position:', {x: event.clientX, y: event.clientY});
    console.log('Handle area:', handleRect);
    console.log('isInHandleArea:', isInHandleArea);
    
    // ハンドルエリア外からのドラッグは無効
    if (!isInHandleArea) {
        console.log('Drag prevented: not in handle area');
        event.preventDefault();
        return;
    }
    
    // contenteditable要素やボタンからのドラッグも念のためチェック
    if (event.target.contentEditable === 'true' || 
        event.target.closest('[contenteditable="true"]') ||
        event.target.classList.contains('delete-list-btn') ||
        event.target.closest('.delete-list-btn')) {
        console.log('Drag prevented: from interactive element');
        event.preventDefault();
        return;
    }
    
    console.log('Drag started successfully');
    draggedList = event.currentTarget;
    event.currentTarget.classList.add('list-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.currentTarget.outerHTML);
    event.dataTransfer.setData('text/plain', event.currentTarget.id);
}

// リストドラッグ終了
function endDragList(event) {
    event.currentTarget.classList.remove('list-dragging');
    draggedList = null;
}

// リストドロップ許可
function allowDropList(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const listsContainer = event.currentTarget;
    listsContainer.classList.add('list-drag-over');
    
    listsContainer.addEventListener('dragleave', function(e) {
        if (!listsContainer.contains(e.relatedTarget)) {
            listsContainer.classList.remove('list-drag-over');
        }
    });
}

// リストドロップ
function dropList(event) {
    event.preventDefault();
    const listsContainer = event.currentTarget;
    listsContainer.classList.remove('list-drag-over');
    
    if (draggedList && draggedList.classList.contains('list')) {
        // ドロップ位置を計算
        const afterElement = getListDragAfterElement(listsContainer, event.clientX);
        
        if (afterElement == null) {
            // 最後の位置（add-list-containerの前）に挿入
            const addListContainer = listsContainer.querySelector('.add-list-container');
            listsContainer.insertBefore(draggedList, addListContainer);
        } else {
            listsContainer.insertBefore(draggedList, afterElement);
        }
        
        draggedList.classList.remove('list-dragging');
        draggedList = null;
        
        saveToLocalStorage();
    }
}

// リストドロップ位置を決定する関数（水平方向）
function getListDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.list:not(.list-dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 設定モーダル関連の機能
let currentConfirmAction = null;

// 設定ダイアログを開く
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('show');
}

// 設定ダイアログを閉じる
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// 確認ダイアログを開く
function openConfirmModal(message, action) {
    document.getElementById('confirmMessage').textContent = message;
    currentConfirmAction = action;
    document.getElementById('confirmModal').classList.add('show');
}

// 確認ダイアログを閉じる
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    currentConfirmAction = null;
}

// データクリア確認を表示
function showDataClearConfirm() {
    openConfirmModal(
        '全てのデータを削除して初期状態に戻します。この操作は元に戻せません。続行しますか？',
        'clearData'
    );
}

// 確認アクションを処理
function handleConfirmAction() {
    if (currentConfirmAction === 'clearData') {
        clearAllData();
    }
    closeConfirmModal();
}

// 全データをクリアして初期状態に戻す
function clearAllData() {
    // LocalStorageをクリア
    localStorage.removeItem('trelloApp');
    localStorage.removeItem('cardCounter');
    localStorage.removeItem('listCounter');
    localStorage.removeItem('boardCounter');
    
    // カウンターをリセット
    cardCounter = 2;
    listCounter = 3;
    boardCounter = 1;
    
    // デフォルトのHTML構造を設定
    const defaultHtml = `
        <div class="board" id="board-1">
            <div class="board-header">
                <h2 class="board-title" contenteditable="true">マイボード</h2>
                <button class="delete-board-btn" onclick="deleteBoard('board-1')">×</button>
            </div>
            <div class="lists-container" ondrop="dropList(event)" ondragover="allowDropList(event)">
                <!-- To Do リスト -->
                <div class="list" id="list-1" data-board="board-1" draggable="true" ondragstart="dragList(event)" ondragend="endDragList(event)">
                    <div class="list-header">
                        <div class="list-drag-handle">⋮⋮</div>
                        <h3 class="list-title" contenteditable="true">To Do</h3>
                        <button class="delete-list-btn" onclick="deleteList('list-1')">×</button>
                    </div>
                    <div class="cards-container" ondrop="drop(event)" ondragover="allowDrop(event)">
                        <!-- サンプルカード -->
                        <div class="card" draggable="true" ondragstart="drag(event)" id="card-1">
                            <div class="card-content" contenteditable="true">サンプルタスク1</div>
                            <button class="delete-card-btn" onclick="deleteCard('card-1')">×</button>
                        </div>
                    </div>
                    <button class="add-card-btn" onclick="addCard('list-1')">+ カードを追加</button>
                </div>

                <!-- In Progress リスト -->
                <div class="list" id="list-2" data-board="board-1" draggable="true" ondragstart="dragList(event)" ondragend="endDragList(event)">
                    <div class="list-header">
                        <div class="list-drag-handle">⋮⋮</div>
                        <h3 class="list-title" contenteditable="true">In Progress</h3>
                        <button class="delete-list-btn" onclick="deleteList('list-2')">×</button>
                    </div>
                    <div class="cards-container" ondrop="drop(event)" ondragover="allowDrop(event)">
                        <div class="card" draggable="true" ondragstart="drag(event)" id="card-2">
                            <div class="card-content" contenteditable="true">サンプルタスク2</div>
                            <button class="delete-card-btn" onclick="deleteCard('card-2')">×</button>
                        </div>
                    </div>
                    <button class="add-card-btn" onclick="addCard('list-2')">+ カードを追加</button>
                </div>

                <!-- Done リスト -->
                <div class="list" id="list-3" data-board="board-1" draggable="true" ondragstart="dragList(event)" ondragend="endDragList(event)">
                    <div class="list-header">
                        <div class="list-drag-handle">⋮⋮</div>
                        <h3 class="list-title" contenteditable="true">Done</h3>
                        <button class="delete-list-btn" onclick="deleteList('list-3')">×</button>
                    </div>
                    <div class="cards-container" ondrop="drop(event)" ondragover="allowDrop(event)">
                    </div>
                    <button class="add-card-btn" onclick="addCard('list-3')">+ カードを追加</button>
                </div>

                <!-- 新しいリストを追加ボタン -->
                <div class="add-list-container">
                    <button class="add-list-btn" onclick="addList('board-1')">+ リストを追加</button>
                </div>
            </div>
        </div>
    `;
    
    // ボードコンテナに初期状態を設定
    document.getElementById('boardContainer').innerHTML = defaultHtml;
    
    // イベントリスナーを再設定
    attachEventListeners();
    
    // LocalStorageに保存
    saveToLocalStorage();
    
    // 設定ダイアログを閉じる
    closeSettingsModal();
    
    // 成功メッセージを表示
    alert('データがクリアされ、初期状態に戻りました。');
}