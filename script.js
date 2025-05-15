document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택 (이전과 동일)
    const productNameInput = document.getElementById('productName');
    const quantityInput = document.getElementById('quantity');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const mainFavoritesButton = document.getElementById('favoritesButton');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const locationInput = document.getElementById('locationInput');
    const setLocationButton = document.getElementById('setLocationButton');
    const currentLocationDisplay = document.getElementById('currentLocationDisplay');

    // 데이터 및 상태 변수 (이전과 동일)
    const sampleKeywords = ["햇반", "햇반 흑미밥", "신라면", "짜파게티", "삼다수", "우유 1L", "계란 30구"];
    let favorites = JSON.parse(localStorage.getItem('foodCheckFavorites')) || [];
    let userLocation = localStorage.getItem('foodCheckUserLocation') || "미설정";

    // --- 유틸리티 함수 --- (이전과 동일)
    function updateMainFavoritesButtonText() {
        mainFavoritesButton.textContent = `⭐ 내 즐겨찾기 상품 (${favorites.length})`;
    }
    function updateUserLocationDisplay() {
        currentLocationDisplay.textContent = userLocation;
    }
    function showResultsPlaceholder(message) {
        resultsContainer.innerHTML = `<p class="results-placeholder">${message}</p>`;
    }

    // --- 초기화 --- (이전과 동일)
    updateUserLocationDisplay();
    updateMainFavoritesButtonText();

    // --- 이벤트 리스너 --- (setLocationButton, productNameInput, document click, searchButton, mainFavoritesButton 이전과 동일)
    setLocationButton.addEventListener('click', () => {
        const newLocation = locationInput.value.trim();
        if (newLocation) {
            userLocation = newLocation;
            localStorage.setItem('foodCheckUserLocation', userLocation);
            updateUserLocationDisplay();
            alert(`동네가 '${userLocation}'(으)로 설정되었습니다.`);
            locationInput.value = '';
        } else {
            alert('동네를 입력해주세요.');
        }
    });

    productNameInput.addEventListener('input', () => {
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

    document.addEventListener('click', function(event) {
        if (suggestionsContainer && suggestionsContainer.style.display === 'block' &&
            !productNameInput.contains(event.target) && 
            !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    searchButton.addEventListener('click', () => {
        const productName = productNameInput.value.trim();
        const quantity = quantityInput.value.trim();
        if (!productName || !quantity) { alert('상품명과 수량을 모두 입력해주세요.'); return; }
        if (parseInt(quantity) < 1) { alert('수량은 1 이상이어야 합니다.'); quantityInput.value = '1'; return; }
        
        showResultsPlaceholder("결과를 불러오는 중입니다...");

        console.log(`검색: 상품명='${productName}', 수량=${quantity}, 동네=${userLocation}`);
        setTimeout(() => {
            fetchDummyResults(productName, parseInt(quantity), userLocation);
        }, 500);
    });

    mainFavoritesButton.addEventListener('click', () => {
        displayFavoritesList();
    });
    
    // --- 핵심 로직 함수 ---
    function toggleFavorite(itemData, buttonEl) { // 이전과 동일
        const favId = itemData.id + '_' + itemData.quantity;
        const favoriteIndex = favorites.findIndex(fav => fav.favId === favId);
        if (favoriteIndex === -1) {
            favorites.push({
                favId: favId, platformId: itemData.id, name: itemData.name, quantity: itemData.quantity,
                platform: itemData.platform, url: itemData.url, price: itemData.price, addedDate: new Date().toISOString()
            });
            buttonEl.textContent = '⭐'; buttonEl.title = '즐겨찾기에서 제거';
        } else {
            favorites.splice(favoriteIndex, 1);
            buttonEl.textContent = '☆'; buttonEl.title = '즐겨찾기에 추가';
        }
        localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
        updateMainFavoritesButtonText();
    }

    function fetchDummyResults(productName, quantity, location) {
        const baseProductName = productName.toLowerCase();

        let onlineMallData = [
            { id: 'coupang_123', platform: '쿠팡', name: `햇반`, baseName: "햇반", pricePerUnit: 1200, deliveryFee: 0, minOrderForFreeDelivery: 19800, eta: '내일 새벽 도착', deliveryAvailable: true, url: `https://www.coupang.com/np/search?q=${encodeURIComponent(productName)}` },
            { id: 'naver_456', platform: '네이버쇼핑', name: `신라면`, baseName: "신라면", pricePerUnit: 1150, deliveryFee: 3000, minOrderForFreeDelivery: 30000, eta: '내일 도착', deliveryAvailable: true, url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}` },
            { id: 'ssg_789', platform: 'SSG닷컴', name: `삼다수`, baseName: "삼다수", pricePerUnit: 1250, deliveryFee: 2500, minOrderForFreeDelivery: 40000, eta: '내일 저녁 (쓱배송)', deliveryAvailable: true, url: `https://www.ssg.com/search.ssg?target=all&query=${encodeURIComponent(productName)}` },
        ];
        onlineMallData.forEach(item => item.baseName = item.name.toLowerCase());


        const martIdForConsumer = "myLocalMart123";
        const consumerLocalStorageKey = `foodCheckMartProducts_${martIdForConsumer}`;
        const registeredMartProducts = JSON.parse(localStorage.getItem(consumerLocalStorageKey)) || [];

        const localMartDataBase = registeredMartProducts.map(p => ({
            id: p.id,
            platform: `우리동네마트 (${location || '지역 unspecified'})`,
            locationTags: location ? location.split(" ").map(tag => tag.toLowerCase()) : ['전국'], // 태그도 소문자로
            name: p.name,
            baseName: p.name.toLowerCase(),
            pricePerUnit: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            discountUnit: Number(p.discountUnit) || null,
            discountAmount: Number(p.discountAmount) || null,
            deliveryAvailable: p.deliveryAvailable,
            deliveryFee: Number(p.deliveryFee) || 0,
            minOrderForFreeDelivery: Number(p.minOrderForFreeDelivery) || 0,
            eta: p.deliveryAvailable ? '오늘배송가능 (마트별 확인)' : '매장픽업',
            url: `#local_${p.id}`
        }));
        
        const allProductSources = [
            ...onlineMallData.filter(p => p.baseName.toLowerCase().includes(baseProductName)),
            ...localMartDataBase.filter(p => p.baseName.toLowerCase().includes(baseProductName))
        ];
        
        let allData = [...allProductSources];

        if (location && location !== "미설정") {
            const currentLocLower = location.toLowerCase();
            allData = allData.filter(item => {
                if (!item.locationTags) return true;
                return item.locationTags.some(tag => currentLocLower.includes(tag)); // locationTags는 이미 소문자
            });
        }

        let processedResults = [];
        allData.forEach(item => {
            let unitPrice = item.pricePerUnit;
            let itemTotalPriceBeforeDiscount = unitPrice * quantity;
            let itemTotalPrice = itemTotalPriceBeforeDiscount;
            let discountAppliedInfo = "";

            if (typeof item.discountUnit === 'number' && item.discountUnit > 0 && 
                typeof item.discountAmount === 'number' && item.discountAmount > 0 &&
                quantity >= item.discountUnit) {
                const numberOfDiscountApplications = Math.floor(quantity / item.discountUnit);
                const totalDiscount = numberOfDiscountApplications * item.discountAmount;
                itemTotalPrice -= totalDiscount;
                discountAppliedInfo = ` (${numberOfDiscountApplications * item.discountUnit}개 구매 시 ${totalDiscount.toLocaleString()}원 할인 적용)`;
            }
            
            let effectiveUnitPrice = quantity > 0 ? itemTotalPrice / quantity : 0;

            // --- DEBUGGING CONSOLE LOGS ---
            console.log(`--- Processing item: ${item.name} from ${item.platform} ---`);
            console.log(`Item Total Price (after discount, before delivery): ${itemTotalPrice}`);
            console.log(`Delivery Available: ${item.deliveryAvailable}`);
            console.log(`Item's Stored Delivery Fee: ${item.deliveryFee}`);
            console.log(`Item's Stored Min Order for Free Delivery: ${item.minOrderForFreeDelivery}`);
            // --- END DEBUGGING ---

            let currentDeliveryFee = 0;
            let deliveryFeeText = "배달 지원 안함";
            let finalEta = item.eta;

            if (item.deliveryAvailable) {
                currentDeliveryFee = item.deliveryFee; // 이미 Number로 변환됨
                const minOrderAmount = item.minOrderForFreeDelivery; // 이미 Number로 변환됨
                
                // --- DEBUGGING CONSOLE LOGS ---
                console.log(`Parsed Min Order Amount: ${minOrderAmount}, Initial Current Delivery Fee: ${currentDeliveryFee}`);
                // --- END DEBUGGING ---

                if (minOrderAmount > 0 && itemTotalPrice >= minOrderAmount) {
                    currentDeliveryFee = 0;
                    // --- DEBUGGING CONSOLE LOGS ---
                    console.log(`!!! FREE DELIVERY CONDITION MET for ${item.name} !!!`);
                    // --- END DEBUGGING ---
                }
                deliveryFeeText = currentDeliveryFee === 0 ? "무료배송" : `배송비 ${currentDeliveryFee.toLocaleString()}원`;
            } else {
                currentDeliveryFee = 0;
                deliveryFeeText = "매장 픽업만 가능";
                finalEta = "매장 픽업";
            }
            
            let finalPrice = itemTotalPrice; // 기본값은 상품가격 총합
            if (item.deliveryAvailable) { // 배달 가능할 때만 배송비 더하기
                finalPrice += currentDeliveryFee;
            }

            processedResults.push({
                id: item.id, 
                platform: item.platform, 
                name: `${item.name} ${quantity}개${discountAppliedInfo}`,
                originalItemName: item.name, 
                quantity: quantity, 
                price: finalPrice,
                deliveryFeeText: deliveryFeeText,
                pricePerUnitText: `(개당 ${Math.round(effectiveUnitPrice).toLocaleString()}원)`,
                eta: finalEta, 
                url: item.url,
                deliveryAvailable: item.deliveryAvailable
            });
        });
        processedResults.sort((a, b) => a.price - b.price);
        displayResults(processedResults);
    }

    function displayResults(results) { // 이전과 동일
        resultsContainer.innerHTML = ''; 

        if (results.length === 0) {
            showResultsPlaceholder("검색된 상품이 없습니다.");
            return;
        }

        results.forEach((item, index) => {
            const resultItemDiv = document.createElement('div');
            resultItemDiv.classList.add('result-item');

            const rankSpan = document.createElement('span');
            rankSpan.classList.add('rank');
            rankSpan.textContent = `${index + 1}`;

            const productDetailsDiv = document.createElement('div');
            productDetailsDiv.classList.add('product-details');

            const productTitleLink = document.createElement('a');
            productTitleLink.classList.add('product-title');
            productTitleLink.href = item.url;
            productTitleLink.textContent = item.name;
            productTitleLink.target = '_blank';

            const quantitySpan = document.createElement('p');
            quantitySpan.classList.add('product-meta');
            quantitySpan.textContent = `수량: ${item.quantity}개`;

            const priceSpan = document.createElement('p');
            priceSpan.classList.add('product-meta');
            priceSpan.innerHTML = `총 가격: <strong>${item.price.toLocaleString()}원</strong> <span style="font-size:0.9em; color: #6c757d;">(${item.deliveryFeeText}, ${item.pricePerUnitText})</span>`;

            const etaSpan = document.createElement('p');
            etaSpan.classList.add('product-meta');
            etaSpan.textContent = `도착 정보: ${item.eta}`;
            
            const platformSpan = document.createElement('p');
            platformSpan.classList.add('product-platform');
            platformSpan.textContent = `판매처: ${item.platform}`;
            if (item.platform.includes("마트") || item.platform.includes("슈퍼") || item.platform.includes("우리동네")) {
                 platformSpan.style.color = '#28a745';
                 platformSpan.style.fontWeight = 'bold';
            }

            const itemFavoriteButton = document.createElement('button');
            const favId = item.id + '_' + item.quantity;
            const isFavorited = favorites.some(fav => fav.favId === favId);
            itemFavoriteButton.textContent = isFavorited ? '⭐' : '☆';
            itemFavoriteButton.title = isFavorited ? '즐겨찾기에서 제거' : '즐겨찾기에 추가';
            itemFavoriteButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
            itemFavoriteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(item, itemFavoriteButton);
            });

            productDetailsDiv.appendChild(productTitleLink);
            productDetailsDiv.appendChild(quantitySpan);
            productDetailsDiv.appendChild(priceSpan);
            productDetailsDiv.appendChild(etaSpan);
            productDetailsDiv.appendChild(platformSpan);
            resultItemDiv.appendChild(rankSpan);
            resultItemDiv.appendChild(productDetailsDiv);
            resultItemDiv.appendChild(itemFavoriteButton);
            resultsContainer.appendChild(resultItemDiv);
        });
    }

    function displayFavoritesList() { // 이전과 동일
        resultsContainer.innerHTML = '';

        if (favorites.length === 0) {
            showResultsPlaceholder("즐겨찾기 한 상품이 없습니다.");
            return;
        }

        const title = document.createElement('h2');
        title.textContent = '내 즐겨찾기 목록';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        resultsContainer.appendChild(title);

        favorites.forEach(favItem => {
            const favItemDiv = document.createElement('div');
            favItemDiv.classList.add('result-item');

            const productDetailsDiv = document.createElement('div');
            productDetailsDiv.classList.add('product-details');

            const productTitleLink = document.createElement('a');
            productTitleLink.classList.add('product-title');
            productTitleLink.href = favItem.url;
            productTitleLink.textContent = favItem.name;
            productTitleLink.target = '_blank';

            const platformSpan = document.createElement('p');
            platformSpan.classList.add('product-platform');
            platformSpan.textContent = `판매처: ${favItem.platform}`;
             if (favItem.platform.includes("마트") || favItem.platform.includes("슈퍼") || favItem.platform.includes("우리동네")) {
                 platformSpan.style.color = '#28a745';
                 platformSpan.style.fontWeight = 'bold';
            }

            const quantitySpan = document.createElement('p');
            quantitySpan.classList.add('product-meta');
            quantitySpan.textContent = `수량: ${favItem.quantity}개`;

            if (favItem.price) {
                const priceSpan = document.createElement('p');
                priceSpan.classList.add('product-meta');
                priceSpan.innerHTML = `저장시 총 가격: <strong>${favItem.price.toLocaleString()}원</strong>`;
                productDetailsDiv.appendChild(priceSpan);
            }
            
            const removeFromFavListButton = document.createElement('button');
            removeFromFavListButton.textContent = '⭐';
            removeFromFavListButton.title = '즐겨찾기에서 제거';
            removeFromFavListButton.style.cssText = `background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0 5px; position: absolute; top: 10px; right: 10px;`;
            removeFromFavListButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const indexToRemove = favorites.findIndex(f => f.favId === favItem.favId);
                if (indexToRemove > -1) {
                    favorites.splice(indexToRemove, 1);
                    localStorage.setItem('foodCheckFavorites', JSON.stringify(favorites));
                    updateMainFavoritesButtonText();
                    displayFavoritesList();
                }
            });

            productDetailsDiv.appendChild(productTitleLink);
            productDetailsDiv.appendChild(platformSpan);
            productDetailsDiv.appendChild(quantitySpan);
            favItemDiv.appendChild(productDetailsDiv);
            favItemDiv.appendChild(removeFromFavListButton);
            resultsContainer.appendChild(favItemDiv);
        });
    }
});