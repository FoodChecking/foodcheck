document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택 (null 체크 강화)
    const getElem = (id) => document.getElementById(id);

    const productNameInput = getElem('productName');
    const quantityInput = getElem('quantity');
    const searchButton = getElem('searchButton');
    const resultsContainer = getElem('resultsContainer');
    const mainFavoritesButton = getElem('favoritesButton');
    const suggestionsContainer = getElem('suggestions-container');
    const locationInput = getElem('locationInput');
    const setLocationButton = getElem('setLocationButton');
    const currentLocationDisplay = getElem('currentLocationDisplay');
    const externalSearchLinksContainer = getElem('externalSearchLinksContainer');
    const localSalesButton = getElem('localSalesButton');
    const flashSalesButton = getElem('flashSalesButton');
    const auctionsButton = getElem('auctionsButton');

    const priceAlertModal = getElem('priceAlertModal');
    const closePriceAlertModalButton = getElem('closePriceAlertModal');
    const modalProductName = getElem('modalProductName');
    const modalCurrentPrice = getElem('modalCurrentPrice');
    const desiredPriceInput = getElem('desiredPriceInput');
    const saveDesiredPriceButton = getElem('saveDesiredPriceButton');

    const notificationBellContainer = getElem('notificationBellContainer');
    const notificationBellIcon = getElem('notificationBellIcon');
    const notificationPopup = getElem('notificationPopup');
    const notificationList = getElem('notificationList');
    const clearNotificationsButton = getElem('clearNotificationsButton');

    const auctionBidModal = getElem('auctionBidModal');
    const closeAuctionBidModalButton = getElem('closeAuctionBidModal');
    const auctionModalTitle = getElem('auctionModalTitle');
    const auctionModalProductName = getElem('auctionModalProductName');
    const auctionModalQuantity = getElem('auctionModalQuantity');
    const auctionModalCurrentBid = getElem('auctionModalCurrentBid');
    const bidAmountInput = getElem('bidAmountInput');
    const submitBidButton = getElem('submitBidButton');
    
    let currentAuctionItemForBid = null;

    const sampleKeywords = ["햇반", "햇반 흑미밥", "신라면", "짜파게티", "삼다수", "우유 1L", "계란 30구", "케찹"];
    let favorites = []; 
    let userLocation = "미설정"; 
    let currentItemForPriceAlert = null;
    let currentFavButtonForPriceAlert = null; 
    let notifications = [];

    const martIdForConsumer = "myLocalMart123"; // This must match martId in merchant_script.js
    const productsLocalStorageKey = `foodCheckMartProducts_${martIdForConsumer}`;
    const flashSalesLocalStorageKey = `foodCheckFlashSales_${martIdForConsumer}`;
    const auctionsLocalStorageKey = `foodCheckAuctions_${martIdForConsumer}`;

    function loadDataFromLocalStorage(key, defaultValue = []) {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData === null) return defaultValue;
            const parsedData = JSON.parse(storedData);
            return Array.isArray(parsedData) ? parsedData : defaultValue;
        } catch (error) {
            console.error(`Error parsing data from localStorage for key "${key}":`, error);
            return defaultValue;
        }
    }

    function updateMainFavoritesButtonText() {
        if(mainFavoritesButton) mainFavoritesButton.textContent = `⭐ 내 즐겨찾기 상품 (${favorites.length})`;
    }
    function updateUserLocationDisplay() {
        if(currentLocationDisplay) currentLocationDisplay.textContent = userLocation;
    }
    function showResultsPlaceholder(message) {
        if(resultsContainer) resultsContainer.innerHTML = `<p class="results-placeholder">${message}</p>`;
    }
    function renderNotifications() {
        if (!notificationList) return;
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
    function addNotification(message) {
        notifications.unshift(message); 
        if (notifications.length > 10) { notifications.pop(); }
        localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications));
        renderNotifications();
    }

    function initializeApp() {
        console.log("Initializing consumer app...");
        favorites = loadDataFromLocalStorage('foodCheckFavorites', []);
        notifications = loadDataFromLocalStorage('foodCheckNotifications', []);
        userLocation = localStorage.getItem('foodCheckUserLocation') || "미설정";

        updateUserLocationDisplay();
        updateMainFavoritesButtonText();

        if (notifications.length === 0 && notificationList) {
            addNotification("FoodCheck에 오신 것을 환영합니다!");
        } else {
            renderNotifications(); 
        }
        
        if (resultsContainer && resultsContainer.children.length === 0) {
             showResultsPlaceholder('상품명과 수량을 입력하고 검색 버튼을 눌러주세요.');
        } else if (resultsContainer && resultsContainer.children.length === 1 && !resultsContainer.firstElementChild.classList.contains('results-placeholder')) {
            // Content exists but is not placeholder, clear and show placeholder
            showResultsPlaceholder('상품명과 수량을 입력하고 검색 버튼을 눌러주세요.');
        } else if (resultsContainer && resultsContainer.children.length > 1) {
             // Multiple children, clear and show placeholder
            showResultsPlaceholder('상품명과 수량을 입력하고 검색 버튼을 눌러주세요.');
        }
        // If it already contains the placeholder, do nothing.

        console.log("Consumer App initialized.");
    }
        
    if (notificationBellIcon && notificationPopup && notificationBellContainer) {
        notificationBellIcon.addEventListener('click', (event) => { 
            event.stopPropagation(); 
            notificationPopup.style.display = notificationPopup.style.display === 'block' ? 'none' : 'block';
        });
    } else { console.warn("Notification bell elements not fully found for event listeners."); }

    if (clearNotificationsButton) {
        clearNotificationsButton.addEventListener('click', (event) => { 
            event.stopPropagation(); 
            if (confirm("모든 알림을 지우시겠습니까?")) { 
                notifications = []; localStorage.setItem('foodCheckNotifications', JSON.stringify(notifications)); renderNotifications(); 
            }
        });
    } else { console.warn("Clear notifications button not found for event listener."); }
    
    document.addEventListener('click', function(event) { 
        if (priceAlertModal && priceAlertModal.style.display === 'block' && event.target === priceAlertModal ) {
             priceAlertModal.style.display = 'none'; currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;
        }
        if (auctionBidModal && auctionBidModal.style.display === 'block' && event.target === auctionBidModal ) { 
             auctionBidModal.style.display = 'none'; currentAuctionItemForBid = null;
        }
        if (notificationPopup && notificationPopup.style.display === 'block' && notificationBellContainer && !notificationBellContainer.contains(event.target) && event.target !== notificationBellIcon) {
            notificationPopup.style.display = 'none';
        }
        if (suggestionsContainer && suggestionsContainer.style.display === 'block' && productNameInput && !productNameInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    if (setLocationButton && locationInput && currentLocationDisplay ) {
        setLocationButton.addEventListener('click', () => { 
            const newLocation = locationInput.value.trim();
            if (newLocation) {
                userLocation = newLocation; localStorage.setItem('foodCheckUserLocation', userLocation); updateUserLocationDisplay();
                alert(`동네가 '${userLocation}'(으)로 설정되었습니다.`); locationInput.value = '';
                if(externalSearchLinksContainer) externalSearchLinksContainer.innerHTML = ''; 
                showResultsPlaceholder('새로운 동네가 설정되었습니다. 상품을 검색해보세요.');
            } else { alert('동네를 입력해주세요.');}
        });
    }  else { console.warn("Location setting elements not all found for event listeners."); }

    if (productNameInput && suggestionsContainer) {
        productNameInput.addEventListener('input', () => { 
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
    } else { console.warn("Product name input or suggestions container not found for event listeners."); }

    if (searchButton && productNameInput && quantityInput && resultsContainer ) {
        searchButton.addEventListener('click', () => {
            console.log("Search button clicked.");
            const productName = productNameInput.value.trim(); const quantity = quantityInput.value.trim();
            if (!productName || !quantity) { alert('상품명과 수량을 모두 입력해주세요.'); return; }
            const numQuantity = parseInt(quantity);
            if (isNaN(numQuantity) || numQuantity < 1) { alert('수량은 1 이상의 숫자로 입력해주세요.'); quantityInput.value = '1'; return; }
            showResultsPlaceholder("결과를 불러오는 중입니다..."); 
            displayExternalSearchLinks(productName);
            console.log(`검색: 상품명='${productName}', 수량=${numQuantity}, 동네=${userLocation}`);
            setTimeout(() => {
                console.log("setTimeout: Calling fetchLocalMartResults");
                try { fetchLocalMartResults(productName, numQuantity, userLocation); }
                catch (error) { console.error("Error in fetchLocalMartResults execution:", error); showResultsPlaceholder("오류가 발생하여 검색 결과를 가져오지 못했습니다."); }
            }, 500);
        });
    } else { console.warn("Search related elements not all found for event listeners."); }

    if (mainFavoritesButton) {
        mainFavoritesButton.addEventListener('click', () => { if(externalSearchLinksContainer) externalSearchLinksContainer.innerHTML = ''; displayFavoritesList(); });
    } else { console.warn("Main favorites button not found for event listener."); }

    if (localSalesButton) {
        localSalesButton.addEventListener('click', () => { if(externalSearchLinksContainer) externalSearchLinksContainer.innerHTML = ''; displayRegularLocalSales(); });
    } else { console.warn("Local sales button not found for event listener."); }

    if (flashSalesButton) {
        flashSalesButton.addEventListener('click', () => { if(externalSearchLinksContainer) externalSearchLinksContainer.innerHTML = ''; displayFlashSales(); });
    } else { console.warn("Flash sales button not found for event listener."); }
    
    if (auctionsButton) { 
        auctionsButton.addEventListener('click', () => {
            if(externalSearchLinksContainer) externalSearchLinksContainer.innerHTML = '';
            displayAuctions();
        });
    } else { console.warn("Auctions button not found for event listener."); }

    if (closePriceAlertModalButton && priceAlertModal) {
        closePriceAlertModalButton.addEventListener('click', () => { priceAlertModal.style.display = 'none'; currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;});
    } else { console.warn("Price alert modal close button or modal itself not found for event listeners."); }

    if (saveDesiredPriceButton && desiredPriceInput && priceAlertModal && modalProductName && modalCurrentPrice) {
        saveDesiredPriceButton.addEventListener('click', () => {
            const desiredPrice = parseFloat(desiredPriceInput.value);
            if (isNaN(desiredPrice) || desiredPrice <= 0) { alert('유효한 원하는 가격을 입력해주세요.'); return; }
            if (currentItemForPriceAlert && currentFavButtonForPriceAlert) {
                const itemData = currentItemForPriceAlert; const buttonEl = currentFavButtonForPriceAlert;
                const favId = itemData.id + '_' + (itemData.quantity || 1);
                const favDataObject = {
                    favId: favId, platformId: itemData.id, name: itemData.name, 
                    quantity: itemData.quantity || 1, platform: itemData.platform, 
                    url: itemData.url, price: itemData.price, category: itemData.category,
                    onSale: itemData.onSale, salePrice: itemData.salePrice,
                    unitPrice: itemData.unitPrice, martLocation: itemData.martLocation,
                    deliveryAvailable: itemData.deliveryAvailable,
                    desiredPrice: desiredPrice, alertActive: true, 
                    addedDate: new Date().toISOString(), originalItemName: itemData.originalItemName
                };
                const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);
                if (favoriteIndex === -1) { favorites.push(favDataObject); }
                else { favorites[favoriteIndex] = { ...favorites[favoriteIndex], ...favDataObject }; }
                localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
                updateMainFavoritesButtonText();
                buttonEl.textContent = '⭐'; buttonEl.title = '즐겨찾기에서 제거 / 알림 수정';
                const displayItemName = itemData.originalItemName || (itemData.name && typeof itemData.name ==='string' ? itemData.name.split(' (')[0].trim() : "알 수 없는 상품");
                addNotification(`'${displayItemName}' 가격 알림: ${desiredPrice.toLocaleString()}원 이하 설정`);
                priceAlertModal.style.display = 'none';
                currentItemForPriceAlert = null; currentFavButtonForPriceAlert = null;
                if (desiredPriceInput) desiredPriceInput.value = '';
            }
        });
    } else { console.warn("Save desired price button or related modal elements not all found for event listeners."); }

    if (closeAuctionBidModalButton && auctionBidModal) {
        closeAuctionBidModalButton.addEventListener('click', () => {
            auctionBidModal.style.display = 'none';
            currentAuctionItemForBid = null;
        });
    } else { console.warn("Auction bid modal close button or modal itself not found for event listeners."); }

    if (submitBidButton && bidAmountInput && auctionBidModal && auctionModalTitle && auctionModalProductName && auctionModalQuantity && auctionModalCurrentBid) {
        submitBidButton.addEventListener('click', () => {
            if (!currentAuctionItemForBid) {console.warn("currentAuctionItemForBid is null"); return;}
            const bidAmount = parseFloat(bidAmountInput.value);
            const currentEffectiveBid = Number(currentAuctionItemForBid.currentBid || currentAuctionItemForBid.startPrice || 0);
            if (isNaN(bidAmount) || bidAmount <= currentEffectiveBid) {
                alert(`입찰가는 현재 최고가(${currentEffectiveBid.toLocaleString()}원)보다 높아야 합니다.`);
                return;
            }
            let auctions = loadDataFromLocalStorage(auctionsLocalStorageKey, []);
            const auctionIndex = auctions.findIndex(auc => auc && auc.id === currentAuctionItemForBid.id);
            if (auctionIndex > -1) {
                auctions[auctionIndex].currentBid = bidAmount;
                auctions[auctionIndex].bidCount = (auctions[auctionIndex].bidCount || 0) + 1;
                if (!auctions[auctionIndex].bids) auctions[auctionIndex].bids = [];
                auctions[auctionIndex].bids.push({ bidder: "나(User123-시뮬레이션)", amount: bidAmount, time: new Date().toISOString() });
                localStorage.setItem(auctionsLocalStorageKey, JSON.stringify(auctions));
                addNotification(`'${auctions[auctionIndex].productName}' 경매에 ${bidAmount.toLocaleString()}원 입찰 완료!`);
                displayAuctions();
            }
            auctionBidModal.style.display = 'none';
            currentAuctionItemForBid = null;
            bidAmountInput.value = '';
        });
    } else { console.warn("Submit bid button or related modal elements not all found for event listeners."); }
    
    function handleFavoriteClick(itemData, buttonEl) {
        console.log("handleFavoriteClick called for item:", itemData);
        if (!itemData || typeof itemData.id === 'undefined') {
            console.error("Invalid itemData (missing id) passed to handleFavoriteClick", itemData);
            addNotification("즐겨찾기 처리 중 오류가 발생했습니다. (상품 정보 부족)");
            return;
        }
        const favId = itemData.id + '_' + (itemData.quantity || 1);
        const favoriteIndex = favorites.findIndex(fav => fav && fav.favId === favId);

        if (favoriteIndex === -1) { 
            currentItemForPriceAlert = itemData; currentFavButtonForPriceAlert = buttonEl;
            const itemNameForModal = itemData.originalItemName || (itemData.name && typeof itemData.name ==='string' ? itemData.name.split(' (')[0].trim() : "상품 정보");
            
            if(!priceAlertModal || !modalProductName || !modalCurrentPrice || !desiredPriceInput) {
                console.error("Price alert modal DOM elements are missing in handleFavoriteClick.");
                addNotification("가격 알림 설정 창을 여는데 문제가 발생했습니다.");
                return;
            }
            modalProductName.textContent = itemNameForModal;
            modalCurrentPrice.textContent = `${Number(itemData.price || 0).toLocaleString()}원 (수량: ${itemData.quantity || 1}개)`;
            desiredPriceInput.value = ''; 
            const currentTotalItemPrice = Number(itemData.price) || 0;
            const suggestedPrice = Math.floor(currentTotalItemPrice * 0.9 / 100) * 100;
            desiredPriceInput.placeholder = `예: ${suggestedPrice > 0 ? suggestedPrice.toLocaleString() : (currentTotalItemPrice > 0 ? Math.floor(currentTotalItemPrice / 2 / 100) * 100 : '1000' ) }`;
            priceAlertModal.style.display = 'block';
            if(desiredPriceInput) desiredPriceInput.focus();
        } else { 
            const removedItem = favorites[favoriteIndex];
            const removedItemName = removedItem.originalItemName || (removedItem.name && typeof removedItem.name === 'string' ? removedItem.name.split(' (')[0].trim() : "해당 상품");
            favorites.splice(favoriteIndex, 1);
            localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
            updateMainFavoritesButtonText();
            if(buttonEl) {
                buttonEl.textContent = '☆';
                buttonEl.title = '즐겨찾기 및 가격 알림 설정';
            }
            addNotification(`'${removedItemName}' 즐겨찾기 및 알림 해제`);
        }
    }

    function displayExternalSearchLinks(searchTerm) { 
        if(!externalSearchLinksContainer) {console.warn("externalSearchLinksContainer not found for displayExternalSearchLinks"); return;}
        externalSearchLinksContainer.innerHTML = ''; if (!searchTerm) return;
        const coupangBtn = document.createElement('a'); coupangBtn.href = `https://www.coupang.com/np/search?q=${encodeURIComponent(searchTerm)}`;
        coupangBtn.textContent = `📦 ${searchTerm} (쿠팡에서 보기)`; coupangBtn.target = '_blank'; coupangBtn.classList.add('external-link-button', 'coupang');
        const naverBtn = document.createElement('a'); naverBtn.href = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(searchTerm)}`;
        naverBtn.textContent = `🛍️ ${searchTerm} (네이버쇼핑에서 보기)`; naverBtn.target = '_blank'; naverBtn.classList.add('external-link-button', 'naver');
        externalSearchLinksContainer.appendChild(coupangBtn); externalSearchLinksContainer.appendChild(naverBtn);
    }

    function fetchLocalMartResults(productName, quantity, location) {
        console.log("fetchLocalMartResults. productName:", productName, " Loc:", location);
        if (!resultsContainer) { console.error("resultsContainer is null, cannot display results."); return; }
        try {
            const baseProductName = productName.toLowerCase();
            const registeredMartProducts = loadDataFromLocalStorage(productsLocalStorageKey, []);
            console.log("Registered mart products:", JSON.stringify(registeredMartProducts, null, 2));
            
            let filteredMartProducts = registeredMartProducts.filter(p => 
                p && p.name && typeof p.name === 'string' && p.name.toLowerCase().includes(baseProductName)
            );
            console.log("After name filter, mart products count:", filteredMartProducts.length);

            if (location && location !== "미설정") {
                const currentLocLower = location.toLowerCase();
                filteredMartProducts = filteredMartProducts.filter(p => {
                    const itemMartLocationLower = p.martLocation ? p.martLocation.toLowerCase() : "";
                    if (!itemMartLocationLower) return false;
                    return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
                });
            }
            console.log("After location filter, mart products count:", filteredMartProducts.length);

            let processedResults = [];
            filteredMartProducts.forEach(item => {
                if (!item || typeof item.price === 'undefined' || item.price === null) { console.warn("Skipping item in fetchLocalMartResults (no price):", item); return; }
                const itemUnitPrice = Number(item.price) || 0;
                const itemSalePrice = (item.onSale && typeof item.salePrice === 'number') ? Number(item.salePrice) : null;
                let unitPriceToUse = (itemSalePrice !== null && itemSalePrice < itemUnitPrice) ? itemSalePrice : itemUnitPrice;
                let itemTotalPrice = unitPriceToUse * quantity;
                let discountAppliedInfo = "";
                if (typeof item.discountUnit === 'number' && item.discountUnit > 0 && typeof item.discountAmount === 'number' && item.discountAmount > 0 && quantity >= item.discountUnit) {
                    const numDiscounts = Math.floor(quantity / item.discountUnit);
                    const totalDiscountValue = numDiscounts * item.discountAmount;
                    itemTotalPrice -= totalDiscountValue;
                    discountAppliedInfo = ` (${numDiscounts * item.discountUnit}개 구매 시 ${totalDiscountValue.toLocaleString()}원 할인)`;
                }
                let effectiveUnitPrice = quantity > 0 ? itemTotalPrice / quantity : 0;
                let currentDeliveryFee = 0; let deliveryFeeText = "배달 지원 안함";
                let finalEta = (typeof item.eta === 'string' && item.eta) ? item.eta : (item.deliveryAvailable ? '마트 확인' : '매장픽업');

                if (item.deliveryAvailable) {
                    currentDeliveryFee = Number(item.deliveryFee) || 0;
                    const minOrder = Number(item.minOrderForFreeDelivery) || 0;
                    if (minOrder > 0 && itemTotalPrice >= minOrder) currentDeliveryFee = 0;
                    deliveryFeeText = currentDeliveryFee === 0 ? "무료배송" : `배송비 ${currentDeliveryFee.toLocaleString()}원`;
                } else { currentDeliveryFee = 0; deliveryFeeText = "매장 픽업"; finalEta = "매장 픽업"; }
                let finalPrice = itemTotalPrice + (item.deliveryAvailable ? currentDeliveryFee : 0);

                processedResults.push({
                    id: item.id, martId: item.martId || martIdForConsumer, 
                    platform: `우리동네마트 (${item.martLocation || '?'})`, 
                    name: `${item.name || '?'} ${quantity}개${discountAppliedInfo}`, originalItemName: item.name || '?', 
                    unitPrice: itemUnitPrice, stock: Number(item.stock) || 0,
                    manufacturingDate: item.manufacturingDate, expiryDate: item.expiryDate,
                    onSale: item.onSale, salePrice: itemSalePrice, category: item.category, 
                    martLocation: item.martLocation, quantity: quantity, price: finalPrice, 
                    deliveryFeeText, pricePerUnitText: `(개당 ${Math.round(effectiveUnitPrice).toLocaleString()}원)`,
                    eta: finalEta, url: `#martProd_${item.id}`, deliveryAvailable: item.deliveryAvailable
                });
            });
            console.log("Processed results for display (Local Mart Search):", JSON.stringify(processedResults, null, 2));
            processedResults.sort((a, b) => (a.price || 0) - (b.price || 0));
            displayLocalMartResults(processedResults);
        } catch (e) { console.error("Error in fetchLocalMartResults:", e); showResultsPlaceholder("상품 정보 처리 오류"); }
    }

    function displayLocalMartResults(results) { 
        console.log("displayLocalMartResults called with results count:", results ? results.length : 0);
        if (!resultsContainer) { console.error("resultsContainer is null in displayLocalMartResults"); return; }
        try {
            resultsContainer.innerHTML = ''; 
            if (!results || results.length === 0) { showResultsPlaceholder("해당 조건의 동네 마트 상품이 없습니다."); return; }
            results.forEach((item, index) => { 
                if (!item || typeof item.id === 'undefined') { console.warn("Skipping invalid item for display in displayLocalMartResults:", item); return; }
                const itemDiv = document.createElement('div'); itemDiv.classList.add('result-item'); if(item.onSale && item.salePrice) itemDiv.classList.add('sale-item');
                const rank = document.createElement('span'); rank.classList.add('rank'); rank.textContent = index + 1;
                const details = document.createElement('div'); details.classList.add('product-details');
                const titleLink = document.createElement('a'); titleLink.classList.add('product-title'); titleLink.href = item.url || '#'; titleLink.textContent = item.name; titleLink.target = '_blank';
                const qtyP = document.createElement('p'); qtyP.classList.add('product-meta'); qtyP.textContent = `수량: ${item.quantity || 0}개`;
                const priceP = document.createElement('p'); priceP.classList.add('product-meta');
                let priceHTML = `총 가격: <strong>${Number(item.price || 0).toLocaleString()}원</strong>`;
                const originalItemTotalPrice = (item.unitPrice || 0) * (item.quantity || 0);
                if (item.onSale && typeof item.salePrice === 'number' && typeof item.unitPrice === 'number' && item.salePrice < item.unitPrice) {
                    const deliveryCostForOriginal = item.deliveryAvailable ? (item.deliveryFeeText.startsWith("무료") || item.deliveryFeeText.includes("픽업") ? 0 : parseFloat(item.deliveryFeeText.replace(/[^0-9.-]+/g,"") || 0)) : 0;
                    if (originalItemTotalPrice > 0 && item.price < (originalItemTotalPrice + deliveryCostForOriginal )) {
                         priceHTML += ` <span class="original-price">(원래 상품가: ${originalItemTotalPrice.toLocaleString()}원)</span>`;
                    }
                }
                priceHTML += ` <span style="font-size:0.9em; color: #6c757d;">(${item.deliveryFeeText || ''}, ${item.pricePerUnitText || ''})</span>`;
                priceP.innerHTML = priceHTML;
                const stockP = document.createElement('p'); stockP.classList.add('product-meta'); stockP.textContent = `남은 재고: ${item.stock || 0}개`;
                details.appendChild(stockP);
                if(item.manufacturingDate) { const mfgP = document.createElement('p'); mfgP.classList.add('product-meta'); mfgP.textContent = `제조: ${item.manufacturingDate}`; details.appendChild(mfgP); }
                if(item.expiryDate) { const expP = document.createElement('p'); expP.classList.add('product-meta'); expP.textContent = `유통기한: ${item.expiryDate}`; details.appendChild(expP); }
                const etaP = document.createElement('p'); etaP.classList.add('product-meta'); etaP.textContent = `도착 정보: ${item.eta || '정보 없음'}`;
                const platformLink = document.createElement('a'); platformLink.classList.add('product-platform-link');
                const martNameForLink = (item.platform || '').split('(')[0].trim() || "우리동네마트";
                platformLink.href = `mart_page.html?martId=${encodeURIComponent(item.martId || martIdForConsumer)}&martName=${encodeURIComponent(martNameForLink)}&martLocation=${encodeURIComponent(item.martLocation || '')}`;
                platformLink.textContent = `판매처: ${item.platform || '정보 없음'}`; platformLink.target = '_blank';
                if(item.platform && (item.platform.toLowerCase().includes("마트") || item.platform.toLowerCase().includes("슈퍼"))) { platformLink.style.color = '#28a745'; platformLink.style.fontWeight = 'bold';}
                const purchaseBtn = document.createElement('button'); purchaseBtn.textContent = '구매하기'; purchaseBtn.classList.add('purchase-btn');
                purchaseBtn.style.cssText = "margin-top: 8px; padding: 6px 10px; font-size: 0.9em; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;";
                purchaseBtn.addEventListener('click', () => { simulatePurchase(item.id, item.martId || martIdForConsumer, item.quantity, item.stock); });
                const favBtn = document.createElement('button'); const favId = item.id + '_' + (item.quantity || 1);
                const isFav = favorites.some(f => f.favId === favId);
                favBtn.textContent = isFav ? '⭐' : '☆'; favBtn.title = isFav ? '즐겨찾기 제거/수정' : '즐겨찾기/가격알림';
                favBtn.style.cssText = "background:none;border:none;font-size:1.5em;cursor:pointer;padding:0 5px;position:absolute;top:10px;right:10px;";
                favBtn.addEventListener('click', (e) => { e.stopPropagation(); handleFavoriteClick(item, favBtn); });
                
                details.appendChild(titleLink); details.appendChild(qtyP); details.appendChild(priceP); 
                details.appendChild(etaP); details.appendChild(platformLink); details.appendChild(purchaseBtn);
                itemDiv.appendChild(rank); itemDiv.appendChild(details); itemDiv.appendChild(favBtn);
                resultsContainer.appendChild(itemDiv);
            });
        } catch(e) { console.error("Error in displayLocalMartResults rendering:", e); showResultsPlaceholder("결과 표시 오류");}
    }

    function simulatePurchase(productId, martOwnerId, purchasedQuantity, currentStock) { 
        console.log(`Simulating purchase: productId=${productId}, martOwnerId=${martOwnerId}, quantity=${purchasedQuantity}, stock=${currentStock}`);
        if (!productId || !martOwnerId) { console.error("Missing productId or martOwnerId in simulatePurchase"); addNotification("구매 처리 중 오류 발생 (상품ID 누락)"); return; }
        const numPurchasedQuantity = Number(purchasedQuantity);
        const numCurrentStock = Number(currentStock);

        if (isNaN(numPurchasedQuantity) || numPurchasedQuantity <= 0) { alert("구매 수량이 올바르지 않습니다."); return; }
        if (isNaN(numCurrentStock)) { alert("현재 재고 정보를 알 수 없습니다."); return; }
        if (numPurchasedQuantity > numCurrentStock) { alert(`재고 부족! 현재 ${numCurrentStock}개 남아있습니다.`); return; }
        
        const storageKey = `foodCheckMartProducts_${martOwnerId}`;
        let martProducts = loadDataFromLocalStorage(storageKey, []);
        const productIndex = martProducts.findIndex(p => p && p.id === productId);

        if (productIndex > -1) {
            const originalProduct = martProducts[productIndex];
            originalProduct.stock = Math.max(0, (Number(originalProduct.stock) || 0) - numPurchasedQuantity);
            localStorage.setItem(storageKey, JSON.stringify(martProducts));
            addNotification(`'${originalProduct.name}' ${numPurchasedQuantity}개 구매 완료 (재고: ${originalProduct.stock}개) - 실제 결제X`);
            
            const currentSearchTerm = productNameInput ? productNameInput.value.trim() : null; 
            const currentQuantityStr = quantityInput ? quantityInput.value.trim() : null;
            if (currentSearchTerm && currentQuantityStr) {
                const currentQuantityNum = parseInt(currentQuantityStr);
                if (!isNaN(currentQuantityNum) && currentQuantityNum > 0) {
                    fetchLocalMartResults(currentSearchTerm, currentQuantityNum, userLocation); 
                }
            }
        } else { console.error("Product not found for stock update:", productId); addNotification("구매 처리 중 상품 정보를 찾지 못했습니다.");}
    }

    function displayFavoritesList() { 
        if(!resultsContainer || !externalSearchLinksContainer) { console.warn("Required elements missing for displayFavoritesList"); return; }
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        if (favorites.length === 0) { showResultsPlaceholder("즐겨찾기 한 상품이 없습니다."); return; }
        const title = document.createElement('h2'); title.textContent = '내 즐겨찾기 목록'; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        favorites.forEach(favItem => {
            if(!favItem || typeof favItem.platformId === 'undefined') { console.warn("Skipping invalid favItem:", favItem); return;}
            const favItemDiv = document.createElement('div'); favItemDiv.classList.add('result-item'); if (favItem.onSale) favItemDiv.classList.add('sale-item');
            const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
            const productTitleLink = document.createElement('a'); productTitleLink.classList.add('product-title'); productTitleLink.href = favItem.url || '#'; productTitleLink.textContent = favItem.name; productTitleLink.target = '_blank';
            const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform'); platformSpan.textContent = `판매처: ${favItem.platform || '?'}`;
            if (favItem.platform && (favItem.platform.includes("마트") || favItem.platform.includes("슈퍼") || favItem.platform.includes("우리동네"))) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold';}
            const quantitySpan = document.createElement('p'); quantitySpan.classList.add('product-meta'); quantitySpan.textContent = `수량: ${favItem.quantity || 1}개`;
            if (typeof favItem.price !== 'undefined') {
                const priceSpan = document.createElement('p'); priceSpan.classList.add('product-meta');
                let priceHtmlFav = `저장시 총 가격: <strong>${Number(favItem.price).toLocaleString()}원</strong>`;
                if (typeof favItem.desiredPrice === 'number') priceHtmlFav += ` (알림 설정가: ${Number(favItem.desiredPrice).toLocaleString()}원 이하)`;
                priceSpan.innerHTML = priceHtmlFav; productDetailsDiv.appendChild(priceSpan);
            }
            if (favItem.category) { const categorySpan = document.createElement('p'); categorySpan.classList.add('product-meta'); categorySpan.textContent = `카테고리: ${favItem.category}`; productDetailsDiv.appendChild(categorySpan); }
            if (favItem.martLocation) { const locSpan = document.createElement('p'); locSpan.classList.add('product-meta'); locSpan.textContent = `마트 위치: ${favItem.martLocation}`; productDetailsDiv.appendChild(locSpan); }
            const favActionButton = document.createElement('button'); favActionButton.textContent = '⭐'; favActionButton.title = '즐겨찾기에서 제거 / 알림 수정';
            favActionButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
            favActionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemDataForModal = { 
                    id: favItem.platformId, name: favItem.name, 
                    originalItemName: favItem.originalItemName || (favItem.name ? favItem.name.split(' (')[0].trim() : "상품"),
                    quantity: favItem.quantity || 1, price: favItem.price, 
                    platform: favItem.platform, url: favItem.url, category: favItem.category,
                    martLocation: favItem.martLocation, unitPrice: favItem.unitPrice, 
                    onSale: favItem.onSale, salePrice: favItem.salePrice,
                    deliveryAvailable: typeof favItem.deliveryAvailable !== 'undefined' ? favItem.deliveryAvailable : true 
                }; 
                handleFavoriteClick(itemDataForModal, favActionButton);
            });
            productDetailsDiv.appendChild(productTitleLink); productDetailsDiv.appendChild(platformSpan); productDetailsDiv.appendChild(quantitySpan);
            favItemDiv.appendChild(productDetailsDiv); favItemDiv.appendChild(favActionButton);
            resultsContainer.appendChild(favItemDiv);
        });
    }
    
    function displayRegularLocalSales() {
        console.log("displayRegularLocalSales. UserLoc:", userLocation);
        if(!resultsContainer || !externalSearchLinksContainer) { console.warn("Required elements missing for displayRegularLocalSales"); return; }
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        const registeredMartProducts = loadDataFromLocalStorage(productsLocalStorageKey, []);
        console.log("Registered mart products for regular sales:", JSON.stringify(registeredMartProducts, null, 2));

        let regularSaleItems = registeredMartProducts.filter(p => p && p.onSale && typeof p.salePrice === 'number' && p.salePrice > 0 && typeof p.price === 'number' && p.salePrice < p.price);
        console.log("Initial regular sale items count:", regularSaleItems.length);

        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            regularSaleItems = regularSaleItems.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower) return false;
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
            });
        }
        console.log("After location filter, regular sale items count:", regularSaleItems.length);

        if (regularSaleItems.length === 0) { showResultsPlaceholder(`현재 '${userLocation || '미설정'}' 동네에 진행 중인 일반 세일 상품이 없습니다.`); return; }
        const title = document.createElement('h2'); title.textContent = `'${userLocation || '전체 동네'}' 일반 세일 상품`; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        
        const salesByCategory = regularSaleItems.reduce((acc, item) => {
            const category = item.category || "기타"; if (!acc[category]) acc[category] = [];
            acc[category].push(item); return acc;
        }, {});
        console.log("Regular sales grouped by category:", salesByCategory);

        for (const category in salesByCategory) {
            const categoryTitle = document.createElement('h3'); categoryTitle.textContent = category; categoryTitle.classList.add('category-title'); resultsContainer.appendChild(categoryTitle);
            salesByCategory[category].forEach(item => { // item은 martProduct 객체
                if (!item || !item.id) { console.warn("Skipping invalid regular sale item for display:", item); return; }
                const saleItemDiv = document.createElement('div'); saleItemDiv.classList.add('result-item', 'sale-item');
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleText = document.createElement('p'); productTitleText.classList.add('product-title'); productTitleText.style.cursor = 'default';
                productTitleText.textContent = item.name || '이름없음';
                const priceInfo = document.createElement('p'); priceInfo.classList.add('product-meta');
                priceInfo.innerHTML = `세일 가격: <strong style="color:red;">${Number(item.salePrice || 0).toLocaleString()}원</strong> <span class="original-price">${Number(item.price || 0).toLocaleString()}원</span> (개당)`;
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform');
                platformSpan.textContent = `판매처: 우리동네마트 (${item.martLocation || '?'})`; 
                if (item.martLocation && (item.martLocation.includes("마트") || item.martLocation.includes("슈퍼"))) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold';}
                const stockSpan = document.createElement('p'); stockSpan.classList.add('product-meta'); stockSpan.textContent = `재고: ${item.stock || 0}개`;
                const itemFavoriteButton = document.createElement('button'); const favId = item.id + '_1'; 
                const tempItemDataForFav = { 
                    id: item.id, name: `${item.name || '?'} (일반세일)`, quantity: 1, 
                    platform: `우리동네마트 (${item.martLocation || '?'})`, url: `#regularSale_${item.id}`, 
                    price: item.salePrice, unitPrice: item.price, onSale: true, salePrice: item.salePrice, 
                    category: item.category, martLocation: item.martLocation, 
                    deliveryAvailable: item.deliveryAvailable, originalItemName: item.name || '?'
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

    function displayFlashSales() {
        console.log("displayFlashSales called. UserLoc:", userLocation);
        if(!resultsContainer || !externalSearchLinksContainer) { console.warn("Required DOM elements missing for displayFlashSales"); return; }
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        
        const flashSaleItemsFromStorage = loadDataFromLocalStorage(flashSalesLocalStorageKey, []);
        console.log("Raw flash sale items from localStorage for displayFlashSales:", JSON.stringify(flashSaleItemsFromStorage, null, 2));

        let currentFlashSales = flashSaleItemsFromStorage.filter(fs => fs && fs.saleEndsAt && (new Date(fs.saleEndsAt).getTime() > new Date().getTime()));
        console.log("Active (non-expired) flash sales:", currentFlashSales.length);

        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            currentFlashSales = currentFlashSales.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower) return false;
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower);
            });
        }
        console.log("After location filter, flash sales to display:", currentFlashSales.length);

        if (currentFlashSales.length === 0) { showResultsPlaceholder(`현재 '${userLocation || '미설정'}' 동네에 진행 중인 마감 임박 세일 상품이 없습니다.`); return; }
        
        const title = document.createElement('h2'); title.textContent = `'${userLocation || '전체 동네'}' 마감 임박 세일!`; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        const salesByCategory = currentFlashSales.reduce((acc, item) => {
            const category = item.category || "기타"; if (!acc[category]) acc[category] = [];
            acc[category].push(item); return acc;
        }, {});
        
        for (const category in salesByCategory) {
            const categoryTitle = document.createElement('h3'); categoryTitle.textContent = category; categoryTitle.classList.add('category-title'); resultsContainer.appendChild(categoryTitle);
            salesByCategory[category].forEach(item => { 
                if (!item || !item.id) { console.warn("Skipping invalid flash sale item for display:", item); return; }
                const saleItemDiv = document.createElement('div'); saleItemDiv.classList.add('result-item', 'sale-item');
                const productDetailsDiv = document.createElement('div'); productDetailsDiv.classList.add('product-details');
                const productTitleText = document.createElement('p'); productTitleText.classList.add('product-title'); productTitleText.style.cursor = 'default';
                productTitleText.textContent = `${item.productName || '?'} (마감세일!)`;
                const priceInfo = document.createElement('p'); priceInfo.classList.add('product-meta');
                priceInfo.innerHTML = `마감 세일가: <strong style="color:red;">${Number(item.flashSalePrice || 0).toLocaleString()}원</strong> <span class="original-price">${Number(item.originalPrice || 0).toLocaleString()}원</span> (개당)`;
                const platformSpan = document.createElement('p'); platformSpan.classList.add('product-platform');
                platformSpan.textContent = `판매처: 우리동네마트 (${item.martLocation || '?'})`; 
                if (item.martLocation && (item.martLocation.includes("마트") || item.martLocation.includes("슈퍼"))) { platformSpan.style.color = '#28a745'; platformSpan.style.fontWeight = 'bold'; }
                const stockSpan = document.createElement('p'); stockSpan.classList.add('product-meta'); stockSpan.textContent = `남은 세일 재고: ${item.flashSaleStock || 0}개 (1인당 ${item.maxPerPerson || 0}개 구매 가능)`;
                const endTime = new Date(item.saleEndsAt); const now = new Date();
                const timeLeftMs = endTime.getTime() - now.getTime();
                const timeLeftMinutes = Math.max(0, Math.floor(timeLeftMs / (1000 * 60)));
                const timeInfoSpan = document.createElement('p'); timeInfoSpan.classList.add('product-meta');
                timeInfoSpan.textContent = `종료까지: 약 ${timeLeftMinutes}분 (종료: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                const purchaseFlashSaleButton = document.createElement('button'); purchaseFlashSaleButton.textContent = '선착순 구매하기'; purchaseFlashSaleButton.classList.add('purchase-btn');
                purchaseFlashSaleButton.style.cssText = "margin-top: 8px; padding: 6px 10px; font-size: 0.9em; background-color: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;";
                purchaseFlashSaleButton.addEventListener('click', () => { simulateFlashSalePurchase(item.id, item.flashSaleStock, item.maxPerPerson); });
                const itemFavoriteButton = document.createElement('button'); const favId = item.productId + '_1';
                const tempItemDataForFav = {
                    id: item.productId, name: `${item.productName || '?'} (마감세일)`, quantity: 1, 
                    platform: `우리동네마트 (${item.martLocation || '?'})`, url: `#flashsale_${item.id}`, 
                    price: item.flashSalePrice, unitPrice: item.originalPrice, onSale: true, 
                    salePrice: item.flashSalePrice, category: item.category, martLocation: item.martLocation, 
                    deliveryAvailable: false, // 마감세일은 기본적으로 배달 불가로 가정 또는 원본 상품 정보 참조 필요
                    originalItemName: item.productName || '?'
                };
                const isFavorited = favorites.some(fav => fav.favId === favId);
                itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆';
                itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거 / 알림 수정' : '즐겨찾기 및 가격 알림 설정';
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

    function simulateFlashSalePurchase(flashSaleId, currentFlashStock, maxPerUser) { 
        console.log(`Simulating flash sale purchase: flashSaleId=${flashSaleId}, stock=${currentFlashStock}, maxPerUser=${maxPerUser}`);
        if (!flashSaleId) { console.error("flashSaleId is missing"); return; }
        const quantityToBuy = 1; 
        const numMaxPerUser = Number(maxPerUser) || 1;
        const numCurrentFlashStock = Number(currentFlashStock) || 0;

        if (quantityToBuy > numMaxPerUser) { alert(`1인당 최대 ${numMaxPerUser}개까지만 구매 가능합니다.`); return; }
        if (quantityToBuy > numCurrentFlashStock) { alert(`죄송합니다. 해당 상품의 마감 세일 재고(${numCurrentFlashStock}개)가 부족합니다.`); return; }
        
        let flashSales = loadDataFromLocalStorage(flashSalesLocalStorageKey, []);
        const saleIndex = flashSales.findIndex(fs => fs && fs.id === flashSaleId);
        if (saleIndex > -1) {
            const boughtItem = flashSales[saleIndex];
            boughtItem.flashSaleStock = (Number(boughtItem.flashSaleStock) || 0) - quantityToBuy;
            const boughtItemName = boughtItem.productName || '?';
            if (boughtItem.flashSaleStock <= 0) {
                flashSales.splice(saleIndex, 1); 
                addNotification(`'${boughtItemName}' 마감 세일 상품이 모두 판매되었습니다!`);
            } else {
                addNotification(`'${boughtItemName}' 마감 세일 상품 ${quantityToBuy}개 구매 완료! (남은 세일 재고: ${boughtItem.flashSaleStock}개) - 실제 결제X`);
            }
            localStorage.setItem(flashSalesLocalStorageKey, JSON.stringify(flashSales));
            displayFlashSales(); 
        } else { alert("마감 세일 상품 정보를 찾지 못했습니다.");}
    }

    function displayAuctions() {
        console.log("displayAuctions. UserLoc:", userLocation);
        if(!resultsContainer || !externalSearchLinksContainer || !auctionBidModal || !auctionModalTitle || !bidAmountInput) {console.warn("Required DOM elements for displayAuctions missing"); return;}
        externalSearchLinksContainer.innerHTML = ''; resultsContainer.innerHTML = '';
        
        const auctionItems = loadDataFromLocalStorage(auctionsLocalStorageKey, []);
        console.log("Raw auction items from localStorage:", JSON.stringify(auctionItems, null, 2));

        let currentAuctions = auctionItems.filter(auc => auc && auc.auctionEndsAt && (new Date(auc.auctionEndsAt).getTime() > new Date().getTime()));
        console.log("Active auctions:", currentAuctions.length);

        if (userLocation && userLocation !== "미설정") {
            const currentLocLower = userLocation.toLowerCase();
            currentAuctions = currentAuctions.filter(item => {
                const itemMartLocationLower = item.martLocation ? item.martLocation.toLowerCase() : "";
                if (!itemMartLocationLower && currentLocLower !== '전국') return false; 
                return itemMartLocationLower.includes(currentLocLower) || currentLocLower.includes(itemMartLocationLower) || currentLocLower === '전국';
            });
        }
        console.log("After location filter, auctions:", currentAuctions.length);

        if (currentAuctions.length === 0) { showResultsPlaceholder(`현재 '${userLocation || '미설정'}' 동네에 진행중인 경매 없음.`); return; }
        
        const title = document.createElement('h2'); title.textContent = `'${userLocation || '전체 동네'}' 식자재 경매`; title.style.textAlign = 'center'; title.style.marginBottom = '20px'; resultsContainer.appendChild(title);
        currentAuctions.sort((a,b) => new Date(a.auctionEndsAt).getTime() - new Date(b.auctionEndsAt).getTime());
        
        currentAuctions.forEach(item => {
            if(!item || !item.id) { console.warn("Skipping invalid auction item for display:", item); return; }
            const auctionItemDiv = document.createElement('div'); auctionItemDiv.classList.add('auction-list-item');
            const titleP = document.createElement('p'); titleP.classList.add('product-title'); titleP.textContent = `${item.productName || '?'} (수량: ${item.quantity || 0}개)`;
            const martLocP = document.createElement('p'); martLocP.classList.add('product-meta'); martLocP.textContent = `판매 마트: 우리동네마트 (${item.martLocation || '?'})`;
            const startPriceP = document.createElement('p'); startPriceP.classList.add('product-meta'); startPriceP.textContent = `경매 시작가: ${Number(item.startPrice || 0).toLocaleString()}원`;
            const currentBidP = document.createElement('p'); currentBidP.classList.add('product-meta');
            currentBidP.innerHTML = `현재 최고가: <strong>${Number(item.currentBid || item.startPrice || 0).toLocaleString()}원</strong> (입찰 ${item.bidCount || 0}회)`;
            const expiryP = document.createElement('p'); expiryP.classList.add('product-meta'); expiryP.textContent = `(상품 유통기한: ${item.expiryDate || '미지정'})`;
            const endTime = new Date(item.auctionEndsAt); const now = new Date();
            const timeLeftMs = endTime.getTime() - now.getTime();
            let timeLeftString = "경매 종료";
            if (timeLeftMs > 0) {
                const days = Math.floor(timeLeftMs/(1000*60*60*24)); const hours = Math.floor((timeLeftMs%(1000*60*60*24))/(1000*60*60));
                const minutes = Math.floor((timeLeftMs%(1000*60*60))/(1000*60));
                timeLeftString = `남은 시간: ${days > 0 ? days + "일 " : ""}${hours > 0 ? hours + "시간 " : ""}${minutes}분`;
            }
            const endTimeP = document.createElement('p'); endTimeP.classList.add('product-meta');
            endTimeP.style.color = timeLeftMs < (60 * 60 * 1000) && timeLeftMs > 0 ? "red" : "#333";
            endTimeP.textContent = `${timeLeftString} (종료: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})})`;
            const bidButton = document.createElement('button'); bidButton.textContent = '입찰하기'; bidButton.classList.add('bid-button');
            bidButton.disabled = timeLeftMs <= 0;
            bidButton.addEventListener('click', () => {
                currentAuctionItemForBid = item; 
                if(auctionModalTitle) auctionModalTitle.textContent = `"${item.productName || '?'}" 경매 입찰`;
                if(auctionModalProductName) auctionModalProductName.textContent = item.productName || '?';
                if(auctionModalQuantity) auctionModalQuantity.textContent = item.quantity || 0;
                if(auctionModalCurrentBid) auctionModalCurrentBid.textContent = Number(item.currentBid || item.startPrice || 0).toLocaleString();
                if(bidAmountInput) {
                    bidAmountInput.value = ''; bidAmountInput.min = (Number(item.currentBid || item.startPrice || 0) + 1); 
                    bidAmountInput.placeholder = `현재가보다 높은 금액`;
                }
                if(auctionBidModal) auctionBidModal.style.display = 'block';
            });
            auctionItemDiv.appendChild(titleP); auctionItemDiv.appendChild(martLocP);
            auctionItemDiv.appendChild(startPriceP); auctionItemDiv.appendChild(currentBidP);
            if(item.expiryDate) auctionItemDiv.appendChild(expiryP);
            auctionItemDiv.appendChild(endTimeP); auctionItemDiv.appendChild(bidButton);
            resultsContainer.appendChild(auctionItemDiv);
        });
    }

    initializeApp();
});