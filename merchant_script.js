document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productListTableBody = document.getElementById('productList');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const submitProductButton = document.getElementById('submitProductButton');
    const clearFormButton = document.getElementById('clearFormButton');
    const productIdHiddenInput = document.getElementById('productIdHidden');

    // 배송 관련 입력 필드
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
            row.insertCell().textContent = product.name;
            row.insertCell().textContent = `${Number(product.price).toLocaleString()}원`;
            row.insertCell().textContent = `${product.stock}개`;
            
            let discountText = "없음";
            if (product.discountUnit && product.discountAmount) {
                discountText = `${product.discountUnit}개 당 ${Number(product.discountAmount).toLocaleString()}원 할인`;
            }
            row.insertCell().textContent = discountText;

            // 배달 여부 및 배송료 조건 표시
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
        deliveryAvailableCheckbox.checked = true; // 기본값 배달 가능
        deliveryFeeInput.value = "2000"; // 기본 배송료 예시
        minOrderForFreeDeliveryInput.value = "15000"; // 기본 무료배송금액 예시
        productIdHiddenInput.value = '';
        submitProductButton.textContent = '상품 등록';
        document.getElementById('productNameMerchant').focus();
    }
    
    clearFormButton.addEventListener('click', clearForm);

    productForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const productName = document.getElementById('productNameMerchant').value.trim();
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        const stockQuantity = parseInt(document.getElementById('stockQuantity').value);
        const discountUnit = document.getElementById('discountUnit').value ? parseInt(document.getElementById('discountUnit').value) : null;
        const discountAmount = document.getElementById('discountAmount').value ? parseFloat(document.getElementById('discountAmount').value) : null;
        
        const deliveryAvailable = deliveryAvailableCheckbox.checked;
        const deliveryFee = deliveryAvailable ? parseFloat(deliveryFeeInput.value) : 0; // 배달 불가능이면 배송료 0
        const minOrderForFreeDelivery = deliveryAvailable ? parseFloat(minOrderForFreeDeliveryInput.value) || 0 : 0; // 배달 불가능이면 0, 빈값이면 0

        const editingProductId = productIdHiddenInput.value;

        if (!productName || isNaN(unitPrice) || isNaN(stockQuantity)) {
            alert('품명, 가격, 재고량을 올바르게 입력해주세요.');
            return;
        }
        if ((discountUnit && isNaN(discountUnit)) || (discountAmount && isNaN(discountAmount))) {
            alert('할인 조건을 올바르게 입력해주세요.');
            return;
        }
        if ((discountUnit && !discountAmount) || (!discountUnit && discountAmount)) {
            alert('할인 단위와 할인액은 함께 입력해야 합니다.');
            return;
        }
        if (deliveryAvailable && isNaN(deliveryFee)) {
            alert('기본 배송료를 올바르게 입력해주세요.');
            return;
        }
        if (deliveryAvailable && isNaN(minOrderForFreeDelivery)) {
            alert('무료 배송 최소 주문 금액을 올바르게 입력해주세요.');
            return;
        }


        const productData = {
            id: editingProductId || `martProd_${martId}_${new Date().getTime()}`,
            name: productName,
            price: unitPrice,
            stock: stockQuantity,
            discountUnit: discountUnit || null,
            discountAmount: discountAmount || null,
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
        document.getElementById('productNameMerchant').value = product.name;
        document.getElementById('unitPrice').value = product.price;
        document.getElementById('stockQuantity').value = product.stock;
        document.getElementById('discountUnit').value = product.discountUnit || '';
        document.getElementById('discountAmount').value = product.discountAmount || '';
        
        deliveryAvailableCheckbox.checked = product.deliveryAvailable;
        deliveryFeeInput.value = product.deliveryFee || '';
        minOrderForFreeDeliveryInput.value = product.minOrderForFreeDelivery || '';

        productIdHiddenInput.value = product.id;
        submitProductButton.textContent = '정보 수정';
        document.getElementById('productNameMerchant').focus();
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
    
    // 페이지 로드 시 양식 기본값 설정 및 목록 렌더링
    clearForm(); // 기본값 설정을 위해 호출
    renderProductList();
});