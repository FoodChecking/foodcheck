document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productListTableBody = document.getElementById('productList');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const submitProductButton = document.getElementById('submitProductButton');
    const clearFormButton = document.getElementById('clearFormButton');
    const productIdHiddenInput = document.getElementById('productIdHidden');

    // 폼 요소 추가
    const martLocationInput = document.getElementById('martLocation'); // 마트 위치
    const productCategorySelect = document.getElementById('productCategory');
    const onSaleCheckbox = document.getElementById('onSale');
    const salePriceInput = document.getElementById('salePrice');
    const deliveryAvailableCheckbox = document.getElementById('deliveryAvailable');
    const deliveryFeeInput = document.getElementById('deliveryFeeMerchant');
    const minOrderForFreeDeliveryInput = document.getElementById('minOrderForFreeDeliveryMerchant');

    const martId = "myLocalMart123"; 
    const localStorageKey = `foodCheckMartProducts_${martId}`;

    let martProducts = JSON.parse(localStorage.getItem(localStorageKey)) || [];

    function renderProductList() {
        productListTableBody.innerHTML = '';
        if (martProducts.length === 0) {
            noProductsMessage.style.display = 'block';
            return;
        }
        noProductsMessage.style.display = 'none';

        martProducts.forEach((product, index) => {
            const row = productListTableBody.insertRow();
            row.insertCell().textContent = product.martLocation || '미지정'; // 마트 위치 표시
            row.insertCell().textContent = product.category || '미지정';
            row.insertCell().textContent = product.name;

            let priceDisplay = `${Number(product.price).toLocaleString()}원`;
            if (product.onSale && product.salePrice) {
                priceDisplay = `<span style="text-decoration: line-through; color: grey;">${priceDisplay}</span> <strong style="color: red;">${Number(product.salePrice).toLocaleString()}원</strong> (세일 중!)`;
            }
            row.insertCell().innerHTML = priceDisplay;

            row.insertCell().textContent = `${product.stock}개`;
            
            let discountText = "없음";
            if (product.discountUnit && product.discountAmount) {
                discountText = `${product.discountUnit}개 당 ${Number(product.discountAmount).toLocaleString()}원 할인`;
            }
            row.insertCell().textContent = discountText;

            row.insertCell().textContent = product.deliveryAvailable ? "가능" : "불가능";
            
            let deliveryFeeText = "해당 없음";
            if (product.deliveryAvailable) {
                if (Number(product.deliveryFee) === 0 && (!product.minOrderForFreeDelivery || Number(product.minOrderForFreeDelivery) === 0)) {
                    deliveryFeeText = "무료배송";
                } else {
                    deliveryFeeText = `${Number(product.deliveryFee).toLocaleString()}원`;
                    if (product.minOrderForFreeDelivery && Number(product.minOrderForFreeDelivery) > 0) {
                        deliveryFeeText += ` (${Number(product.minOrderForFreeDelivery).toLocaleString()}원 이상 무료)`;
                    }
                }
            }
            row.insertCell().textContent = deliveryFeeText;

            const manageCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = '수정';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => loadProductForEdit(index));
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteProduct(index));

            manageCell.appendChild(editButton);
            manageCell.appendChild(deleteButton);
        });
    }

    function saveProducts() {
        localStorage.setItem(localStorageKey, JSON.stringify(martProducts));
    }

    function clearForm() {
        productForm.reset();
        martLocationInput.value = ""; // 마트 위치 초기화
        productCategorySelect.value = "";
        onSaleCheckbox.checked = false;
        salePriceInput.value = "";
        deliveryAvailableCheckbox.checked = true;
        deliveryFeeInput.value = "2000";
        minOrderForFreeDeliveryInput.value = "15000";
        productIdHiddenInput.value = '';
        submitProductButton.textContent = '상품 등록';
        martLocationInput.focus(); // 첫 입력 필드로 포커스
    }
    
    clearFormButton.addEventListener('click', clearForm);

    productForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const martLocation = martLocationInput.value.trim(); // 마트 위치 값 읽기
        const productName = document.getElementById('productNameMerchant').value.trim();
        const category = productCategorySelect.value;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        const stockQuantity = parseInt(document.getElementById('stockQuantity').value);
        const discountUnit = document.getElementById('discountUnit').value ? parseInt(document.getElementById('discountUnit').value) : null;
        const discountAmount = document.getElementById('discountAmount').value ? parseFloat(document.getElementById('discountAmount').value) : null;
        
        const onSale = onSaleCheckbox.checked;
        const salePrice = onSale ? parseFloat(salePriceInput.value) : null;
        
        const deliveryAvailable = deliveryAvailableCheckbox.checked;
        const deliveryFee = deliveryAvailable ? parseFloat(deliveryFeeInput.value) : 0;
        const minOrderForFreeDelivery = deliveryAvailable ? parseFloat(minOrderForFreeDeliveryInput.value) || 0 : 0;

        const editingProductId = productIdHiddenInput.value;

        if (!martLocation || !productName || !category || isNaN(unitPrice) || isNaN(stockQuantity)) { // 마트 위치 유효성 검사 추가
            alert('마트 위치, 품명, 카테고리, 가격, 재고량을 올바르게 입력해주세요.');
            return;
        }
        if (onSale && (isNaN(salePrice) || salePrice <= 0)) {
            alert('세일 중인 경우, 유효한 세일 가격을 입력해야 합니다.');
            return;
        }
        // (기존 유효성 검사 유지)

        const productData = {
            id: editingProductId || `martProd_${martId}_${new Date().getTime()}`,
            martLocation: martLocation, // 마트 위치 저장
            name: productName,
            category: category,
            price: unitPrice,
            stock: stockQuantity,
            discountUnit: discountUnit || null,
            discountAmount: discountAmount || null,
            onSale: onSale,
            salePrice: onSale ? salePrice : null,
            deliveryAvailable: deliveryAvailable,
            deliveryFee: deliveryFee,
            minOrderForFreeDelivery: minOrderForFreeDelivery
        };

        if (editingProductId) {
            const productIndex = martProducts.findIndex(p => p.id === editingProductId);
            if (productIndex > -1) {
                martProducts[productIndex] = productData;
                alert('상품 정보가 수정되었습니다.');
            }
        } else {
            martProducts.push(productData);
            alert('상품이 등록되었습니다.');
        }
        
        saveProducts();
        renderProductList();
        clearForm();
    });

    function loadProductForEdit(index) {
        const product = martProducts[index];
        martLocationInput.value = product.martLocation || ""; // 마트 위치 불러오기
        document.getElementById('productNameMerchant').value = product.name;
        productCategorySelect.value = product.category || "";
        document.getElementById('unitPrice').value = product.price;
        document.getElementById('stockQuantity').value = product.stock;
        document.getElementById('discountUnit').value = product.discountUnit || '';
        document.getElementById('discountAmount').value = product.discountAmount || '';
        
        onSaleCheckbox.checked = product.onSale || false;
        salePriceInput.value = product.salePrice || '';
        
        deliveryAvailableCheckbox.checked = product.deliveryAvailable;
        deliveryFeeInput.value = product.deliveryFee || '';
        minOrderForFreeDeliveryInput.value = product.minOrderForFreeDelivery || '';

        productIdHiddenInput.value = product.id;
        submitProductButton.textContent = '정보 수정';
        martLocationInput.focus();
    }

    function deleteProduct(index) {
        if (confirm(`'${martProducts[index].name}' 상품을 정말 삭제하시겠습니까?`)) {
            martProducts.splice(index, 1);
            saveProducts();
            renderProductList();
            alert('상품이 삭제되었습니다.');
            clearForm();
        }
    }
    
    clearForm(); 
    renderProductList();
});