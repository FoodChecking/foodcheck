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
    const localSalesButton = document.getElementById('localSalesButton'); // 일반 동네 세일
    const flashSalesButton = document.getElementById('flashSalesButton'); // 마감 임박 세일 (신규)

    const priceAlertModal = document.getElementById('priceAlertModal');
    const closePriceAlertModalButton = document.getElementById('closePriceAlertModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const desiredPriceInput = document.getElementById('desiredPriceInput');
    const saveDesiredPriceButton = document.getElementById('saveDesiredPriceButton');

    const notificationBellIcon = document.getElementById('notificationBellIcon');
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationList = document.getElementById('notificationList');
    const clearNotificationsButton = document.getElementById('clearNotificationsButton');

    // 데이터 및 상태 변수
    const sampleKeywords = ["햇반", "햇반 흑미밥", "신라면", "짜파게티", "삼다수", "우유 1L", "계란 30구", "케찹"];
    let favorites = JSON.parse(localStorage.getItem('foodCheckFavorites')) || [];
    let userLocation = localStorage.getItem('foodCheckUserLocation') || "미설정";
    let currentItemForPriceAlert = null;
    let currentFavButtonForPriceAlert = null;
    let notifications = JSON.parse(localStorage.getItem('foodCheckNotifications')) || [];

    const martIdForConsumer = "myLocalMart123";
    const productsLocalStorageKey = `foodCheckMartProducts_${martIdForConsumer}`;
    const flashSalesLocalStorageKey = `foodCheckFlashSales_${martIdForConsumer}`;

    // --- 유틸리티 함수 ---
    function updateMainFavoritesButtonText() { mainFavoritesButton.textContent = `⭐ 내 즐겨찾기 상품 (${favorites.length})`; }
    function updateUserLocationDisplay() { currentLocationDisplay.textContent = userLocation; }
    function showResultsPlaceholder(message) { resultsContainer.innerHTML = `<p class="results-placeholder">${message}</p>`; }
    function renderNotifications() { /* 이전과 동일 */
        notificationList.innerHTML = ''; 
        if (notifications.length === 0) {
            const noNotif = document.createElement('li'); noNotif.textContent = "새 알림이 없습니다.";
            noNotif.style.textAlign = "center"; noNotif.style.color = "#888";
            notificationList.appendChild(noNotif);
        } else {
            notifications.forEach(notifText => {
                const listItem = document.createElement('li'); listItem.textContent = notifText;
                notificationList.appendChild(listItem);
            });
        }
    }
    function addNotification(message) { /* 이전과 동일 */
        notifications.unshift(message); 
        if (notifications.length > 10) { notifications.pop(); }
        localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications));
        renderNotifications();
    }

    // --- 초기화 ---
    updateUserLocationDisplay();
    updateMainFavoritesButtonText();
    renderNotifications();

    // --- 이벤트 리스너 ---
    notificationBellIcon.addEventListener('click', (event) => { /* 이전과 동일 */ event.stopPropagation(); notificationPopup.style.display = notificationPopup.style.display === 'block' ? 'none' : 'block';});
    clearNotificationsButton.addEventListener('click', (event) => { /* 이전과 동일 */ event.stopPropagation(); if (confirm("모든 알림을 지우시겠습니까?")) { notifications = []; localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications)); renderNotifications(); }});
    document.addEventListener('click', function(event) { /* 이전과 동일 (모달/팝업/연관검색어 외부클릭 닫기) */
        if (priceAlertModal && priceAlertModal.style.display === 'block' && event.target == priceAlertModal ) {
             priceAlertModal.style.display = 'none'; currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;
        }
        if (notificationPopup && notificationPopup.style.display === 'block' && notificationBellContainer && !notificationBellContainer.contains(event.target)) {
            notificationPopup.style.display = 'none';
        }
        if (suggestionsContainer && suggestionsContainer.style.display === 'block' && productNameInput && !productNameInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    setLocationButton.addEventListener('click', () => { /* 이전과 동일 */ 
        const newLocation = locationInput.value.trim();
        if (newLocation) {
            userLocation = newLocation; localStorage.setItem('foodCheckUserLocation', userLocation); updateUserLocationDisplay();
            alert(`동네가 '${userLocation}'(으)로 설정되었습니다.`); locationInput.value = '';
            externalSearchLinksContainer.innerHTML = ''; showResultsPlaceholder('새로운 동네가 설정되었습니다. 상품을 검색해보세요.');
        } else { alert('동네를 입력해주세요.');}
    });
    productNameInput.addEventListener('input', () => { /* 이전과 동일 */ 
        const query = productNameInput.value.toLowerCase(); suggestionsContainer.innerHTML = '';
        if (query.length < 1) { suggestionsContainer.style.display = 'none'; return; }
        const filteredKeywords = sampleKeywords.filter(keyword => keyword.toLowerCase().includes(query));
        if (filteredKeywords.length > 0) {
            suggestionsContainer.style.display = 'block';
            filteredKeywords.forEach(keyword => {
                const div = document.createElement('div'); div.textContent = keyword; div.classList.add('suggestion-item');
                div.addEventListener('click', () => { productNameInput.value = keyword; suggestionsContainer.innerHTML = ''; suggestionsContainer.style.display = 'none'; });
                suggestionsContainer.appendChild(div);
            });
        } else { suggestionsContainer.style.display = 'none'; }
    });
    searchButton.addEventListener('click', () => { /* 이전과 동일 */
        console.log("Search button clicked.");
        const productName = productNameInput.value.trim(); const quantity = quantityInput.value.trim();
        if (!productName || !quantity) { alert('상품명과 수량을 모두 입력해주세요.'); return; }
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity < 1) { alert('수량은 1 이상의 숫자로 입력해주세요.'); quantityInput.value = '1'; return; }
        showResultsPlaceholder("결과를 불러오는 중입니다..."); displayExternalSearchLinks(productName);
        console.log(`검색: 상품명='${productName}', 수량=${numQuantity}, 동네=${userLocation}`);
        setTimeout(() => {
            console.log("setTimeout: Calling fetchLocalMartResults");
            try { fetchLocalMartResults(productName, numQuantity, userLocation); }
            catch (error) { console.error("Error in fetchLocalMartResults execution:", error); showResultsPlaceholder("오류가 발생하여 검색 결과를 가져오지 못했습니다."); }
        }, 500);
    });
    mainFavoritesButton.addEventListener('click', () => { externalSearchLinksContainer.innerHTML = ''; displayFavoritesList(); });
    
    // 수정된 버튼 이벤트 리스너
    localSalesButton.addEventListener('click', () => { // 일반 세일 보기
        externalSearchLinksContainer.innerHTML = '';
        displayRegularLocalSales(); // 새 함수 호출
    });
    flashSalesButton.addEventListener('click', () => { // 마감 임박 세일 보기
        externalSearchLinksContainer.innerHTML = '';
        displayFlashSales(); // 이름 변경된 함수 호출
    });

    closePriceAlertModalButton.addEventListener('click', () => { /* 이전과 동일 */ priceAlertModal.style.display = 'none'; currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;});
    saveDesiredPriceButton.addEventListener('click', () => { /* 이전과 동일 (버그 있을 시 점검) */
        const desiredPrice = parseFloat(desiredPriceInput.value);
        if (isNaN(desiredPrice) || desiredPrice <= 0) { alert('유효한 원하는 가격을 입력해주세요.'); return; }
        if (currentItemForPriceAlert && currentFavButtonForPriceAlert) {
            const itemData = currentItemForPriceAlert; const buttonEl = currentFavButtonForPriceAlert;
            const favId = itemData.id + '_' + (itemData.quantity || 1); // itemData.id는 platformId 또는 mart product id
            const favDataObject = {
                favId: favId, platformId: itemData.id, name: itemData.name, 
                quantity: itemData.quantity || 1, platform: itemData.platform, 
                url: itemData.url, price: itemData.price, // 현재 총 가격
                category: itemData.category, onSale: itemData.onSale, salePrice: itemData.salePrice, // 개당 세일가
                unitPrice: itemData.unitPrice, // 개당 원가
                martLocation: itemData.martLocation, desiredPrice: desiredPrice, alertActive: true, 
                addedDate: new Date().toISOString(), originalItemName: itemData.originalItemName
            };
            const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);
            if (favoriteIndex === -1) { favorites.push(favDataObject); }
            else { favorites[favoriteIndex] = { ...favorites[favoriteIndex], ...favDataObject }; }
            localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
            updateMainFavoritesButtonText();
            buttonEl.textContent = '⭐'; buttonEl.title = '즐겨찾기에서 제거 / 알림 수정';
            const displayItemName = itemData.originalItemName || itemData.name.split(' (')[0].trim();
            addNotification(`'${displayItemName}' 가격 알림: ${desiredPrice.toLocaleString()}원 이하 설정`);
            priceAlertModal.style.display = 'none';
            currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;
            desiredPriceInput.value = '';
        }
    });
    
    // --- 핵심 로직 함수 ---
    function handleFavoriteClick(itemData, buttonEl) { /* 이전과 동일 (버그 있을 시 점검) */
        console.log("handleFavoriteClick called for item:", itemData);
        // itemData 구조: id(상품고유ID), name(표시용이름), originalItemName, quantity, price(현재총액) 등이 필요
        const favId = itemData.id + '_' + (itemData.quantity || 1);
        const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);

        if (favoriteIndex === -1) { 
            currentItemForPriceAlert = itemData; currentFavButtonForPriceAlert = buttonEl;
            modalProductName.textContent = itemData.originalItemName || itemData.name.split(' (')[0].trim();
            modalCurrentPrice.textContent = `${Number(itemData.price).toLocaleString()}원 (수량: ${itemData.quantity || 1}개)`;
            desiredPriceInput.value = ''; 
            const currentTotalItemPrice = Number(itemData.price) || 0;
            const suggestedPrice = Math.floor(currentTotalItemPrice * 0.9 / 100) * 100;
            desiredPriceInput.placeholder = `예: ${suggestedPrice > 0 ? suggestedPrice.toLocaleString() : (currentTotalItemPrice > 0 ? Math.floor(currentTotalItemPrice / 2 / 100) * 100 : '1000' ) }`;
            priceAlertModal.style.display = 'block';
            desiredPriceInput.focus();
        } else { 
            const removedItem = favorites[favoriteIndex];
            const removedItemName = removedItem.originalItemName || removedItem.name.split(' (')[0].trim();
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
    function fetchLocalMartResults(productName, quantity, location) { /* 이전과 동일 (내부 로직 점검) */ 
        console.log("fetchLocalMartResults started. productName:", productName, "quantity:", quantity, "location:", location);
        try {
            const baseProductName = productName.toLowerCase();
            const registeredMartProducts = JSON.parse(localStorage.getItem(productsLocalStorageKey)) || [];
            console.log("Registered mart products from localStorage:", registeredMartProducts);
            let filteredMartProducts = registeredMartProducts.filter(p => p.name && typeof p.name === 'string' && p.name.toLowerCase().includes(baseProductName));
            console.log("After name filter, mart products:", filteredMartProducts.length);
            if (location && location !== "미설정") {
                const currentLocLower = location.toLowerCase();
                filteredMartProducts = filteredMartProducts.filter(p => {
                    const itemMartLocationLower = p.martLocation ? p.martLocation.toLowerCase() : "";
                    if (!itemMartLocationLower) return false;
                    return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
                });
            }
            console.log("After location filter, mart products:", filteredMartProducts.length);
            let processedResults = [];
            filteredMartProducts.forEach(item => {
                const itemUnitPrice = Number(item.price) || 0;
                const itemSalePrice = (item.onSale && typeof item.salePrice === 'number') ? Number(item.salePrice) : null;
                let unitPriceToUse = (itemSalePrice !== null && itemSalePrice < itemUnitPrice) ? itemSalePrice : itemUnitPrice;
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
                let currentDeliveryFee = 0; let deliveryFeeText = "배달 지원 안함";
                let finalEta = item.eta || (item.deliveryAvailable ? '오늘배송가능 (마트별 확인)' : '매장픽업');
                if (item.deliveryAvailable) {
                    currentDeliveryFee = Number(item.deliveryFee) || 0;
                    const minOrderAmount = Number(item.minOrderForFreeDelivery) || 0;
                    if (minOrderAmount > 0 && itemTotalPrice >= minOrderAmount) { currentDeliveryFee = 0; }
                    deliveryFeeText = currentDeliveryFee === 0 ? "무료배송" : `배송비 ${currentDeliveryFee.toLocaleString()}원`;
                } else { currentDeliveryFee = 0; deliveryFeeText = "매장 픽업만 가능"; finalEta = "매장 픽업"; }
                let finalPrice = itemTotalPrice; if (item.deliveryAvailable) { finalPrice += currentDeliveryFee; }
                processedResults.push({
                    id: item.id, martId: martIdForConsumer, platform: `우리동네마트 (${item.martLocation || '위치정보없음'})`, 
                    name: `${item.name} ${quantity}개${discountAppliedInfo}`, originalItemName: item.name, 
                    unitPrice: itemUnitPrice, stock: Number(item.stock) || 0,
                    manufacturingDate: item.manufacturingDate, expiryDate: item.expiryDate,
                    onSale: item.onSale, salePrice: itemSalePrice, category: item.category, 
                    martLocation: item.martLocation, quantity: quantity, price: finalPrice, 
                    deliveryFeeText: deliveryFeeText, pricePerUnitText: `(개당 ${Math.round(effectiveUnitPrice).toLocaleString()}원)`,
                    eta: finalEta, url: `#martProd_${item.id}`, deliveryAvailable: item.deliveryAvailable
                });
            });
            console.log("Processed results for display (Local Mart Search):", processedResults);
            processedResults.sort((a, b) => a.price - b.price);
            displayLocalMartResults(processedResults);
        } catch (error) { console.error("Error within fetchLocalMartResults:", error); showResultsPlaceholder("상품 정보를 처리하는 중 오류가 발생했습니다."); }
    }
    function displayLocalMartResults(results) { /* 이전과 동일, handleFavoriteClick 사용 */ 
        console.log("displayLocalMartResults called with results count:", results.length);
        try {
            resultsContainer.innerHTML = ''; 
            if (results.length === 0) { showResultsPlaceholder("해당 조건의 동네 마트 상품이 없습니다."); return; }
            results.forEach((item, index) => { /* ... (이전과 동일한 아이템 렌더링 로직) ... */ 
                const resultItemDiv = document.createElement('div'); resultItemDiv.classList.add('result-item'); if (item.onSale && item.salePrice) resultItemDiv.classList.add('sale-item');
                const rankSpan = document.createElement('span'); rankSpan.classList.add('rank'); rankSpan.textContent = `${index + 1}`;
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleLink = document.createElement('a'); productTitleLink.classList.add('product-title'); productTitleLink.href = item.url; productTitleLink.textContent = item.name; productTitleLink.target = '_blank';
                const priceSpan = document.createElement('p'); priceSpan.classList.add('product-meta'); let priceHtml = `총 가격: `;
                const originalItemTotalPrice = (item.unitPrice || 0) * item.quantity;
                if (item.onSale && item.salePrice && item.salePrice < item.unitPrice) {
                    priceHtml += `<strong style="color:red;">${item.price.toLocaleString()}원</strong>`;
                    if (originalItemTotalPrice > 0 && item.price < (originalItemTotalPrice + (item.deliveryAvailable ? (item.deliveryFeeText.startsWith("무료") || item.deliveryFeeText.includes("픽업") ? 0 : parseFloat(item.deliveryFeeText.replace(/[^0-9.-]+/g,""))) : 0 ) )) priceHtml += ` <span class="original-price">(원래 상품가: ${originalItemTotalPrice.toLocaleString()}원)</span>`;
                } else { priceHtml += `<strong>${item.price.toLocaleString()}원</strong>`; }
                priceHtml += ` <span style="font-size:0.9em; color: #6c757d;">(${item.deliveryFeeText}, ${item.pricePerUnitText})</span>`; priceSpan.innerHTML = priceHtml;
                const quantitySpan = document.createElement('p'); quantitySpan.classList.add('product-meta'); quantitySpan.textContent = `수량: ${item.quantity}개`;
                const stockInfoSpan = document.createElement('p'); stockInfoSpan.classList.add('product-meta'); stockInfoSpan.textContent = `남은 재고: ${item.stock}개`; productDetailsDiv.appendChild(stockInfoSpan);
                if(item.manufacturingDate) { const mfgDateSpan = document.createElement('p'); mfgDateSpan.classList.add('product-meta'); mfgDateSpan.textContent = `제조일자: ${item.manufacturingDate}`; productDetailsDiv.appendChild(mfgDateSpan); }
                if(item.expiryDate) { const expDateSpan = document.createElement('p'); expDateSpan.classList.add('product-meta'); expDateSpan.textContent = `유통기한: ${item.expiryDate}`; productDetailsDiv.appendChild(expDateSpan); }
                const etaSpan = document.createElement('p'); etaSpan.classList.add('product-meta'); etaSpan.textContent = `도착 정보: ${item.eta}`;
                const platformLink = document.createElement('a'); platformLink.classList.add('product-platform-link');
                platformLink.href = `mart_page.html?martId=${encodeURIComponent(item.martId)}&martName=${encodeURIComponent(item.platform.split('(')[0].trim())}&martLocation=${encodeURIComponent(item.martLocation)}`;
                platformLink.textContent = `판매처: ${item.platform}`; platformLink.target = '_blank';
                platformLink.style.cssText = "text-decoration: underline; cursor: pointer; display: block; font-size: 0.85em; color: #6c757d; margin-top: 5px;";
                if (item.platform.includes("마트") || item.platform.includes("슈퍼") || item.platform.includes("우리동네")) { platformLink.style.color = '#28a745'; platformLink.style.fontWeight = 'bold';}
                const purchaseButton = document.createElement('button'); purchaseButton.textContent = '구매하기'; purchaseButton.classList.add('purchase-btn');
                purchaseButton.style.cssText = "margin-top: 8px; padding: 6px 10px; font-size: 0.9em; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;";
                purchaseButton.addEventListener('click', () => { simulatePurchase(item.id, item.martId, item.quantity, item.stock); });
                const itemFavoriteButton = document.createElement('button'); const favId = item.id + '_' + item.quantity; 
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆'; itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
                itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
                itemFavoriteButton.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(item, itemFavoriteButton); });
                productDetailsDiv.appendChild(productTitleLink); productDetailsDiv.appendChild(quantitySpan); productDetailsDiv.appendChild(priceSpan); 
                productDetailsDiv.appendChild(etaSpan); productDetailsDiv.appendChild(platformLink); productDetailsDiv.appendChild(purchaseButton);
                resultItemDiv.appendChild(rankSpan); resultItemDiv.appendChild(productDetailsDiv); resultItemDiv.appendChild(itemFavoriteButton);
                resultsContainer.appendChild(resultItemDiv);
            });
        } catch (error) { console.error("Error within displayLocalMartResults:", error); showResultsPlaceholder("검색 결과를 화면에 표시하는 중 오류가 발생했습니다."); }
    }
    function simulatePurchase(productId, martOwnerId, purchasedQuantity, currentStock) { /* 이전과 동일 */ 
        console.log(`Simulating purchase: productId=${productId}, martOwnerId=${martOwnerId}, quantity=${purchasedQuantity}, stock=${currentStock}`);
        if (purchasedQuantity > currentStock) { alert(`재고 부족! 현재 ${currentStock}개 남아있습니다.`); return; }
        const storageKey = `foodCheckMartProducts_${martOwnerId || "myLocalMart123"}`;
        let martProducts = JSON.parse(localStorage.getItem(storageKey)) || [];
        const productIndex = martProducts.findIndex(p => p.id === productId);
        if (productIndex > -1) {
            const newStock = martProducts[productIndex].stock - purchasedQuantity;
            martProducts[productIndex].stock = Math.max(0, newStock);
            localStorage.setItem(storageKey, JSON.stringify(martProducts));
            addNotification(`'${martProducts[productIndex].name}' ${purchasedQuantity}개 구매 완료 (재고: ${martProducts[productIndex].stock}개) - 실제 결제X`);
            const currentSearchTerm = productNameInput.value.trim(); const currentQuantityStr = quantityInput.value.trim();
            if (currentSearchTerm && currentQuantityStr) {
                const currentQuantityNum = parseInt(currentQuantityStr);
                if (!isNaN(currentQuantityNum) && currentQuantityNum > 0) {
                    fetchLocalMartResults(currentSearchTerm, currentQuantityNum, userLocation); // Refresh results
                }
            }
        } else { console.error("Product not found in localStorage for stock update:", productId); alert("상품 정보를 찾는 데 실패하여 재고를 업데이트할 수 없습니다.");}
    }
    function displayFavoritesList() { /* 이전과 동일, handleFavoriteClick 사용, itemDataForModal 점검 */ 
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        if (favorites.length === 0) { showResultsPlaceholder("즐겨찾기 한 상품이 없습니다."); return; }
        const title = document.createElement('h2'); title.textContent = '내 즐겨찾기 목록'; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        favorites.forEach(favItem => { /* favItem은 즐겨찾기에 저장된 객체 */
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
                // handleFavoriteClick에 필요한 모든 속성을 favItem에서 매핑
                const itemDataForModal = { 
                    id: favItem.platformId, // 중요: platformId를 id로 사용
                    name: favItem.name, 
                    originalItemName: favItem.originalItemName || favItem.name.split(' (')[0].trim(),
                    quantity: favItem.quantity, 
                    price: favItem.price, // 저장된 총 가격
                    platform: favItem.platform,
                    url: favItem.url,
                    category: favItem.category,
                    martLocation: favItem.martLocation,
                    unitPrice: favItem.unitPrice, // 개당 원가
                    onSale: favItem.onSale,
                    salePrice: favItem.salePrice, // 개당 세일가
                    deliveryAvailable: true // 즐겨찾기된 아이템의 배달정보는 저장안했으므로, 일단 true 또는 favItem에서 가져와야함
                                         // 이 정보는 itemDataForModal이 handleFavoriteClick으로 전달될 때 필요
                }; 
                handleFavoriteClick(itemDataForModal, favActionButton);
            });
            productDetailsDiv.appendChild(productTitleLink); productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(quantitySpan);
            favItemDiv.appendChild(productDetailsDiv); favItemDiv.appendChild(favActionButton);
            resultsContainer.appendChild(favItemDiv);
        });
    }

    // 신규: 일반 동네 세일 상품 표시 함수
    function displayRegularLocalSales() {
        console.log("displayRegularLocalSales called. User location:", userLocation);
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        
        const registeredMartProducts = JSON.parse(localStorage.getItem(productsLocalStorageKey)) || [];
        console.log("Registered mart products for regular sales:", registeredMartProducts);

        let regularSaleItems = registeredMartProducts.filter(p => p.onSale && typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price);
        console.log("Initial regular sale items (onSale true, valid salePrice):", regularSaleItems.length);

        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            regularSaleItems = regularSaleItems.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower) return false;
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
            });
        }
        console.log("After location filter, regular sale items:", regularSaleItems.length);

        if (regularSaleItems.length === 0) { showResultsPlaceholder(`현재 '${userLocation || '설정된 동네'}'에 진행 중인 일반 세일 상품이 없습니다.`); return; }

        const title = document.createElement('h2');
        title.textContent = `'${userLocation || '전체 동네'}' 일반 세일 상품`; title.style.textAlign = 'center'; title.style.marginBottom = '20px';
        resultsContainer.appendChild(title);

        const salesByCategory = regularSaleItems.reduce((acc, item) => {
            const category = item.category || "기타";
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});
        console.log("Regular sales grouped by category:", salesByCategory);

        for (const category in salesByCategory) {
            const categoryTitle = document.createElement('h3'); categoryTitle.textContent = category; categoryTitle.classList.add('category-title'); resultsContainer.appendChild(categoryTitle);
            salesByCategory[category].forEach(item => { // item은 martProduct 객체
                const saleItemDiv = document.createElement('div'); saleItemDiv.classList.add('result-item', 'sale-item');
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                
                const productTitleText = document.createElement('p'); productTitleText.classList.add('product-title'); productTitleText.style.cursor = 'default';
                productTitleText.textContent = item.name;
                
                const priceInfo = document.createElement('p'); priceInfo.classList.add('product-meta');
                priceInfo.innerHTML = `세일 가격: <strong style="color:red;">${Number(item.salePrice).toLocaleString()}원</strong> <span class="original-price">${Number(item.price).toLocaleString()}원</span> (개당)`;
                
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform');
                platformSpan.textContent = `판매처: 우리동네마트 (${item.martLocation})`; 
                if (platformSpan.textContent.includes("마트") || platformSpan.textContent.includes("슈퍼") || platformSpan.textContent.includes("우리동네")) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold';}
                
                const stockSpan = document.createElement('p'); stockSpan.classList.add('product-meta'); stockSpan.textContent = `재고: ${item.stock}개`;

                const itemFavoriteButton = document.createElement('button');
                // 일반 세일 상품의 경우, 수량 1로 가정하고 즐겨찾기 ID 생성
                const favId = item.id + '_1'; 
                const tempItemDataForFav = { // handleFavoriteClick에 전달할 객체 구성
                    id: item.id, name: `${item.name} (일반세일)`, quantity: 1, 
                    platform: `우리동네마트 (${item.martLocation})`, url: `#regularSale_${item.id}`, 
                    price: item.salePrice, // 세일가 * 1
                    unitPrice: item.price, // 원래 개당 가격
                    onSale: true, salePrice: item.salePrice, category: item.category, 
                    martLocation: item.martLocation, deliveryAvailable: item.deliveryAvailable, // 배달 정보도 전달
                    originalItemName: item.name
                };
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆';
                itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
                itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
                itemFavoriteButton.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(tempItemDataForFav, itemFavoriteButton); });

                productDetailsDiv.appendChild(productTitleText); productDetailsDiv.appendChild(priceInfo);
                productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(stockSpan);
                saleItemDiv.appendChild(productDetailsDiv); saleItemDiv.appendChild(itemFavoriteButton);
                resultsContainer.appendChild(saleItemDiv);
            });
        }
    }

    // 이름 변경: displayLocalSales -> displayFlashSales
    function displayFlashSales() {
        console.log("displayFlashSales called. User location:", userLocation);
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        
        const flashSaleItemsFromStorage = JSON.parse(localStorage.getItem(flashSalesLocalStorageKey)) || [];
        console.log("Raw flash sale items from localStorage:", flashSaleItemsFromStorage);

        let currentFlashSales = flashSaleItemsFromStorage.filter(fs => {
            const endTime = new Date(fs.saleEndsAt); return endTime.getTime() > new Date().getTime();
        });
        console.log("Active (non-expired) flash sales:", currentFlashSales);

        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            currentFlashSales = currentFlashSales.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower) return false;
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
            });
        }
        console.log("After location filter, flash sales:", currentFlashSales);

        if (currentFlashSales.length === 0) { showResultsPlaceholder(`현재 '${userLocation || '설정된 동네'}'에 진행 중인 마감 임박 세일 상품이 없습니다.`); return; }

        const title = document.createElement('h2');
        title.textContent = `'${userLocation || '전체 동네'}' 마감 임박 세일!`; title.style.textAlign = 'center'; title.style.marginBottom = '20px';
        resultsContainer.appendChild(title);

        const salesByCategory = currentFlashSales.reduce((acc, item) => {
            const category = item.category || "기타"; if (!acc[category]) acc[category] = [];
            acc[category].push(item); return acc;
        }, {});
        console.log("Flash sales grouped by category:", salesByCategory);

        for (const category in salesByCategory) {
            const categoryTitle = document.createElement('h3'); categoryTitle.textContent = category; categoryTitle.classList.add('category-title'); resultsContainer.appendChild(categoryTitle);
            salesByCategory[category].forEach(item => { // item은 activeFlashSales의 요소
                const saleItemDiv = document.createElement('div'); saleItemDiv.classList.add('result-item', 'sale-item');
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleText = document.createElement('p'); productTitleText.classList.add('product-title'); productTitleText.style.cursor = 'default';
                productTitleText.textContent = `${item.productName} (마감세일!)`;
                const priceInfo = document.createElement('p'); priceInfo.classList.add('product-meta');
                priceInfo.innerHTML = `마감 세일가: <strong style="color:red;">${Number(item.flashSalePrice).toLocaleString()}원</strong> <span class="original-price">${Number(item.originalPrice).toLocaleString()}원</span> (개당)`;
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform');
                platformSpan.textContent = `판매처: 우리동네마트 (${item.martLocation || '위치정보없음'})`; 
                if (platformSpan.textContent.includes("마트") || platformSpan.textContent.includes("슈퍼") || platformSpan.textContent.includes("우리동네")) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold'; }
                const stockSpan = document.createElement('p'); stockSpan.classList.add('product-meta'); stockSpan.textContent = `남은 세일 재고: ${item.flashSaleStock}개 (1인당 ${item.maxPerPerson}개 구매 가능)`;
                const endTime = new Date(item.saleEndsAt); const now = new Date();
                const timeLeftMs = endTime.getTime() - now.getTime();
                const timeLeftMinutes = Math.max(0, Math.floor(timeLeftMs / (1000 * 60)));
                const timeInfoSpan = document.createElement('p'); timeInfoSpan.classList.add('product-meta');
                timeInfoSpan.textContent = `종료까지: 약 ${timeLeftMinutes}분 (종료: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                const purchaseFlashSaleButton = document.createElement('button'); purchaseFlashSaleButton.textContent = '선착순 구매하기'; purchaseFlashSaleButton.classList.add('purchase-btn');
                purchaseFlashSaleButton.style.cssText = "margin-top: 8px; padding: 6px 10px; font-size: 0.9em; background-color: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;";
                purchaseFlashSaleButton.addEventListener('click', () => { simulateFlashSalePurchase(item.id, item.flashSaleStock, item.maxPerPerson); });
                const itemFavoriteButton = document.createElement('button'); const favId = item.productId + '_1'; // 마감세일은 상품ID_수량1 기준
                const tempItemDataForFav = {
                    id: item.productId, name: `${item.productName} (마감세일)`, quantity: 1, 
                    platform: `우리동네마트 (${item.martLocation})`, url: `#flashsale_${item.id}`, 
                    price: item.flashSalePrice, unitPrice: item.originalPrice, onSale: true, 
                    salePrice: item.flashSalePrice, category: item.category, martLocation: item.martLocation, 
                    deliveryAvailable: false, // 마감세일은 배달여부 별도 설정 없었으므로 false 또는 item에서 가져와야 함
                    originalItemName: item.productName
                };
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆'; itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
                itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
                itemFavoriteButton.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(tempItemDataForFav, itemFavoriteButton); });
                productDetailsDiv.appendChild(productTitleText); productDetailsDiv.appendChild(priceInfo);
                productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(stockSpan); productDetailsDiv.appendChild(timeInfoSpan);
                productDetailsDiv.appendChild(purchaseFlashSaleButton);
                saleItemDiv.appendChild(productDetailsDiv); saleItemDiv.appendChild(itemFavoriteButton);
                resultsContainer.appendChild(saleItemDiv);
            });
        }
    }

    function simulateFlashSalePurchase(flashSaleId, currentFlashStock, maxPerUser) { /* 이전과 동일 */ 
        console.log(`Simulating flash sale purchase: flashSaleId=${flashSaleId}, stock=${currentFlashStock}, maxPerUser=${maxPerUser}`);
        const quantityToBuy = 1; 
        if (quantityToBuy > maxPerUser) { alert(`1인당 최대 ${maxPerUser}개까지만 구매 가능합니다.`); return; }
        if (quantityToBuy > currentFlashStock) { alert(`죄송합니다. 해당 상품의 마감 세일 재고(${currentFlashStock}개)가 부족합니다.`); return; }
        let flashSales = JSON.parse(localStorage.getItem(flashSalesLocalStorageKey)) || [];
        const saleIndex = flashSales.findIndex(fs => fs.id === flashSaleId);
        if (saleIndex > -1) {
            flashSales[saleIndex].flashSaleStock -= quantityToBuy;
            const boughtItemName = flashSales[saleIndex].productName;
            if (flashSales[saleIndex].flashSaleStock <= 0) {
                flashSales.splice(saleIndex, 1); 
                addNotification(`'${boughtItemName}' 마감 세일 상품이 모두 판매되었습니다!`);
            } else {
                addNotification(`'${boughtItemName}' 마감 세일 상품 ${quantityToBuy}개 구매 완료! (남은 세일 재고: ${flashSales[saleIndex].flashSaleStock}개) - 실제 결제X`);
            }
            localStorage.setItem(flashSalesLocalStorageKey, JSON.stringify(flashSales));
            displayFlashSales(); // 마감 세일 목록 새로고침
        } else { alert("마감 세일 상품 정보를 찾지 못했습니다.");}
    }
});