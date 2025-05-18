document.addEventListener('DOMContentLoaded', () => {
    const martPageTitle = document.getElementById('martPageTitle');
    const martPageLocation = document.getElementById('martPageLocation');
    const martProductListContainer = document.getElementById('martProductListContainer');
    const noMartProductsMessage = document.getElementById('noMartProductsMessage');

    // URL에서 마트 ID와 이름, 위치 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const martId = urlParams.get('martId');
    const martName = urlParams.get('martName') || "해당 마트"; // 이름 없으면 기본값
    const location = urlParams.get('martLocation') || "위치 정보 없음";

    martPageTitle.textContent = `${martName} 판매 상품`;
    martPageLocation.textContent = `위치: ${location}`;

    if (!martId) {
        martProductListContainer.innerHTML = "<p>마트 정보를 가져올 수 없습니다.</p>";
        return;
    }

    const productsLocalStorageKey = `foodCheckMartProducts_${martId}`;
    const martProducts = JSON.parse(localStorage.getItem(productsLocalStorageKey)) || [];

    if (martProducts.length === 0) {
        noMartProductsMessage.style.display = 'block';
        return;
    }
    noMartProductsMessage.style.display = 'none';

    // 카테고리별로 상품 그룹화
    const productsByCategory = martProducts.reduce((acc, product) => {
        const category = product.category || "기타";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    for (const category in productsByCategory) {
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryTitle.classList.add('category-title'); // style.css의 스타일 활용
        martProductListContainer.appendChild(categoryTitle);

        productsByCategory[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('result-item'); // style.css의 .result-item 스타일 재활용
            if (item.onSale) itemDiv.classList.add('sale-item');

            const productDetailsDiv = document.createElement('div');
            productDetailsDiv.classList.add('product-details');

            const titleP = document.createElement('p'); // 링크 대신 일반 텍스트로 품명 표시
            titleP.classList.add('product-title');
            titleP.style.cursor = 'default';
            titleP.textContent = item.name;

            let priceHtml = `가격: `;
            if (item.onSale && item.salePrice) {
                priceHtml += `<strong style="color:red;">${Number(item.salePrice).toLocaleString()}원</strong> <span class="original-price">${Number(item.price).toLocaleString()}원</span>`;
            } else {
                priceHtml += `<strong>${Number(item.price).toLocaleString()}원</strong>`;
            }
            if (item.discountUnit && item.discountAmount) {
                priceHtml += ` ( ${item.discountUnit}개당 ${Number(item.discountAmount).toLocaleString()}원 추가 할인 )`;
            }
            const priceP = document.createElement('p');
            priceP.classList.add('product-meta');
            priceP.innerHTML = priceHtml;

            const stockP = document.createElement('p');
            stockP.classList.add('product-meta');
            stockP.textContent = `재고: ${item.stock}개`;

            productDetailsDiv.appendChild(titleP);
            productDetailsDiv.appendChild(priceP);
            productDetailsDiv.appendChild(stockP);

            if(item.manufacturingDate) {
                const mfgDateP = document.createElement('p');
                mfgDateP.classList.add('product-meta');
                mfgDateP.textContent = `제조일자: ${item.manufacturingDate}`;
                productDetailsDiv.appendChild(mfgDateP);
            }
            if(item.expiryDate) {
                const expDateP = document.createElement('p');
                expDateP.classList.add('product-meta');
                expDateP.textContent = `유통기한: ${item.expiryDate}`;
                productDetailsDiv.appendChild(expDateP);
            }

            // "같은 상품 기준 동네 순위" (더미 데이터/플레이스홀더)
            const localRankP = document.createElement('p');
            localRankP.classList.add('local-price-rank');
            // 실제 순위 계산은 매우 복잡. 여기서는 더미 텍스트 또는 일부 상품에 한해 하드코딩된 순위 표시
            if (item.name.includes("햇반") || item.name.includes("신라면")) { // 예시: 특정 상품만
                 localRankP.textContent = `✨ ${item.martLocation} 내 최저가! (시뮬레이션)`;
            } else {
                 localRankP.textContent = `동네 가격 순위: (정보 분석중)`;
            }
            productDetailsDiv.appendChild(localRankP);


            // 마트 페이지에서는 즐겨찾기/구매 버튼 등은 일단 제외 (필요시 추가)

            itemDiv.appendChild(productDetailsDiv);
            martProductListContainer.appendChild(itemDiv);
        });
    }
});