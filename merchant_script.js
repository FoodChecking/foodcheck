document.addEventListener('DOMContentLoaded', () => {
    // 기본 상품 관리 폼 요소
    const productForm = document.getElementById('productForm');
    const productListTableBody = document.getElementById('productList');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const submitProductButton = document.getElementById('submitProductButton');
    const clearFormButton = document.getElementById('clearFormButton');
    const productIdHiddenInput = document.getElementById('productIdHidden');
    const martLocationInput = document.getElementById('martLocationMerchant');
    const productNameMerchantInput = document.getElementById('productNameMerchant');
    const productCategorySelect = document.getElementById('productCategoryMerchant');
    const unitPriceInput = document.getElementById('unitPrice');
    const stockQuantityInput = document.getElementById('stockQuantity');
    const manufacturingDateInput = document.getElementById('manufacturingDate'); // 제조일자
    const expiryDateInput = document.getElementById('expiryDate');       // 유통기한
    const discountUnitInput = document.getElementById('discountUnit');
    const discountAmountInput = document.getElementById('discountAmount');
    const onSaleCheckbox = document.getElementById('onSale');
    const salePriceInput = document.getElementById('salePrice');
    const deliveryAvailableCheckbox = document.getElementById('deliveryAvailable');
    const deliveryFeeInput = document.getElementById('deliveryFeeMerchant');
    const minOrderForFreeDeliveryInput = document.getElementById('minOrderForFreeDeliveryMerchant');

    // 마감 임박 세일 폼 요소
    const flashSaleProductForm = document.getElementById('flashSaleProductForm');
    const flashSaleProductSelect = document.getElementById('flashSaleProductSelect');
    const flashSalePriceInput = document.getElementById('flashSalePrice');
    const flashSaleStockInput = document.getElementById('flashSaleStock');
    const flashSaleMaxPerPersonInput = document.getElementById('flashSaleMaxPerPerson');
    const flashSaleEndTimeInput = document.getElementById('flashSaleEndTime');
    const activeFlashSalesListDiv = document.getElementById('activeFlashSalesList');
    const noFlashSalesMessage = document.getElementById('noFlashSalesMessage');
    
    // 데이터 저장 키 (마트 ID는 실제론 로그인 통해 받아야 함)
    const martId = "myLocalMart123"; 
    const martInfoLocalStorageKey = `foodCheckMartInfo_${martId}`; // 마트 이름, 위치 등 저장
    const productsLocalStorageKey = `foodCheckMartProducts_${martId}`;
    const flashSalesLocalStorageKey = `foodCheckFlashSales_${martId}`;

    let martProducts = JSON.parse(localStorage.getItem(productsLocalStorageKey)) || [];
    let activeFlashSales = JSON.parse(localStorage.getItem(flashSalesLocalStorageKey)) || [];
    
    // 마트 이름/위치 표시 (실제로는 마트 등록 시 설정)
    // 여기서는 첫 상품의 martLocation을 가져와서 표시하거나, 기본값 사용
    document.getElementById('martNameDisplay').textContent = martProducts.length > 0 ? martProducts[0].martLocation : "내 마트";


    function populateFlashSaleProductSelect() {
        flashSaleProductSelect.innerHTML = '<option value="">-- 상품 선택 --</option>';
        martProducts.forEach(product => {
            // 이미 마감 세일 중인 상품은 제외 (선택적)
            if (!activeFlashSales.some(fs => fs.productId === product.id)) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (현재 재고: ${product.stock}개)`;
                flashSaleProductSelect.appendChild(option);
            }
        });
    }

    function renderProductList() {
        productListTableBody.innerHTML = '';
        noProductsMessage.style.display = martProducts.length === 0 ? 'block' : 'none';

        martProducts.forEach((product, index) => {
            const row = productListTableBody.insertRow();
            row.insertCell().textContent = product.martLocation || '미지정';
            row.insertCell().textContent = product.category || '미지정';
            row.insertCell().textContent = product.name;

            let priceDisplay = `${Number(product.price).toLocaleString()}원`;
            if (product.onSale && product.salePrice) {
                priceDisplay = `<span style="text-decoration: line-through; color: grey;">${priceDisplay}</span> <strong style="color: red;">${Number(product.salePrice).toLocaleString()}원</strong>`;
            }
            row.insertCell().innerHTML = priceDisplay;
            row.insertCell().textContent = `${product.stock}개`;
            row.insertCell().textContent = product.manufacturingDate || '-'; // 제조일자
            row.insertCell().textContent = product.expiryDate || '-';       // 유통기한
            
            let discountText = "없음";
            if (product.discountUnit && product.discountAmount) discountText = `${product.discountUnit}개 당 ${Number(product.discountAmount).toLocaleString()}원 할인`;
            row.insertCell().textContent = discountText;
            row.insertCell().textContent = product.deliveryAvailable ? "가능" : "불가능";
            
            let deliveryFeeText = "해당 없음";
            if (product.deliveryAvailable) {
                if (Number(product.deliveryFee) === 0 && (!product.minOrderForFreeDelivery || Number(product.minOrderForFreeDelivery) === 0)) deliveryFeeText = "무료배송";
                else {
                    deliveryFeeText = `${Number(product.deliveryFee).toLocaleString()}원`;
                    if (product.minOrderForFreeDelivery && Number(product.minOrderForFreeDelivery) > 0) deliveryFeeText += ` (${Number(product.minOrderForFreeDelivery).toLocaleString()}원 이상 무료)`;
                }
            }
            row.insertCell().textContent = deliveryFeeText;

            const manageCell = row.insertCell();
            const editButton = document.createElement('button'); editButton.textContent = '수정'; editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => loadProductForEdit(index));
            const deleteButton = document.createElement('button'); deleteButton.textContent = '삭제'; deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteProduct(index));
            manageCell.appendChild(editButton); manageCell.appendChild(deleteButton);
        });
        populateFlashSaleProductSelect(); // 상품 목록 변경 시 마감 세일 드롭다운도 업데이트
    }

    function saveMartProducts() {
        localStorage.setItem(productsLocalStorageKey, JSON.stringify(martProducts));
    }

    function clearProductForm() {
        productForm.reset();
        // martLocationInput.value = ""; // 마트 위치는 유지하거나 별도 관리
        productCategorySelect.value = ""; onSaleCheckbox.checked = false; salePriceInput.value = "";
        manufacturingDateInput.value = ""; expiryDateInput.value = "";
        deliveryAvailableCheckbox.checked = true; deliveryFeeInput.value = "2000"; minOrderForFreeDeliveryInput.value = "15000";
        productIdHiddenInput.value = ''; submitProductButton.textContent = '상품 저장';
        productNameMerchantInput.focus();
    }
    clearFormButton.addEventListener('click', clearProductForm);

    productForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const martLocation = martLocationInput.value.trim();
        const productName = productNameMerchantInput.value.trim();
        const category = productCategorySelect.value;
        const unitPrice = parseFloat(unitPriceInput.value);
        const stockQuantity = parseInt(stockQuantityInput.value);
        const manufacturingDate = manufacturingDateInput.value;
        const expiryDate = expiryDateInput.value;
        const discountUnit = discountUnitInput.value ? parseInt(discountUnitInput.value) : null;
        const discountAmount = discountAmountInput.value ? parseFloat(discountAmountInput.value) : null;
        const onSale = onSaleCheckbox.checked;
        const salePrice = onSale ? parseFloat(salePriceInput.value) : null;
        const deliveryAvailable = deliveryAvailableCheckbox.checked;
        const deliveryFee = deliveryAvailable ? parseFloat(deliveryFeeInput.value) : 0;
        const minOrderForFreeDelivery = deliveryAvailable ? parseFloat(minOrderForFreeDeliveryInput.value) || 0 : 0;
        const editingProductId = productIdHiddenInput.value;

        if (!martLocation || !productName || !category || isNaN(unitPrice) || isNaN(stockQuantity)) { alert('마트위치, 품명, 카테고리, 가격, 재고량을 올바르게 입력해주세요.'); return; }
        if (onSale && (isNaN(salePrice) || salePrice <= 0)) { alert('세일 중인 경우, 유효한 세일 가격을 입력해야 합니다.'); return; }

        const productData = {
            id: editingProductId || `martProd_${martId}_${new Date().getTime()}`,
            martLocation: martLocation, name: productName, category: category, price: unitPrice, stock: stockQuantity,
            manufacturingDate: manufacturingDate, expiryDate: expiryDate,
            discountUnit: discountUnit || null, discountAmount: discountAmount || null,
            onSale: onSale, salePrice: onSale ? salePrice : null,
            deliveryAvailable: deliveryAvailable, deliveryFee: deliveryFee, minOrderForFreeDelivery: minOrderForFreeDelivery
        };

        if (editingProductId) {
            const productIndex = martProducts.findIndex(p => p.id === editingProductId);
            if (productIndex > -1) martProducts[productIndex] = productData;
            alert('상품 정보가 수정되었습니다.');
        } else {
            martProducts.push(productData);
            alert('상품이 등록되었습니다.');
        }
        saveMartProducts(); renderProductList(); clearProductForm();
        if (martProducts.length === 1 && !editingProductId) { // 첫 상품 등록 시 martNameDisplay 업데이트
             document.getElementById('martNameDisplay').textContent = martLocation;
        }
    });

    function loadProductForEdit(index) {
        const product = martProducts[index];
        martLocationInput.value = product.martLocation || "";
        productNameMerchantInput.value = product.name;
        productCategorySelect.value = product.category || "";
        unitPriceInput.value = product.price; stockQuantityInput.value = product.stock;
        manufacturingDateInput.value = product.manufacturingDate || ""; expiryDateInput.value = product.expiryDate || "";
        discountUnitInput.value = product.discountUnit || ''; discountAmountInput.value = product.discountAmount || '';
        onSaleCheckbox.checked = product.onSale || false; salePriceInput.value = product.salePrice || '';
        deliveryAvailableCheckbox.checked = product.deliveryAvailable;
        deliveryFeeInput.value = product.deliveryFee || ''; minOrderForFreeDeliveryInput.value = product.minOrderForFreeDelivery || '';
        productIdHiddenInput.value = product.id; submitProductButton.textContent = '정보 수정';
        martLocationInput.focus();
    }

    function deleteProduct(index) {
        if (confirm(`'${martProducts[index].name}' 상품을 정말 삭제하시겠습니까?`)) {
            // 마감 세일 목록에서도 해당 상품 제거
            activeFlashSales = activeFlashSales.filter(fs => fs.productId !== martProducts[index].id);
            saveFlashSales();
            renderFlashSalesList();

            martProducts.splice(index, 1);
            saveMartProducts(); renderProductList(); alert('상품이 삭제되었습니다.'); clearProductForm();
        }
    }

    // --- 마감 임박 세일 관련 로직 ---
    function saveFlashSales() {
        localStorage.setItem(flashSalesLocalStorageKey, JSON.stringify(activeFlashSales));
    }

    function renderFlashSalesList() {
        activeFlashSalesListDiv.innerHTML = '';
        noFlashSalesMessage.style.display = activeFlashSales.length === 0 ? 'block' : 'none';

        activeFlashSales.forEach((fsItem, index) => {
            const originalProduct = martProducts.find(p => p.id === fsItem.productId);
            const div = document.createElement('div');
            div.classList.add('flash-sale-item');
            const endTime = new Date(fsItem.saleEndsAt);
            const now = new Date();
            const timeLeftMs = endTime.getTime() - now.getTime();
            const timeLeftMinutes = Math.max(0, Math.floor(timeLeftMs / (1000 * 60)));


            div.innerHTML = `
                <p><strong>상품:</strong> ${fsItem.productName} (원가: ${Number(originalProduct?.price || 0).toLocaleString()}원)</p>
                <p><strong>마감 세일가:</strong> ${Number(fsItem.flashSalePrice).toLocaleString()}원</p>
                <p><strong>남은 재고:</strong> ${fsItem.flashSaleStock}개 (1인당 최대 ${fsItem.maxPerPerson}개)</p>
                <p><strong>종료까지:</strong> ${timeLeftMinutes}분 남음 (종료: ${endTime.toLocaleTimeString()})</p>
                <button class="delete-btn" data-fs-id="${fsItem.id}">이 마감세일 삭제</button>
            `;
            div.querySelector('.delete-btn').addEventListener('click', () => deleteFlashSale(fsItem.id));
            activeFlashSalesListDiv.appendChild(div);
        });
    }
    
    function deleteFlashSale(flashSaleId) {
        activeFlashSales = activeFlashSales.filter(fs => fs.id !== flashSaleId);
        saveFlashSales();
        renderFlashSalesList();
        populateFlashSaleProductSelect(); // 상품 선택 목록 갱신
        alert('마감 세일이 삭제되었습니다.');
    }


    flashSaleProductForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const productId = flashSaleProductSelect.value;
        const flashSalePrice = parseFloat(flashSalePriceInput.value);
        const flashSaleStock = parseInt(flashSaleStockInput.value);
        const maxPerPerson = parseInt(flashSaleMaxPerPersonInput.value);
        const endTimeMinutes = parseInt(flashSaleEndTimeInput.value);

        if (!productId || isNaN(flashSalePrice) || isNaN(flashSaleStock) || isNaN(maxPerPerson) || isNaN(endTimeMinutes)) {
            alert('모든 마감 세일 정보를 올바르게 입력해주세요.');
            return;
        }

        const product = martProducts.find(p => p.id === productId);
        if (!product) { alert('선택된 상품 정보를 찾을 수 없습니다.'); return; }
        if (flashSaleStock > product.stock) { alert(`마감 세일 재고(${flashSaleStock}개)는 현재 상품 재고(${product.stock}개)를 넘을 수 없습니다.`); return; }
        if (flashSalePrice >= product.price) { alert('마감 세일 가격은 원래 가격보다 낮아야 합니다.'); return; }

        const saleEndsAt = new Date(new Date().getTime() + endTimeMinutes * 60000).toISOString();

        const flashSaleData = {
            id: `flash_${martId}_${new Date().getTime()}`,
            productId: product.id,
            productName: product.name,
            martLocation: product.martLocation, // 마트 위치 정보 포함
            category: product.category,     // 카테고리 정보 포함
            flashSalePrice: flashSalePrice,
            originalPrice: product.price, // 원가도 저장
            flashSaleStock: flashSaleStock,
            maxPerPerson: maxPerPerson,
            saleEndsAt: saleEndsAt,
            createdAt: new Date().toISOString()
        };
        activeFlashSales.push(flashSaleData);
        saveFlashSales();
        renderFlashSalesList();
        flashSaleProductForm.reset();
        populateFlashSaleProductSelect(); // 드롭다운 업데이트
        alert(`'${product.name}' 상품 마감 임박 세일이 시작되었습니다! (팔로워에게 알림 전송됨 - 시뮬레이션)`);
    });
    
    // 마감 세일 타이머 업데이트 (1분마다)
    setInterval(() => {
        let changed = false;
        activeFlashSales = activeFlashSales.filter(fs => {
            const endTime = new Date(fs.saleEndsAt);
            return endTime.getTime() > new Date().getTime(); // 종료 시간이 지나지 않은 것만 남김
        });
        // 필터링 후 길이가 달라졌다면 저장 및 다시 렌더링
        if (activeFlashSales.length !== JSON.parse(localStorage.getItem(flashSalesLocalStorageKey) || "[]").length) {
            changed = true;
        }
        if(changed) {
             saveFlashSales();
             renderFlashSalesList();
        } else { // 시간만 업데이트가 필요할 수 있으므로, 변경이 없어도 일단 렌더링 (비효율적일 수 있음)
            renderFlashSalesList();
        }

    }, 60000);


    // 초기화 호출
    clearProductForm(); 
    renderProductList();
    renderFlashSalesList();
});