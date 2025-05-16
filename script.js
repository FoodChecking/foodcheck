document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택
    const productNameInput = document.getElementById('productName');
    const quantityInput = document.getElementById('quantity');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const mainFavoritesButton = document.getElementById('favoritesButton');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const locationInput = document.getElementById('locationInput');
    const setLocationButton = document.getElementById('setLocationButton');
    const currentLocationDisplay = document.getElementById('currentLocationDisplay');
    const externalSearchLinksContainer = document.getElementById('externalSearchLinksContainer');
    const localSalesButton = document.getElementById('localSalesButton');

    // 가격 알림 모달 관련 요소
    const priceAlertModal = document.getElementById('priceAlertModal');
    const closePriceAlertModalButton = document.getElementById('closePriceAlertModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const desiredPriceInput = document.getElementById('desiredPriceInput');
    const saveDesiredPriceButton = document.getElementById('saveDesiredPriceButton');

    // 알림 아이콘 및 팝업 관련 요소
    const notificationBellIcon = document.getElementById('notificationBellIcon');
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationList = document.getElementById('notificationList');
    const clearNotificationsButton = document.getElementById('clearNotificationsButton');
    // const notificationBadge = document.getElementById('notificationBadge'); // 추후 사용

    // 데이터 및 상태 변수
    const sampleKeywords = ["햇반", "햇반 흑미밥", "신라면", "짜파게티", "삼다수", "우유 1L", "계란 30구", "케찹"];
    let favorites = JSON.parse(localStorage.getItem('foodCheckFavorites')) || [];
    let userLocation = localStorage.getItem('foodCheckUserLocation') || "미설정";
    let currentItemForPriceAlert = null;
    let currentFavButtonForPriceAlert = null;
    let notifications = JSON.parse(localStorage.getItem('foodCheckNotifications')) || [];


    // --- 유틸리티 함수 ---
    function updateMainFavoritesButtonText() {
        mainFavoritesButton.textContent = `⭐ 내 즐겨찾기 상품 (${favorites.length})`;
    }
    function updateUserLocationDisplay() {
        currentLocationDisplay.textContent = userLocation;
    }
    function showResultsPlaceholder(message) {
        resultsContainer.innerHTML = `<p class="results-placeholder">${message}</p>`;
    }

    function renderNotifications() {
        notificationList.innerHTML = ''; // 기존 알림 비우기
        if (notifications.length === 0) {
            const noNotif = document.createElement('li');
            noNotif.textContent = "새 알림이 없습니다.";
            noNotif.style.textAlign = "center";
            noNotif.style.color = "#888";
            notificationList.appendChild(noNotif);
        } else {
            // 최신 알림이 위로 오도록 역순으로 표시 (이미 저장 시 prepend 하고 있으므로 그대로 순회해도 됨)
            // notifications.slice().reverse().forEach(notifText => {
            notifications.forEach(notifText => { // 저장된 순서대로 (최신이 위)
                const listItem = document.createElement('li');
                listItem.textContent = notifText;
                notificationList.appendChild(listItem);
            });
        }
        // updateNotificationBadge(); // 추후 뱃지 업데이트
    }
    
    function addNotification(message) {
        notifications.unshift(message); // 새 알림을 배열 맨 앞에 추가
        if (notifications.length > 10) { // 최대 알림 개수 제한 (예: 10개)
            notifications.pop(); // 가장 오래된 알림 제거
        }
        localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications));
        renderNotifications(); // 알림 목록 다시 그리기
        // updateNotificationBadge(true); // 새 알림 있음을 표시
    }

    // function updateNotificationBadge(newNotification = false) { // 추후 사용
    //     const unreadCount = notifications.filter(n => !n.read).length; // 'read' 속성 추가 필요
    //     if (unreadCount > 0) {
    //         notificationBadge.textContent = unreadCount;
    //         notificationBadge.style.display = 'inline-block';
    //     } else {
    //         notificationBadge.style.display = 'none';
    //     }
    // }


    // --- 초기화 ---
    updateUserLocationDisplay();
    updateMainFavoritesButtonText();
    renderNotifications(); // 페이지 로드 시 저장된 알림 표시


    // --- 이벤트 리스너 ---
    notificationBellIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // 이벤트 버블링 중단
        notificationPopup.style.display = notificationPopup.style.display === 'block' ? 'none' : 'block';
        // if (notificationPopup.style.display === 'block') {
        //     // 팝업 열릴 때 뱃지 카운트 초기화 또는 '읽음' 처리 로직 (추후)
        //     // notifications.forEach(n => n.read = true); updateNotificationBadge();
        // }
    });

    clearNotificationsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (confirm("모든 알림을 지우시겠습니까?")) {
            notifications = [];
            localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications));
            renderNotifications();
        }
    });

    // 팝업 외부 클릭 시 팝업 닫기
    document.addEventListener('click', function(event) {
        if (notificationPopup.style.display === 'block' && 
            !notificationBellContainer.contains(event.target)) {
            notificationPopup.style.display = 'none';
        }
        // 연관검색어 닫기 로직 (기존)
        if (suggestionsContainer && suggestionsContainer.style.display === 'block' &&
            !productNameInput.contains(event.target) && 
            !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });


    setLocationButton.addEventListener('click', () => { /* 이전과 동일 */ 
        const newLocation = locationInput.value.trim();
        if (newLocation) {
            userLocation = newLocation;
            localStorage.setItem('foodCheckUserLocation', userLocation);
            updateUserLocationDisplay();
            alert(`동네가 '${userLocation}'(으)로 설정되었습니다.`);
            locationInput.value = '';
            externalSearchLinksContainer.innerHTML = '';
            showResultsPlaceholder('새로운 동네가 설정되었습니다. 상품을 검색해보세요.');
        } else {
            alert('동네를 입력해주세요.');
        }
    });
    productNameInput.addEventListener('input', () => { /* 이전과 동일 */ 
        const query = productNameInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        if (query.length < 1) { suggestionsContainer.style.display = 'none'; return; }
        const filteredKeywords = sampleKeywords.filter(keyword => keyword.toLowerCase().includes(query));
        if (filteredKeywords.length > 0) {
            suggestionsContainer.style.display = 'block';
            filteredKeywords.forEach(keyword => {
                const div = document.createElement('div');
                div.textContent = keyword;
                div.classList.add('suggestion-item');
                div.addEventListener('click', () => {
                    productNameInput.value = keyword;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsContainer.appendChild(div);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    searchButton.addEventListener('click', () => { /* 이전과 동일 */
        const productName = productNameInput.value.trim();
        const quantity = quantityInput.value.trim();
        if (!productName || !quantity) { alert('상품명과 수량을 모두 입력해주세요.'); return; }
        if (parseInt(quantity) < 1) { alert('수량은 1 이상이어야 합니다.'); quantityInput.value = '1'; return; }
        showResultsPlaceholder("결과를 불러오는 중입니다...");
        displayExternalSearchLinks(productName);
        console.log(`검색: 상품명='${productName}', 수량=${quantity}, 동네=${userLocation}`);
        setTimeout(() => {
            try { fetchLocalMartResults(productName, parseInt(quantity), userLocation); }
            catch (error) { console.error("Error in fetchLocalMartResults execution:", error); showResultsPlaceholder("오류가 발생하여 검색 결과를 가져오지 못했습니다.");}
        }, 500);
    });
    mainFavoritesButton.addEventListener('click', () => { /* 이전과 동일 */
        externalSearchLinksContainer.innerHTML = '';
        displayFavoritesList();
    });
    localSalesButton.addEventListener('click', () => { /* 이전과 동일 */
        externalSearchLinksContainer.innerHTML = '';
        displayLocalSales();
    });

    closePriceAlertModalButton.addEventListener('click', () => { /* 이전과 동일 */
        priceAlertModal.style.display = 'none';
        currentItemForPriceAlert = null; 
        currentFavButtonForPriceAlert = null;
    });
    window.addEventListener('click', (event) => { /* 모달 외부 클릭 시 닫기 로직은 document로 이동 */
        if (event.target == priceAlertModal) {
            priceAlertModal.style.display = 'none';
            currentItemForPriceAlert = null;
            currentFavButtonForPriceAlert = null;
        }
    });

    saveDesiredPriceButton.addEventListener('click', () => { /* 이전과 동일, addNotification 메시지 수정 */
        const desiredPrice = parseFloat(desiredPriceInput.value);
        if (isNaN(desiredPrice) || desiredPrice <= 0) {
            alert('유효한 원하는 가격을 입력해주세요.');
            return;
        }
        if (currentItemForPriceAlert && currentFavButtonForPriceAlert) {
            const itemData = currentItemForPriceAlert;
            const buttonEl = currentFavButtonForPriceAlert;
            const favId = itemData.id + '_' + (itemData.quantity || 1);
            const favDataObject = {
                favId: favId, platformId: itemData.id, name: itemData.name, 
                quantity: itemData.quantity || 1, platform: itemData.platform, 
                url: itemData.url, price: itemData.price, category: itemData.category,
                onSale: itemData.onSale, salePrice: itemData.salePrice,
                unitPrice: itemData.unitPrice, martLocation: itemData.martLocation,
                desiredPrice: desiredPrice, alertActive: true, 
                addedDate: new Date().toISOString()
            };
            const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);
            if (favoriteIndex === -1) { favorites.push(favDataObject); }
            else { favorites[favoriteIndex] = { ...favorites[favoriteIndex], ...favDataObject }; }
            localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
            updateMainFavoritesButtonText();
            buttonEl.textContent = '⭐';
            buttonEl.title = '즐겨찾기에서 제거 / 알림 수정';
            const displayItemName = itemData.originalItemName || itemData.name.split(' (')[0].trim();
            addNotification(`'${displayItemName}' 가격 알림: ${desiredPrice.toLocaleString()}원 이하 설정`);
            priceAlertModal.style.display = 'none';
            currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;
            desiredPriceInput.value = '';
        }
    });
    
    // --- 핵심 로직 함수 ---
    function handleFavoriteClick(itemData, buttonEl) { /* 이전과 동일 */
        console.log("handleFavoriteClick called for item:", itemData.name);
        const favId = itemData.id + '_' + (itemData.quantity || 1);
        const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);
        if (favoriteIndex === -1) { 
            currentItemForPriceAlert = itemData; currentFavButtonForPriceAlert = buttonEl;
            modalProductName.textContent = itemData.originalItemName || itemData.name.split(' (')[0].trim();
            modalCurrentPrice.textContent = `${Number(itemData.price).toLocaleString()}원 (수량: ${itemData.quantity || 1}개)`;
            desiredPriceInput.value = ''; 
            const currentItemPrice = Number(itemData.price) / (itemData.quantity || 1); // 개당 현재가
            const suggestedPrice = Math.floor(currentItemPrice * 0.9 / 100) * 100 * (itemData.quantity || 1); // 현재 총 가격의 90%를 100원 단위로 내림
            desiredPriceInput.placeholder = `예: ${suggestedPrice > 0 ? suggestedPrice.toLocaleString() : (itemData.price / 2).toLocaleString() }`;
            priceAlertModal.style.display = 'block';
            desiredPriceInput.focus();
        } else { 
            const removedItem = favorites[favoriteIndex];
            const removedItemName = removedItem.originalItemName || removedItem.name.split(' (')[0];
            favorites.splice(favoriteIndex, 1);
            localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
            updateMainFavoritesButtonText();
            buttonEl.textContent = '☆';
            buttonEl.title = '즐겨찾기 및 가격 알림 설정';
            addNotification(`'${removedItemName}' 즐겨찾기 및 알림 해제`);
        }
    }
    function displayExternalSearchLinks(searchTerm) { /* 이전과 동일 */ 
        externalSearchLinksContainer.innerHTML = ''; if (!searchTerm) return;
        const coupangBtn = document.createElement('a'); coupangBtn.href = `https://www.coupang.com/np/search?q=${encodeURIComponent(searchTerm)}`;
        coupangBtn.textContent = `📦 ${searchTerm} (쿠팡에서 보기)`; coupangBtn.target = '_blank'; coupangBtn.classList.add('external-link-button', 'coupang');
        const naverBtn = document.createElement('a'); naverBtn.href = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(searchTerm)}`;
        naverBtn.textContent = `🛍️ ${searchTerm} (네이버쇼핑에서 보기)`; naverBtn.target = '_blank'; naverBtn.classList.add('external-link-button', 'naver');
        externalSearchLinksContainer.appendChild(coupangBtn); externalSearchLinksContainer.appendChild(naverBtn);
    }
    function fetchLocalMartResults(productName, quantity, location) { /* 이전과 동일 */ 
        console.log("fetchLocalMartResults started. productName:", productName, "quantity:", quantity, "location:", location);
        try {
            const baseProductName = productName.toLowerCase();
            const martIdForConsumer = "myLocalMart123";
            const consumerLocalStorageKey = `foodCheckMartProducts_${martIdForConsumer}`;
            const registeredMartProducts = JSON.parse(localStorage.getItem(consumerLocalStorageKey)) || [];
            console.log("Registered mart products from localStorage:", registeredMartProducts);
            let filteredMartProducts = registeredMartProducts.filter(p => p.name && p.name.toLowerCase().includes(baseProductName));
            console.log("After name filter, mart products:", filteredMartProducts);
            if (location && location !== "미설정") {
                const currentLocLower = location.toLowerCase();
                filteredMartProducts = filteredMartProducts.filter(p => {
                    const itemMartLocationLower = p.martLocation ? p.martLocation.toLowerCase() : "";
                    if (!itemMartLocationLower) return false;
                    return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
                });
            }
            console.log("After location filter, mart products:", filteredMartProducts);
            let processedResults = [];
            filteredMartProducts.forEach(item => {
                const itemUnitPrice = Number(item.price) || 0;
                let unitPriceToUse = (item.onSale && typeof item.salePrice === 'number') ? Number(item.salePrice) : itemUnitPrice;
                let itemTotalPriceBeforeDiscount = unitPriceToUse * quantity;
                let itemTotalPrice = itemTotalPriceBeforeDiscount;
                let discountAppliedInfo = "";
                if (typeof item.discountUnit === 'number' && item.discountUnit > 0 && typeof item.discountAmount === 'number' && item.discountAmount > 0 && quantity >= item.discountUnit) {
                    const numberOfDiscountApplications = Math.floor(quantity / item.discountUnit);
                    const totalDiscount = numberOfDiscountApplications * item.discountAmount;
                    itemTotalPrice -= totalDiscount;
                    discountAppliedInfo = ` (${numberOfDiscountApplications * item.discountUnit}개 구매 시 ${totalDiscount.toLocaleString()}원 할인 적용)`;
                }
                let effectiveUnitPrice = quantity > 0 ? itemTotalPrice / quantity : 0;
                let currentDeliveryFee = 0; let deliveryFeeText = "배달 지원 안함"; let finalEta = item.eta || (item.deliveryAvailable ? '오늘배송가능 (마트별 확인)' : '매장픽업');
                if (item.deliveryAvailable) {
                    currentDeliveryFee = Number(item.deliveryFee) || 0;
                    const minOrderAmount = Number(item.minOrderForFreeDelivery) || 0;
                    if (minOrderAmount > 0 && itemTotalPrice >= minOrderAmount) { currentDeliveryFee = 0; }
                    deliveryFeeText = currentDeliveryFee === 0 ? "무료배송" : `배송비 ${currentDeliveryFee.toLocaleString()}원`;
                } else { currentDeliveryFee = 0; deliveryFeeText = "매장 픽업만 가능"; finalEta = "매장 픽업"; }
                let finalPrice = itemTotalPrice; if (item.deliveryAvailable) { finalPrice += currentDeliveryFee; }
                processedResults.push({
                    id: item.id, platform: `우리동네마트 (${item.martLocation || '위치정보없음'})`, name: `${item.name} ${quantity}개${discountAppliedInfo}`,
                    originalItemName: item.name, unitPrice: itemUnitPrice, onSale: item.onSale, salePrice: item.salePrice, category: item.category, 
                    martLocation: item.martLocation, quantity: quantity, price: finalPrice, deliveryFeeText: deliveryFeeText,
                    pricePerUnitText: `(개당 ${Math.round(effectiveUnitPrice).toLocaleString()}원)`, eta: finalEta, url: `#mart_${item.id}`, deliveryAvailable: item.deliveryAvailable
                });
            });
            console.log("Processed results for display:", processedResults);
            processedResults.sort((a, b) => a.price - b.price);
            displayLocalMartResults(processedResults);
        } catch (error) { console.error("Error within fetchLocalMartResults:", error); showResultsPlaceholder("상품 정보를 처리하는 중 오류가 발생했습니다."); }
    }
    function displayLocalMartResults(results) { /* 이전과 동일, handleFavoriteClick 사용 */ 
        console.log("displayLocalMartResults called with results count:", results.length);
        try {
            resultsContainer.innerHTML = ''; 
            if (results.length === 0) { showResultsPlaceholder("해당 조건의 동네 마트 상품이 없습니다."); return; }
            results.forEach((item, index) => {
                const resultItemDiv = document.createElement('div'); resultItemDiv.classList.add('result-item'); if (item.onSale) resultItemDiv.classList.add('sale-item');
                const rankSpan = document.createElement('span'); rankSpan.classList.add('rank'); rankSpan.textContent = `${index + 1}`;
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleLink = document.createElement('a'); productTitleLink.classList.add('product-title'); productTitleLink.href = item.url; productTitleLink.textContent = item.name; productTitleLink.target = '_blank';
                const priceSpan = document.createElement('p'); priceSpan.classList.add('product-meta'); let priceHtml = `총 가격: `;
                const originalItemTotalPrice = (item.unitPrice || 0) * item.quantity;
                if (item.onSale && typeof item.salePrice === 'number' && item.salePrice < item.unitPrice) {
                    priceHtml += `<strong style="color:red;">${item.price.toLocaleString()}원</strong>`;
                    if (originalItemTotalPrice > 0) priceHtml += ` <span class="original-price">(원가: ${originalItemTotalPrice.toLocaleString()}원)</span>`;
                } else { priceHtml += `<strong>${item.price.toLocaleString()}원</strong>`; }
                priceHtml += ` <span style="font-size:0.9em; color: #6c757d;">(${item.deliveryFeeText}, ${item.pricePerUnitText})</span>`; priceSpan.innerHTML = priceHtml;
                const quantitySpan = document.createElement('p'); quantitySpan.classList.add('product-meta'); quantitySpan.textContent = `수량: ${item.quantity}개`;
                const etaSpan = document.createElement('p'); etaSpan.classList.add('product-meta'); etaSpan.textContent = `도착 정보: ${item.eta}`;
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform'); platformSpan.textContent = `판매처: ${item.platform}`;
                if (item.platform.includes("마트") || item.platform.includes("슈퍼") || item.platform.includes("우리동네")) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold'; }
                const itemFavoriteButton = document.createElement('button'); const favId = item.id + '_' + item.quantity; 
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆'; itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
                itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
                itemFavoriteButton.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(item, itemFavoriteButton); });
                productDetailsDiv.appendChild(productTitleLink); productDetailsDiv.appendChild(quantitySpan); productDetailsDiv.appendChild(priceSpan); productDetailsDiv.appendChild(etaSpan); productDetailsDiv.appendChild(platformSpan);
                resultItemDiv.appendChild(rankSpan); resultItemDiv.appendChild(productDetailsDiv); resultItemDiv.appendChild(itemFavoriteButton);
                resultsContainer.appendChild(resultItemDiv);
            });
        } catch (error) { console.error("Error within displayLocalMartResults:", error); showResultsPlaceholder("검색 결과를 화면에 표시하는 중 오류가 발생했습니다."); }
    }
    function displayFavoritesList() { /* 이전과 동일, handleFavoriteClick 사용 */ 
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        if (favorites.length === 0) { showResultsPlaceholder("즐겨찾기 한 상품이 없습니다."); return; }
        const title = document.createElement('h2'); title.textContent = '내 즐겨찾기 목록'; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        favorites.forEach(favItem => {
            const favItemDiv = document.createElement('div'); favItemDiv.classList.add('result-item'); if (favItem.onSale) favItemDiv.classList.add('sale-item');
            const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
            const productTitleLink = document.createElement('a'); productTitleLink.classList.add('product-title'); productTitleLink.href = favItem.url || '#'; productTitleLink.textContent = favItem.name; productTitleLink.target = '_blank';
            const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform'); platformSpan.textContent = `판매처: ${favItem.platform}`;
            if (favItem.platform.includes("마트") || favItem.platform.includes("슈퍼") || favItem.platform.includes("우리동네")) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold';}
            const quantitySpan = document.createElement('p'); quantitySpan.classList.add('product-meta'); quantitySpan.textContent = `수량: ${favItem.quantity}개`;
            if (favItem.price) {
                const priceSpan = document.createElement('p'); priceSpan.classList.add('product-meta');
                let priceHtmlFav = `저장시 총 가격: <strong>${Number(favItem.price).toLocaleString()}원</strong>`;
                if (favItem.desiredPrice) priceHtmlFav += ` (알림 설정가: ${Number(favItem.desiredPrice).toLocaleString()}원 이하)`;
                priceSpan.innerHTML = priceHtmlFav; productDetailsDiv.appendChild(priceSpan);
            }
            if (favItem.category) { const categorySpan = document.createElement('p'); categorySpan.classList.add('product-meta'); categorySpan.textContent = `카테고리: ${favItem.category}`; productDetailsDiv.appendChild(categorySpan); }
            if (favItem.martLocation) { const locSpan = document.createElement('p'); locSpan.classList.add('product-meta'); locSpan.textContent = `마트 위치: ${favItem.martLocation}`; productDetailsDiv.appendChild(locSpan); }
            const favActionButton = document.createElement('button'); favActionButton.textContent = '⭐'; favActionButton.title = '즐겨찾기에서 제거 / 알림 수정';
            favActionButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
            favActionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemDataForModal = { ...favItem, id: favItem.platformId, originalItemName: favItem.originalItemName || favItem.name.split(' (')[0].trim() }; 
                handleFavoriteClick(itemDataForModal, favActionButton);
            });
            productDetailsDiv.appendChild(productTitleLink); productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(quantitySpan);
            favItemDiv.appendChild(productDetailsDiv); favItemDiv.appendChild(favActionButton);
            resultsContainer.appendChild(favItemDiv);
        });
    }
    function displayLocalSales() { /* 이전과 동일, handleFavoriteClick 사용 */
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        const martIdForConsumer = "myLocalMart123"; const consumerLocalStorageKey = `foodCheckMartProducts_${martIdForConsumer}`;
        const registeredMartProducts = JSON.parse(localStorage.getItem(consumerLocalStorageKey)) || [];
        let saleItems = registeredMartProducts.filter(p => p.onSale && typeof p.salePrice === 'number' && p.salePrice > 0);
        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            saleItems = saleItems.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower) return false;
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
            });
        }
        if (saleItems.length === 0) { showResultsPlaceholder(`현재 '${userLocation}' 동네에 진행 중인 세일 상품이 없습니다.`); return; }
        const title = document.createElement('h2'); title.textContent = `'${userLocation}' 동네 세일 상품`; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        const salesByCategory = saleItems.reduce((acc, item) => { const category = item.category || "기타"; if (!acc[category]) acc[category] = []; acc[category].push(item); return acc; }, {});
        for (const category in salesByCategory) {
            const categoryTitle = document.createElement('h3'); categoryTitle.textContent = category; categoryTitle.classList.add('category-title'); resultsContainer.appendChild(categoryTitle);
            salesByCategory[category].forEach(item => {
                const saleItemDiv = document.createElement('div'); saleItemDiv.classList.add('result-item', 'sale-item');
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleText = document.createElement('p'); productTitleText.classList.add('product-title'); productTitleText.style.cursor = 'default'; productTitleText.textContent = item.name;
                const priceInfo = document.createElement('p'); priceInfo.classList.add('product-meta');
                priceInfo.innerHTML = `세일 가격: <strong style="color:red;">${Number(item.salePrice).toLocaleString()}원</strong> <span class="original-price">${Number(item.price).toLocaleString()}원</span> (개당)`;
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform'); platformSpan.textContent = `판매처: 우리동네마트 (${item.martLocation})`; 
                if (platformSpan.textContent.includes("마트") || platformSpan.textContent.includes("슈퍼") || platformSpan.textContent.includes("우리동네")) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold'; }
                const stockSpan = document.createElement('p'); stockSpan.classList.add('product-meta'); stockSpan.textContent = `재고: ${item.stock}개`;
                const itemFavoriteButton = document.createElement('button'); const favId = item.id + '_1';
                const tempItemDataForFav = {
                    id: item.id, name: `${item.name} (세일)`, quantity: 1, platform: `우리동네마트 (${item.martLocation})`, 
                    url: `#sale_${item.id}`, price: item.salePrice, unitPrice: item.price, onSale: true, 
                    salePrice: item.salePrice, category: item.category, martLocation: item.martLocation, 
                    deliveryAvailable: item.deliveryAvailable, originalItemName: item.name
                };
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆'; itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
                itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
                itemFavoriteButton.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(tempItemDataForFav, itemFavoriteButton); });
                productDetailsDiv.appendChild(productTitleText); productDetailsDiv.appendChild(priceInfo); productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(stockSpan);
                saleItemDiv.appendChild(productDetailsDiv); saleItemDiv.appendChild(itemFavoriteButton);
                resultsContainer.appendChild(saleItemDiv);
            });
        }
    }
});