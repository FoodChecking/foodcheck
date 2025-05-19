document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택 (null 체크 강화)
    const getElem = (id) => document.getElementById(id);

    const productForm = getElem('productForm');
    const productListTableBody = getElem('productList');
    const noProductsMessage = getElem('noProductsMessage');
    const submitProductButton = getElem('submitProductButton');
    const clearFormButton = getElem('clearFormButton');
    const productIdHiddenInput = getElem('productIdHidden');
    const martLocationInput = getElem('martLocationMerchant');
    const productNameMerchantInput = getElem('productNameMerchant');
    const productCategorySelect = getElem('productCategoryMerchant');
    const unitPriceInput = getElem('unitPrice');
    const stockQuantityInput = getElem('stockQuantity');
    const manufacturingDateInput = getElem('manufacturingDate');
    const expiryDateInput = getElem('expiryDate');
    const discountUnitInput = getElem('discountUnit');
    const discountAmountInput = getElem('discountAmount');
    const onSaleCheckbox = getElem('onSale');
    const salePriceInput = getElem('salePrice');
    const deliveryAvailableCheckbox = getElem('deliveryAvailable');
    const deliveryFeeInput = getElem('deliveryFeeMerchant');
    const minOrderForFreeDeliveryInput = getElem('minOrderForFreeDeliveryMerchant');
    const martNameDisplay = getElem('martNameDisplay');

    const flashSaleProductForm = getElem('flashSaleProductForm');
    const flashSaleProductSelect = getElem('flashSaleProductSelect');
    const flashSalePriceInput = getElem('flashSalePrice');
    const flashSaleStockInput = getElem('flashSaleStock');
    const flashSaleMaxPerPersonInput = getElem('flashSaleMaxPerPerson');
    const flashSaleEndTimeInput = getElem('flashSaleEndTime');
    const activeFlashSalesListDiv = getElem('activeFlashSalesList');
    const noFlashSalesMessage = getElem('noFlashSalesMessage');

    const auctionProductForm = getElem('auctionProductForm');
    const auctionProductSelect = getElem('auctionProductSelect');
    const auctionStartPriceInput = getElem('auctionStartPrice');
    const auctionQuantityInput = getElem('auctionQuantity');
    const auctionDurationHoursInput = getElem('auctionDurationHours');
    const selectedProductExpiryDisplay = getElem('selectedProductExpiryDisplay');
    const activeAuctionsListDiv = getElem('activeAuctionsList');
    const noAuctionsMessage = getElem('noAuctionsMessage');

    const martId = "myLocalMart123"; 
    const productsLocalStorageKey = `foodCheckMartProducts_${martId}`;
    const flashSalesLocalStorageKey = `foodCheckFlashSales_${martId}`;
    const auctionsLocalStorageKey = `foodCheckAuctions_${martId}`; 

    let martProducts = [];
    let activeFlashSales = [];
    let activeAuctions = [];

    function loadDataFromLocalStorage(key, defaultValue = []) {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData === null) return defaultValue;
            const parsedData = JSON.parse(storedData);
            return Array.isArray(parsedData) ? parsedData : defaultValue;
        } catch (error) {
            console.error(`Error parsing data for key ${key} from localStorage:`, error);
            return defaultValue;
        }
    }
    
    function initializeMerchantData() {
        martProducts = loadDataFromLocalStorage(productsLocalStorageKey, []);
        activeFlashSales = loadDataFromLocalStorage(flashSalesLocalStorageKey, []);
        activeAuctions = loadDataFromLocalStorage(auctionsLocalStorageKey, []);
        if(martNameDisplay) martNameDisplay.textContent = martProducts.length > 0 && martProducts[0].martLocation ? martProducts[0].martLocation : "내 마트";
    }

    function populateSelectWithOptions(selectElement, productsArray, excludeList = [], idField = 'productId') {
        if (!selectElement) { console.warn("populateSelectWithOptions: selectElement is null for idField:", idField); return; }
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">-- 상품 선택 --</option>';
        productsArray.forEach(product => {
            if (!product || typeof product.id === 'undefined') {
                console.warn("populateSelectWithOptions: Invalid product encountered in productsArray", product);
                return; 
            }
            const isExcluded = excludeList.some(excluded => excluded && typeof excluded[idField] !== 'undefined' && excluded[idField] === product.id);
            if (!isExcluded) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name || '이름없음'} (재고: ${product.stock || 0}개, 유통기한: ${product.expiryDate || '미지정'})`;
                option.dataset.expiryDate = product.expiryDate || "";
                option.dataset.stock = product.stock || 0;
                selectElement.appendChild(option);
            }
        });
        const currentOptionExists = Array.from(selectElement.options).some(opt => opt.value === currentValue);
        if (currentValue && currentOptionExists) {
            selectElement.value = currentValue;
        }
    }

    function renderProductList() {
        if (!productListTableBody || !noProductsMessage) { console.warn("renderProductList: Table body or no message element not found."); return;}
        productListTableBody.innerHTML = '';
        noProductsMessage.style.display = martProducts.length === 0 ? 'block' : 'none';
        martProducts.forEach((product, index) => {
            if (!product) { console.warn("renderProductList: Invalid product at index", index); return; }
            const row = productListTableBody.insertRow();
            row.insertCell().textContent = product.martLocation || '미지정';
            row.insertCell().textContent = product.category || '미지정';
            row.insertCell().textContent = product.name || '이름없음';
            let priceDisplay = `${Number(product.price || 0).toLocaleString()}원`;
            if (product.onSale && typeof product.salePrice === 'number' && product.salePrice > 0) {
                priceDisplay = `<span style="text-decoration: line-through; color: grey;">${priceDisplay}</span> <strong style="color: red;">${Number(product.salePrice).toLocaleString()}원</strong>`;
            }
            row.insertCell().innerHTML = priceDisplay;
            row.insertCell().textContent = `${product.stock || 0}개`;
            row.insertCell().textContent = product.manufacturingDate || '-'; 
            row.insertCell().textContent = product.expiryDate || '-';       
            let discountText = "없음"; 
            if (product.discountUnit && product.discountAmount) {
                discountText = `${product.discountUnit}개 당 ${Number(product.discountAmount).toLocaleString()}원 할인`;
            }
            row.insertCell().textContent = discountText;
            row.insertCell().textContent = product.deliveryAvailable ? "가능" : "불가능";
            let deliveryFeeText = "해당 없음";
            if (product.deliveryAvailable) {
                const fee = Number(product.deliveryFee || 0);
                const minOrder = Number(product.minOrderForFreeDelivery || 0);
                if (fee === 0 && minOrder === 0) deliveryFeeText = "무료배송";
                else { 
                    deliveryFeeText = `${fee.toLocaleString()}원`; 
                    if (minOrder > 0) deliveryFeeText += ` (${minOrder.toLocaleString()}원 이상 무료)`;
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
        populateSelectWithOptions(flashSaleProductSelect, martProducts, activeFlashSales, 'productId');
        populateSelectWithOptions(auctionProductSelect, martProducts, activeAuctions, 'productId');
    }

    function saveMartProducts() { localStorage.setItem(productsLocalStorageKey, JSON.stringify(martProducts)); }
    
    function clearProductForm() { 
        if (productForm) productForm.reset();
        if (martLocationInput) {
             martLocationInput.value = (martProducts.length > 0 && martProducts[0] && martProducts[0].martLocation) ? martProducts[0].martLocation : "";
        }
        if (productCategorySelect) productCategorySelect.value = ""; 
        if (onSaleCheckbox) onSaleCheckbox.checked = false;   
        if (salePriceInput) salePriceInput.value = "";       
        if (manufacturingDateInput) manufacturingDateInput.value = ""; 
        if (expiryDateInput) expiryDateInput.value = "";
        if (deliveryAvailableCheckbox) deliveryAvailableCheckbox.checked = true; 
        if (deliveryFeeInput) deliveryFeeInput.value = "2000"; 
        if (minOrderForFreeDeliveryInput) minOrderForFreeDeliveryInput.value = "15000";
        if (productIdHiddenInput) productIdHiddenInput.value = ''; 
        if (submitProductButton) submitProductButton.textContent = '상품 저장';
        
        const firstFocusElement = martLocationInput || productNameMerchantInput;
        if (firstFocusElement) firstFocusElement.focus();
    }

    if(clearFormButton) clearFormButton.addEventListener('click', clearProductForm);

    if(productForm) productForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const martLocation = martLocationInput ? martLocationInput.value.trim() : "";
        const productName = productNameMerchantInput ? productNameMerchantInput.value.trim() : "";
        const category = productCategorySelect ? productCategorySelect.value : "";
        const unitPrice = unitPriceInput ? parseFloat(unitPriceInput.value) : NaN;
        const stockQuantity = stockQuantityInput ? parseInt(stockQuantityInput.value) : NaN;
        const manufacturingDate = manufacturingDateInput ? manufacturingDateInput.value : "";
        const expiryDate = expiryDateInput ? expiryDateInput.value : "";
        const discountUnitVal = discountUnitInput ? discountUnitInput.value : "";
        const discountAmountVal = discountAmountInput ? discountAmountInput.value : "";
        const onSale = onSaleCheckbox ? onSaleCheckbox.checked : false;
        const salePriceVal = salePriceInput ? salePriceInput.value : "";
        const deliveryAvailable = deliveryAvailableCheckbox ? deliveryAvailableCheckbox.checked : true; // 기본 배달 가능
        const deliveryFeeVal = deliveryFeeInput ? deliveryFeeInput.value : "";
        const minOrderForFreeDeliveryVal = minOrderForFreeDeliveryInput ? minOrderForFreeDeliveryInput.value : "";
        const editingProductId = productIdHiddenInput ? productIdHiddenInput.value : "";

        if (!martLocation || !productName || !category || isNaN(unitPrice) || isNaN(stockQuantity)) { alert('마트위치, 품명, 카테고리, 가격, 재고량을 올바르게 입력해주세요.'); return; }
        
        const salePrice = (onSale && salePriceVal) ? parseFloat(salePriceVal) : null;
        if (onSale && (isNaN(salePrice) || salePrice <= 0)) { alert('세일 진행 시 유효한 세일 가격을 입력해야 합니다.'); return; }

        const discountUnit = discountUnitVal ? parseInt(discountUnitVal) : null;
        const discountAmount = discountAmountVal ? parseFloat(discountAmountVal) : null;

        const deliveryFee = deliveryAvailable && deliveryFeeVal ? parseFloat(deliveryFeeVal) : 0;
        const minOrderForFreeDelivery = deliveryAvailable && minOrderForFreeDeliveryVal ? parseFloat(minOrderForFreeDeliveryVal) || 0 : 0;

        const productData = {
            id: editingProductId || `martProd_${martId}_${new Date().getTime()}`, martLocation, name: productName, category, price: unitPrice, stock: stockQuantity,
            manufacturingDate, expiryDate, discountUnit, discountAmount,
            onSale, salePrice, 
            deliveryAvailable, deliveryFee, minOrderForFreeDelivery
        };

        if (editingProductId) {
            const productIndex = martProducts.findIndex(p => p && p.id === editingProductId);
            if (productIndex > -1) martProducts[productIndex] = productData;
            alert('상품 정보가 수정되었습니다.');
        } else { martProducts.push(productData); alert('상품이 등록되었습니다.');}
        
        saveMartProducts(); renderProductList(); clearProductForm();
        if (martProducts.length > 0 && martNameDisplay && martProducts[0].martLocation) {
             martNameDisplay.textContent = martProducts[0].martLocation;
        }
    }); else { console.warn("Product form not found"); }

    function loadProductForEdit(index) {
        if (index < 0 || index >= martProducts.length || !martProducts[index]) return;
        const product = martProducts[index];
        if(martLocationInput) martLocationInput.value = product.martLocation || "";
        if(productNameMerchantInput) productNameMerchantInput.value = product.name || "";
        if(productCategorySelect) productCategorySelect.value = product.category || "";
        if(unitPriceInput) unitPriceInput.value = product.price || ""; 
        if(stockQuantityInput) stockQuantityInput.value = product.stock || "";
        if(manufacturingDateInput) manufacturingDateInput.value = product.manufacturingDate || ""; 
        if(expiryDateInput) expiryDateInput.value = product.expiryDate || "";
        if(discountUnitInput) discountUnitInput.value = product.discountUnit || ''; 
        if(discountAmountInput) discountAmountInput.value = product.discountAmount || '';
        if(onSaleCheckbox) onSaleCheckbox.checked = product.onSale || false; 
        if(salePriceInput) salePriceInput.value = product.salePrice || '';
        if(deliveryAvailableCheckbox) deliveryAvailableCheckbox.checked = typeof product.deliveryAvailable !== 'undefined' ? product.deliveryAvailable : true;
        if(deliveryFeeInput) deliveryFeeInput.value = product.deliveryFee || '0'; 
        if(minOrderForFreeDeliveryInput) minOrderForFreeDeliveryInput.value = product.minOrderForFreeDelivery || '0';
        if(productIdHiddenInput) productIdHiddenInput.value = product.id; 
        if(submitProductButton) submitProductButton.textContent = '정보 수정';
        
        const firstFocusElement = martLocationInput || productNameMerchantInput;
        if (firstFocusElement) firstFocusElement.focus();
    }

    function deleteProduct(index) { 
        if (index < 0 || index >= martProducts.length || !martProducts[index]) return;
        if (confirm(`'${martProducts[index].name}' 상품을 정말 삭제하시겠습니까?`)) {
            const productIdToDelete = martProducts[index].id;
            activeFlashSales = activeFlashSales.filter(fs => fs && fs.productId !== productIdToDelete);
            saveFlashSales(); renderFlashSalesList();
            activeAuctions = activeAuctions.filter(auc => auc && auc.productId !== productIdToDelete); 
            saveAuctions(); renderAuctionsList(); 
            martProducts.splice(index, 1);
            saveMartProducts(); renderProductList(); alert('상품이 삭제되었습니다.'); clearProductForm();
        }
    }

    function saveFlashSales() { localStorage.setItem(flashSalesLocalStorageKey, JSON.stringify(activeFlashSales)); }

    function renderFlashSalesList() {
        if (!activeFlashSalesListDiv || !noFlashSalesMessage) { console.warn("Flash sale list elements not found for rendering."); return;}
        activeFlashSalesListDiv.innerHTML = '';
        noFlashSalesMessage.style.display = activeFlashSales.length === 0 ? 'block' : 'none';
        activeFlashSales.forEach((fsItem) => {
            if(!fsItem || !fsItem.id) return;
            const originalProduct = martProducts.find(p => p && p.id === fsItem.productId);
            const div = document.createElement('div'); div.classList.add('flash-sale-item');
            const endTime = new Date(fsItem.saleEndsAt); const now = new Date();
            const timeLeftMs = endTime.getTime() - now.getTime();
            const timeLeftMinutes = Math.max(0, Math.floor(timeLeftMs / (1000 * 60)));
            div.innerHTML = `
                <p><strong>상품:</strong> ${fsItem.productName || '?'} (원가: ${Number(originalProduct?.price || fsItem.originalPrice || 0).toLocaleString()}원)</p>
                <p><strong>마감 세일가:</strong> ${Number(fsItem.flashSalePrice || 0).toLocaleString()}원</p>
                <p><strong>남은 재고:</strong> ${fsItem.flashSaleStock || 0}개 (1인당 최대 ${fsItem.maxPerPerson || 0}개)</p>
                <p><strong>종료까지:</strong> ${timeLeftMinutes}분 남음 (종료: ${endTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})})</p>
                <button class="delete-btn" data-fs-id="${fsItem.id}">이 마감세일 삭제</button>
            `;
            const deleteBtn = div.querySelector('.delete-btn');
            if(deleteBtn) deleteBtn.addEventListener('click', () => deleteFlashSale(fsItem.id));
            activeFlashSalesListDiv.appendChild(div);
        });
    }
    
    function deleteFlashSale(flashSaleId) {
        if (!flashSaleId || !confirm("이 마감 세일을 정말 삭제하시겠습니까?")) return;
        activeFlashSales = activeFlashSales.filter(fs => fs && fs.id !== flashSaleId);
        saveFlashSales(); renderFlashSalesList();
        populateSelectWithOptions(flashSaleProductSelect, martProducts, activeFlashSales, 'productId');
        alert('마감 세일이 삭제되었습니다.');
    }

    if(flashSaleProductForm && flashSaleProductSelect && flashSalePriceInput && flashSaleStockInput && flashSaleMaxPerPersonInput && flashSaleEndTimeInput) {
        flashSaleProductForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const productId = flashSaleProductSelect.value;
            const flashSalePrice = parseFloat(flashSalePriceInput.value);
            const flashSaleStock = parseInt(flashSaleStockInput.value);
            const maxPerPerson = parseInt(flashSaleMaxPerPersonInput.value);
            const endTimeMinutes = parseInt(flashSaleEndTimeInput.value);

            if (!productId || isNaN(flashSalePrice) || isNaN(flashSaleStock) || isNaN(maxPerPerson) || isNaN(endTimeMinutes) || endTimeMinutes < 1) {
                alert('모든 마감 세일 정보를 올바르게 입력해주세요 (종료 시간은 1분 이상).'); return;
            }
            const product = martProducts.find(p => p && p.id === productId);
            if (!product) { alert('선택된 상품 정보를 찾을 수 없습니다.'); return; }
            if (flashSaleStock > product.stock) { alert(`마감 세일 재고(${flashSaleStock}개)는 현재 상품 재고(${product.stock}개)를 넘을 수 없습니다.`); return; }
            if (flashSalePrice >= product.price) { alert('마감 세일 가격은 원래 가격보다 낮아야 합니다.'); return; }

            const saleEndsAt = new Date(new Date().getTime() + endTimeMinutes * 60000).toISOString();
            const flashSaleData = {
                id: `flash_${martId}_${new Date().getTime()}`, productId: product.id, productName: product.name,
                martLocation: product.martLocation, category: product.category, 
                flashSalePrice: flashSalePrice, originalPrice: product.price, 
                flashSaleStock: flashSaleStock, maxPerPerson: maxPerPerson,
                saleEndsAt: saleEndsAt, createdAt: new Date().toISOString()
            };
            activeFlashSales.push(flashSaleData); saveFlashSales(); renderFlashSalesList();
            flashSaleProductForm.reset(); populateSelectWithOptions(flashSaleProductSelect, martProducts, activeFlashSales, 'productId');
            alert(`'${product.name}' 상품 마감 임박 세일이 시작되었습니다!`);
        });
    } else { console.warn("Flash sale form elements not all found for event listener."); }
    
    if (typeof setInterval !== 'undefined') {
        setInterval(() => {
            let fsChanged = false;
            const fsInitialLength = activeFlashSales.length;
            activeFlashSales = activeFlashSales.filter(fs => fs && fs.saleEndsAt && new Date(fs.saleEndsAt).getTime() > new Date().getTime());
            if (activeFlashSales.length !== fsInitialLength) fsChanged = true;
            if(fsChanged) { 
                saveFlashSales(); 
                if(document.getElementById('activeFlashSalesList')) renderFlashSalesList(); // 페이지에 있을 때만 렌더링
                populateSelectWithOptions(flashSaleProductSelect, martProducts, activeFlashSales, 'productId');
            } else { 
                if (document.getElementById('activeFlashSalesList')) renderFlashSalesList(); 
            }

            let aucChanged = false;
            const aucInitialLength = activeAuctions.length;
            activeAuctions = activeAuctions.filter(auc => auc && auc.auctionEndsAt && new Date(auc.auctionEndsAt).getTime() > new Date().getTime());
            if (activeAuctions.length !== aucInitialLength) aucChanged = true;
            if(aucChanged) { 
                saveAuctions(); 
                if(document.getElementById('activeAuctionsList')) renderAuctionsList(); 
                populateSelectWithOptions(auctionProductSelect, martProducts, activeAuctions, 'productId'); 
            } else { 
                if(document.getElementById('activeAuctionsList')) renderAuctionsList(); 
            }
        }, 60000);
    }

    function saveAuctions() { localStorage.setItem(auctionsLocalStorageKey, JSON.stringify(activeAuctions)); }

    function renderAuctionsList() {
        if (!activeAuctionsListDiv || !noAuctionsMessage) { console.warn("Auction list elements not found for rendering."); return; }
        activeAuctionsListDiv.innerHTML = '';
        noAuctionsMessage.style.display = activeAuctions.length === 0 ? 'block' : 'none';
        activeAuctions.forEach((auctionItem) => {
            if(!auctionItem || !auctionItem.id) return;
            const originalProduct = martProducts.find(p => p && p.id === auctionItem.productId);
            const div = document.createElement('div'); div.classList.add('auction-item');
            const endTime = new Date(auctionItem.auctionEndsAt); const now = new Date();
            const timeLeftMs = endTime.getTime() - now.getTime();
            let timeLeftString = "경매 종료";
            if (timeLeftMs > 0) {
                const days = Math.floor(timeLeftMs/(1000*60*60*24)); const hours = Math.floor((timeLeftMs%(1000*60*60*24))/(1000*60*60));
                const minutes = Math.floor((timeLeftMs%(1000*60*60))/(1000*60));
                timeLeftString = `${days > 0 ? days + "일 " : ""}${hours > 0 ? hours + "시간 " : ""}${minutes}분 남음`;
            }
            div.innerHTML = `
                <p><strong>상품:</strong> ${auctionItem.productName || '?'} (x ${auctionItem.quantity || 0}개)</p>
                <p><strong>(참고) 원본상품 유통기한:</strong> ${originalProduct?.expiryDate || '미지정'}</p>
                <p><strong>시작 가격:</strong> ${Number(auctionItem.startPrice || 0).toLocaleString()}원</p>
                <p><strong>현재 최고 입찰가:</strong> ${Number(auctionItem.currentBid || auctionItem.startPrice || 0).toLocaleString()}원 (입찰 ${auctionItem.bidCount || 0}회)</p>
                <p><strong>경매 종료:</strong> ${endTime.toLocaleString([], { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})} (${timeLeftString})</p>
                <button class="delete-btn" data-auction-id="${auctionItem.id}">이 경매 삭제</button>
            `;
            const deleteBtn = div.querySelector('.delete-btn');
            if(deleteBtn) deleteBtn.addEventListener('click', () => deleteAuction(auctionItem.id));
            activeAuctionsListDiv.appendChild(div);
        });
    }
    
    function deleteAuction(auctionId) {
        if (!auctionId || !confirm("이 경매를 정말 삭제하시겠습니까?")) return;
        activeAuctions = activeAuctions.filter(auc => auc && auc.id !== auctionId);
        saveAuctions(); renderAuctionsList();
        populateSelectWithOptions(auctionProductSelect, martProducts, activeAuctions, 'productId');
        alert('경매가 삭제되었습니다.');
    }

    if (auctionProductSelect) {
        auctionProductSelect.addEventListener('change', function() {
            if (!this.value) { if(selectedProductExpiryDisplay) selectedProductExpiryDisplay.textContent = '-'; return; }
            const selectedOption = this.options[this.selectedIndex];
            const expiryDate = selectedOption.dataset.expiryDate;
            const stock = selectedOption.dataset.stock;
            if (selectedProductExpiryDisplay) selectedProductExpiryDisplay.textContent = expiryDate || '-';
            if (auctionQuantityInput) { auctionQuantityInput.max = stock || '1'; auctionQuantityInput.value = '1';}

            if (expiryDate && auctionDurationHoursInput) {
                const today = new Date(); today.setHours(0,0,0,0);
                const expiry = new Date(expiryDate); expiry.setHours(0,0,0,0);
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                auctionDurationHoursInput.disabled = false; auctionDurationHoursInput.title = "";
                if (diffDays <= 1 && diffTime >= 0) {
                    auctionDurationHoursInput.value = "1"; auctionDurationHoursInput.max = "1";
                    auctionDurationHoursInput.title = "유통기한 1일 이내 상품은 최대 1시간 경매 가능";
                } else if (diffTime < 0) {
                    auctionDurationHoursInput.value = "1"; auctionDurationHoursInput.max = "1";
                    auctionDurationHoursInput.title = "유통기한이 지난 상품입니다. 경매 등록에 주의하세요.";
                    // auctionDurationHoursInput.disabled = true; // 유통기한 지난 상품 경매 등록 불가 처리도 가능
                    alert("선택하신 상품은 유통기한이 지났거나 오늘까지입니다. 경매 등록에 주의하세요.");
                } else { auctionDurationHoursInput.max = "48"; auctionDurationHoursInput.title = ""; }
            } else if (auctionDurationHoursInput) { auctionDurationHoursInput.max = "48"; auctionDurationHoursInput.title = ""; auctionDurationHoursInput.disabled = false; }
        });
    } else { console.warn("Auction product select not found for event listener.");}

    if (auctionProductForm && auctionProductSelect && auctionStartPriceInput && auctionQuantityInput && auctionDurationHoursInput) {
        auctionProductForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const productId = auctionProductSelect.value;
            const startPrice = parseFloat(auctionStartPriceInput.value);
            const quantity = parseInt(auctionQuantityInput.value);
            let durationHours = parseInt(auctionDurationHoursInput.value);

            if (!productId || isNaN(startPrice) || isNaN(quantity) || quantity < 1) { alert('경매 상품, 시작 가격, 수량을 올바르게 입력해주세요.'); return; }
            if (isNaN(durationHours) || durationHours <= 0) { alert('경매 기간(시간)을 올바르게 설정해주세요.'); return; }

            const product = martProducts.find(p => p && p.id === productId);
            if (!product) { alert('선택된 상품 정보를 찾을 수 없습니다.'); return; }
            if (quantity > product.stock) { alert(`경매 수량(${quantity}개)은 현재 상품 재고(${product.stock}개)를 넘을 수 없습니다.`); return; }

            if (product.expiryDate) {
                const today = new Date(); today.setHours(0,0,0,0);
                const expiry = new Date(product.expiryDate); expiry.setHours(0,0,0,0);
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 1 && durationHours > 1) {
                    alert('유통기한이 1일 이내인 상품은 경매 시간을 최대 1시간으로 설정해야 합니다.');
                    if(auctionDurationHoursInput) auctionDurationHoursInput.value = "1"; return;
                }
            }
            if (durationHours > 48) { alert("최대 경매 기간은 2일(48시간)입니다."); durationHours = 48; if(auctionDurationHoursInput) auctionDurationHoursInput.value = "48"; }

            const auctionEndsAt = new Date(new Date().getTime() + durationHours * 60 * 60 * 1000).toISOString();
            const auctionData = {
                id: `auc_${martId}_${new Date().getTime()}`, productId: product.id, productName: product.name,
                martLocation: product.martLocation, category: product.category, quantity: quantity,
                startPrice: startPrice, currentBid: startPrice, bidCount: 0,
                auctionEndsAt: auctionEndsAt, expiryDate: product.expiryDate, 
                createdAt: new Date().toISOString(), bids: [] 
            };
            activeAuctions.push(auctionData); saveAuctions(); renderAuctionsList();
            auctionProductForm.reset(); if(selectedProductExpiryDisplay) selectedProductExpiryDisplay.textContent = '-';
            populateSelectWithOptions(auctionProductSelect, martProducts, activeAuctions, 'productId');
            alert(`'${product.name}' ${quantity}개 경매가 시작되었습니다!`);
        });
    } else { console.warn("Auction form elements not all found for event listener.");}
    
    // --- 초기화 호출 ---
    initializeMerchantData(); 
    if(typeof clearProductForm === 'function') clearProductForm(); 
    if(typeof renderProductList === 'function') renderProductList();
    if(typeof renderFlashSalesList === 'function') renderFlashSalesList();
    if(typeof renderAuctionsList === 'function') renderAuctionsList();
});