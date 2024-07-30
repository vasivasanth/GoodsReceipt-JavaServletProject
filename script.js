//date format change function
function dateFormatChange(receiptDate) {
    if (receiptDate === "") {
        return "";
    }
    const parts = receiptDate.split('-');
    const formatChangedDate = parts[2] + '-' + parts[1] + '-' + parts[0];
    return formatChangedDate;
}

//View icon action
function view(button) {
    var tdValue =button.closest('tr').querySelectorAll('td'); 
	document.getElementById("id").innerHTML="Receipt ID: "+"<b>"+tdValue[2].textContent.trim()+"</b>";
	document.getElementById("date").innerHTML="Receipt Date: "+"<b>"+tdValue[3].textContent.trim()+"</b>";
	document.getElementById("vendor").innerHTML="Vendor: "+"<b>"+tdValue[4].textContent.trim()+"</b>";
    sendDataToServlet(tdValue[2].textContent.trim());
	const over = document.getElementById("list-overlay");
	const popDialog = document.getElementById("list-popupDialog");
	over.style.display = "block";
	popDialog.style.display = "block";
	popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";
}

function sendDataToServlet(value) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "GRServlet", false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {			
			          var receiptLineItems = JSON.parse(xhr.responseText);
			          var tbody = document.getElementById("viewTableBody");
			          
					  var rowsHtml = "";
					  receiptLineItems.forEach((item, index)=> {
					      rowsHtml += "<tr>"
					                + "<td>" + (index + 1) + "</td>"
					                + "<td>" + item.productId + "</td>"
					                + "<td>" + dateFormatChange(item.date) + "</td>"
					                + "<td>" + item.quantity + "</td>"
					                + "</tr>";
					  });
					  tbody.innerHTML = rowsHtml;
        }
    };
    xhr.send("receiptID=" + encodeURIComponent(value));
}

document.getElementById("list-overlay").addEventListener("click", function(event) {
	const over = document.getElementById("list-overlay");
	const popDialog = document.getElementById("list-popupDialog");
	over.style.display = "none";
	popDialog.style.display = "none";
	popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";	
	document.getElementById("viewTableBody").innerHTML = "";
	document.getElementById("id").innerHTML="";
	document.getElementById("date").innerHTML="";
	document.getElementById("vendor").innerHTML="";		
    });
	
// onload
let currentPage="";	
document.addEventListener("DOMContentLoaded", function() { 		
	    loadVendorDetails(); 
		loadProductDetails();		
		loadTable(1);
});

function loadTable(page) {
	        const xhr = new XMLHttpRequest();
	        xhr.open('GET', `/GoodsReceiptServlet/GRServlet?page=${page}`, false);
	        xhr.setRequestHeader('Content-Type', 'application/json');
	        xhr.onload = function() {
	            if (xhr.status === 200) {
	                const response = JSON.parse(xhr.responseText);
					document.getElementById('selectAllRow').checked = false;
	                updateTable(response);
	            } else {
	                console.error("Failed to fetch data:", xhr.status);
	            }
	        };
	        xhr.send();
	    }	
	
	
function updateTable(data) {
	    const tbody = document.getElementById('tableBody');
	    tbody.innerHTML = '';
		currentPage=data.currentPage;
	    data.receipts.forEach((receipt)=> {
	        const tr = document.createElement('tr');
	        tr.innerHTML = `
			    <td><input type="checkbox" class="selectRow"></td>
	            <td>${receipt.sno}</td>
	            <td>${receipt.receiptId}</td>
	            <td>${dateFormatChange(receipt.receiptDate)}</td>
	            <td>${receipt.vendorId}</td>
	            <td class="action">
	                <i onclick="view(this)" title="view" class="fa-solid fa-eye"></i>
	                <i onclick="listEditRow(this)" title="edit" class="fa-solid fa-pen-to-square"></i>
	                <i onclick="deleteReceiptIcon(this)" title="delete" class="fa-solid fa-trash"></i>
	            </td>
	        `;
	        tbody.appendChild(tr);
	    });

	    const pagination = document.getElementById('pagination');
	    pagination.innerHTML = '';

	    if (data.currentPage > 1) {
	        const prevLink = document.createElement('a');
	        prevLink.href = "#";
	        prevLink.textContent = 'Previous';
	        prevLink.onclick = () => loadTable(data.currentPage - 1);
	        pagination.appendChild(prevLink);
	    }
		else{
			const prevLink = document.createElement('a');
			prevLink.href = "#";
		    prevLink.textContent = 'Previous';
			prevLink.style.pointerEvents='none';
		    pagination.appendChild(prevLink);
		}

	    for (let i = 1; i <= data.totalPages; i++) {
	        const pageLink = document.createElement('a');
	        pageLink.href = "#";
	        pageLink.textContent = i;
	        pageLink.onclick = () => loadTable(i);
	        if (i === data.currentPage) {
	            pageLink.style.fontWeight = 'bold';
				pageLink.style.color='#007bff';
	        }
	        pagination.appendChild(pageLink);
	    }

	    if (data.currentPage < data.totalPages) {
	        const nextLink = document.createElement('a');
	        nextLink.href = "#";
	        nextLink.textContent = 'Next';
	        nextLink.onclick = () => loadTable(data.currentPage + 1);
	        pagination.appendChild(nextLink);
	    }
		else{
			const nextLink = document.createElement('a');
			nextLink.href = "#";
			nextLink.textContent = 'Next';
			nextLink.style.pointerEvents='none';
			pagination.appendChild(nextLink);
		}
	}
	

let productDetails=[];
//store products details to select option tag
function loadProductDetails(){
	const xhr = new XMLHttpRequest();
	xhr.open("GET",`/GoodsReceiptServlet/GRServlet?loadProduct=${true}`,false);
	xhr.setRequestHeader('Content-Type','application/json');
	xhr.onload=function(){
		if (xhr.status === 200) {
		  const response = JSON.parse(xhr.responseText);
		  productDetails=JSON.parse(xhr.responseText);
		  console.log(productDetails);
		  let select = document.getElementById("productSelect");
		  productDetails.forEach((product)=> {
			 const optionTag=document.createElement('option');
			   optionTag.value=product.productID+" "+product.productName;
			   optionTag.textContent=product.productName;
			   productUom.push(product.productUom);
			 select.appendChild(optionTag);
			});				
		} else {
			console.error("Failed to fetch data:", xhr.status);
		}
	}
	xhr.send();
}

let vendorDeatils=[];
function loadVendorDetails(){
	const xhr = new XMLHttpRequest();
	xhr.open("GET",`/GoodsReceiptServlet/GRServlet?loadVendor=${true}`,false);
	xhr.setRequestHeader('Content-Type','application/json');
	xhr.onload=function(){
		if (xhr.status === 200) {
		  const response = JSON.parse(xhr.responseText);
		  vendorDeatils=JSON.parse(xhr.responseText);
		  console.log(vendorDeatils);
		  let select = document.getElementById("selectedVendor");
		  vendorDeatils.forEach((vendor)=> {
			 const optionTag=document.createElement('option');
			   optionTag.value=vendor.vendorID+" "+vendor.vendorName;
			   optionTag.textContent=vendor.vendorName;
			 select.appendChild(optionTag);
			});				
		} else {
			console.error("Failed to fetch data:", xhr.status);
		}
	}
	xhr.send();
}


//delete Receipt
let deleteReceiptID="";
function deleteReceiptIcon(button) {
    var tdValue =button.closest('tr').querySelectorAll('td'); 
	deleteReceiptID=tdValue[2].textContent.trim();
	document.getElementById("id").innerHTML="Receipt ID: "+"<b>"+deleteReceiptID+"</b>";
	console.log();
	const over = document.getElementById("list-d-overlay");
	const popDialog = document.getElementById("list-d-popupDialog");
	    over.style.display = "block";
	    popDialog.style.display = "block";
	    popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";
	document.getElementById('deleteLineName').innerHTML = tdValue[2].textContent.trim();
}

function deleteReceipt(){
	const xhr = new XMLHttpRequest();
	xhr.open("POST","deleteReceiptServlet",true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onload = function() {
	        if (xhr.status === 200) {
	            const response = JSON.parse(xhr.responseText);
				console.log(response.res);
	            if (response.success) {
	                console.log('Receipt deleted successfully.');
					if(document.getElementById('tableBody').rows.length === 0){
					  loadTable(currentPage-1);
					}
	                loadTable(currentPage);
					closeDeletePopup1(); 
	            } else {
	                alert('Failed to delete receipt.');
	            }
	        } 
			else {
	            console.error('Failed to delete receipt:', xhr.status);
	        }	
	    };
		xhr.send("receiptID=" + encodeURIComponent(deleteReceiptID));
}
function closeDeletePopup1(){
	const over = document.getElementById("list-d-overlay");
	const popDialog = document.getElementById("list-d-popupDialog");
	if(over.style.display == "block"){
		 over.style.display = "none";}
		 popDialog.style.display = "none";
		 popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";
	     document.getElementById("id").innerHTML="";
}


//Old code
let randomNumberArray = [];
function createBtn() {
    const createForm = document.getElementById('goodsReceiptForm');
    if (createForm.style.display === "none") {
        createForm.style.display = "block";
    }
    const over = document.getElementById("list-d-overlay");
    over.style.display = "block";

    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * 900) + 100;
    } while (randomNumberArray.includes(randomNumber));

    randomNumberArray.push(randomNumber);

    let startDate = document.getElementById('receiptDate');

    let maxDate = new Date();
    const formattedMaxDate = maxDate.toISOString().split('T')[0];
    startDate.setAttribute('max', formattedMaxDate);

    let endDateInput = document.getElementById('expiryDate');
    endDateInput.setAttribute('min', formattedMaxDate);

    document.getElementById('receiptId').value = "GR" + randomNumber;
    document.getElementById('receiptId').disabled = true;
    document.getElementById('receiptDate').value = formattedMaxDate;
    document.getElementById('selectedVendor').value = "";
    document.getElementById('productTableBody').innerHTML = "";
	document.getElementById('SelectAllProductRow').checked=false;
    const editSubmitBtn = document.getElementById('submitButton');
    const editUpdateBtn = document.getElementById('updateButton');

    if (editSubmitBtn.style.display === "none") {
        editUpdateBtn.style.display = "none";
        editSubmitBtn.style.display = "block";
    }
    swapButton('selectAllDeleteBtn', 'selectAndDeleteBtn')
}

function swapButton(noneElement, blockElement){
    document.getElementById(noneElement).style.display = "none";
    document.getElementById(blockElement).style.display = "block";
}


//line item add button
const productUom = [""];
function addProductRow() {
    event.preventDefault();
    let product = document.getElementById('productSelect').value;
    let edate = document.getElementById('expiryDate').value;
    let qty = document.getElementById('receivedquantity').value;
    const productTable = document.getElementById('productTableBody');
    let index = document.getElementById('productSelect').selectedIndex;
    let existingRow = Array.from(productTable.rows).find(row => row.cells[2].textContent === product);

    if (product.trim() === "") {
        document.getElementById('errorProductSelect').classList.add('Rerror');
    }
    else {
        document.getElementById('errorProductSelect').classList.remove('Rerror');
    }

    if (product.trim() === "" || existingRow) {
        document.getElementById('productSelect').style.borderColor = 'red';
    }

    if (qty.trim() === "" || qty <= 0) {
        document.getElementById('receivedquantity').style.borderColor = 'red';
        document.getElementById('rqa').classList.add('qerror');
    }
    else {
        document.getElementById('rqa').classList.remove('qerror');
        document.getElementById('receivedquantity').style.borderColor = ';'
    }

    let today = new Date(document.getElementById('receiptDate').value);
    let ed = new Date(edate);
    if (ed < today) {
        document.getElementById('expiryDate').style.borderColor = 'red';
        document.getElementById('expiryDate').classList.add('derror');
    }
    else {
        document.getElementById('expiryDate').classList.remove('derror');
    }

    if (existingRow) {
        document.getElementById('errorProductSelect').classList.add('error');
    }
    else {
        document.getElementById('errorProductSelect').classList.remove('error');
    }

    if (product != "" && (qty != "" && qty > 0) && (edate == "" || ed >= today) && !existingRow) {
        
        document.getElementById('fieldsetLine').style.borderColor = '';
        document.getElementById('fieldsetLineError').style.display = 'none';

        let formatChangedDate = dateFormatChange(edate);

        const rowCount = productTable.rows.length;
        const row = productTable.insertRow(rowCount);
        row.innerHTML = `
            <td><input type="checkbox" class="selectProductRow"></td>
            <td>${rowCount + 1}</td>
            <td id="productName">${product}</td>
            <td>${formatChangedDate}</td>
            <td>${qty}</td>
            <td>${productUom[index]}</td>    
            <td class="action">
                <i id="editIcon" title="edit" onclick="editRow(this)" class="fa-solid fa-pen-to-square"></i>
                <i id="deleteIcon" title="delete" onclick="deleteRow(this)" class="fa-solid fa-trash"></i>
            </td>
        `;

        // Scroll the page to the newly added row
        row.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        document.getElementById('productSelect').value = "";
        document.getElementById('expiryDate').value = "";
        document.getElementById('receivedquantity').value = "";
        
    }
}


//clear button - line item

function clearProductRow() {
    event.preventDefault();
    let product = document.getElementById('productSelect');
    let edate = document.getElementById('expiryDate');
    let qty = document.getElementById('receivedquantity');
    product.style.borderColor = '#ddd';
    edate.style.borderColor = '#ddd';
    qty.style.borderColor = '#ddd';
    document.getElementById('errorProductSelect').classList.remove('error');
    document.getElementById('expiryDate').classList.remove('derror');
    document.getElementById('rqa').classList.remove('qerror');
    document.getElementById('errorProductSelect').classList.remove('Rerror');
    product.value = "";
    edate.value = "";
    qty.value = "";
}

//Edit Lineitem
let parentrow = "";
function editRow(button) {
    event.preventDefault();
    const editIcon = document.querySelectorAll("#editIcon");
    for (let i = 0; i < editIcon.length; i++) {
        editIcon[i].style.opacity = '1';
    }
    button.style.opacity = '0.3';

    document.getElementById('lineItemLegend').innerHTML = '<b>Update Line Item</b>';
    const row = button.parentNode.parentNode;
    parentrow = row;

    const td = row.querySelectorAll('td');
    const product = td[2].innerText;

    let formatChangedDate = dateFormatChange(td[3].innerText);
    const date = formatChangedDate;

    const rquantity = td[4].innerText;

    let add = document.getElementById('addbtn');
    let update = document.getElementById('updatebtn');
    add.style.display = 'none';
    update.style.display = 'flex';

    document.getElementById('errorProductSelect').classList.remove('error');
    document.getElementById('expiryDate').classList.remove('derror');
    document.getElementById('errorProductSelect').classList.remove('Rerror');
    document.getElementById('rqa').classList.remove('qerror');
    document.getElementById('productSelect').style.borderColor = '#ddd';
    document.getElementById('expiryDate').style.borderColor = '#ddd';
    document.getElementById('receivedquantity').style.borderColor = '#ddd';
    document.getElementById('productSelect').value = product.trim();
    document.getElementById('expiryDate').value = date;
    document.getElementById('receivedquantity').value = rquantity;
}


//Update Line Item button
function updateProductRow(event) {
    event.preventDefault();
    document.getElementById('lineItemLegend').innerHTML = '<b>Add Line Item</b>';
    document.getElementById('errorProductSelect').classList.remove('error');

    let product = document.getElementById('productSelect').value;
    let edate = document.getElementById('expiryDate').value;
    let qty = document.getElementById('receivedquantity').value;

    if (product.trim() === "") {
        document.getElementById('productSelect').style.borderColor = 'red';
        document.getElementById('errorProductSelect').classList.add('Rerror');
    }
    else {
        document.getElementById('errorProductSelect').classList.remove('Rerror');
    }

    if (qty.trim() === "" || qty <= 0) {
        document.getElementById('receivedquantity').style.borderColor = 'red';
        document.getElementById('rqa').classList.add('qerror');
    }
    else {
        document.getElementById('rqa').classList.remove('qerror');
        document.getElementById('receivedquantity').style.borderColor = ';'
    }

    let today = new Date(document.getElementById('receiptDate').value);
    let ed = new Date(edate);
    if (ed < today) {
        document.getElementById('expiryDate').style.borderColor = 'red';
        document.getElementById('expiryDate').classList.add('derror');
    }
    else {
        document.getElementById('expiryDate').classList.remove('derror');
    }

    const td = parentrow.querySelectorAll('td');
    let index = document.getElementById('productSelect').selectedIndex;
    const arr = ["", "pieces", "pieces", "pieces", "kilogram", "pieces", "pieces", "kilogram"]

    const productTable = document.getElementById('productTableBody');
    let existingRow = Array.from(productTable.rows).find(row => row !== parentrow && row.cells[2].textContent === product);
    if (existingRow) {
        document.getElementById('errorProductSelect').classList.add('error');
        document.getElementById('productSelect').style.borderColor = 'red';
    }
    else {
        document.getElementById('errorProductSelect').classList.remove('error');
    }

    let formatChangedDate = dateFormatChange(edate);

    if (product != "" && (qty != "" && qty > 0) && (edate == "" || ed >= today) && !existingRow) {
        const editIcon = document.querySelectorAll("#editIcon");
        for (let i = 0; i < editIcon.length; i++) {
            editIcon[i].style.opacity = '1';
        }
        td[2].innerText = product;
        td[3].innerText = formatChangedDate;
        td[4].innerText = qty;
        td[5].innerText = arr[index];
        document.getElementById('updatebtn').style.display = 'none';
        document.getElementById('addbtn').style.display = 'flex';
        document.getElementById('productSelect').value = "";
        document.getElementById('expiryDate').value = "";
        document.getElementById('receivedquantity').value = "";
    }
}

// Cancel Button
function cancelbtn() {
    event.preventDefault();
    const editIcon = document.querySelectorAll("#editIcon");
    for (let i = 0; i < editIcon.length; i++) {
        editIcon[i].style.opacity = '1';
    }
    document.getElementById('errorProductSelect').classList.remove('error');
    document.getElementById('expiryDate').classList.remove('derror');
    document.getElementById('rqa').classList.remove('qerror');
    document.getElementById('errorProductSelect').classList.remove('Rerror');
    document.getElementById('lineItemLegend').innerHTML = '<b>Add Line Item</b>';
    document.getElementById('updatebtn').style.display = 'none';
    document.getElementById('addbtn').style.display = 'flex';
    let product = document.getElementById('productSelect');
    let edate = document.getElementById('expiryDate');
    let qty = document.getElementById('receivedquantity');
    product.style.borderColor = '#ddd';
    edate.style.borderColor = '#ddd';
    qty.style.borderColor = '#ddd';
    product.value = "";
    edate.value = "";
    qty.value = "";
}

//Lineitem delete icon 
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    parentrow = row;
    let name = row.cells[2].innerText;
    let product = document.getElementById('productSelect').value;
    if (!(name == product)) {
        openDeletePopup('overlay', 'popupDialog');
        document.getElementById('deleterowproductname').innerHTML = name;
    }
    else {
        alert("You can't delete this product while it's being Updating");
    }

}

//Yes button function for lineitem delete icon
function yesfn() {
    parentrow.parentNode.removeChild(parentrow);
    const productTable = document.getElementById('productTableBody');
    const rows = productTable.rows;
    for (let i = 0; i < rows.length; i++) {
        rows[i].cells[1].innerText = i + 1;
    }
    closeDeletePopup('overlay', 'popupDialog');
}

//No button function for lineitem delete icon
function nofn() {
    closeDeletePopup('overlay', 'popupDialog');
}


//focus event
const inputFields = ['productSelect', 'expiryDate', 'receivedquantity', 'receiptId', 'receiptDate', 'selectedVendor'];
inputFields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('focus', function() {
        this.style.borderColor = '#ddd';
    });
});




//Store receipt to database
function submitData() {
    event.preventDefault();
    const productTable = document.getElementById('productTableBody');
    const rows = productTable.rows;

    const receiptId = document.getElementById('receiptId').value.trim();
    const receiptDate = document.getElementById('receiptDate').value.trim();
    const selectedVendor = document.getElementById('selectedVendor').value.trim();

    let check = true;
    if (selectedVendor === "") {
        document.getElementById('selectedVendor').style.borderColor = 'red';
        check = false;
    }
    if (check && productTable.innerHTML === "") {
        document.getElementById('fieldsetLine').style.borderColor = 'red';
        document.getElementById('fieldsetLineError').style.display = 'block';
    }

    let formatChangedDate = receiptDate;
    let checkUpdateBtn = (document.getElementById('updatebtn').style.display === 'flex');
    if (checkUpdateBtn) {
        alert('Product update in progress. Please wait');
    }

    if (check && productTable.innerHTML !== "" && !checkUpdateBtn) {
        const newReceipt = {
            receiptID: receiptId,
            receiptDate: formatChangedDate,
            selectedVendor: selectedVendor,
            products: []
        };

        // Loop through each row of the table and set data to newreceipt
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            const productData = {
                id: cells[1].textContent.trim(),
                productName: cells[2].textContent.trim(),
                expiryDate: cells[3].textContent.trim(),
                quantity: cells[4].textContent.trim(),
                uom: cells[5].textContent.trim()
            };
            newReceipt.products.push(productData);
        }

        // Push the new receipt data to the global variable
		StoreReceipt(newReceipt);
        console.log("Receipt data stored:", newReceipt);
		

        // Close Goods receipt form
        const createForm = document.getElementById('goodsReceiptForm');
        if (createForm.style.display === "block") {
            createForm.style.display = "none";
        }
        const over = document.getElementById("list-d-overlay");
        over.style.display = "none";

        document.getElementById('productSelect').value = "";
        document.getElementById('expiryDate').value = "";
        document.getElementById('receivedquantity').value = "";

        let add = document.getElementById('addbtn');
        let update = document.getElementById('updatebtn');

        if (add.style.display = "none") {
            update.style.display = 'none';
            add.style.display = 'flex';
        }
        // show recipt data in goods receipt list
        
        document.getElementById('errorProductSelect').classList.remove('error');
        document.getElementById('expiryDate').classList.remove('derror');
        document.getElementById('rqa').classList.remove('qerror');
        document.getElementById('errorProductSelect').classList.remove('Rerror');
        document.getElementById('productSelect').style.borderColor = '';
        document.getElementById('receivedquantity').style.borderColor = '';
       
    }
}

// send receipt data to database
function StoreReceipt(newReceipt) {
    const jsonString = JSON.stringify(newReceipt);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "GRServlet", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        if (xhr.status === 200) {
            loadTable(1);
        } else {
            console.error('Failed to store receipt:', xhr.status);
            alert('Failed to store receipt: ' + xhr.status);
        }
    };
    xhr.send("receiptData=" + encodeURIComponent(jsonString));
}



//close create or update tab 
function back() {
    event.preventDefault();
    document.getElementById('fieldsetLine').style.borderColor = '';
    document.getElementById('fieldsetLineError').style.display = 'none';
    document.getElementById('receiptId').style.borderColor = '';
    document.getElementById('receiptDate').style.borderColor = '';
    document.getElementById('selectedVendor').style.borderColor = '';
    document.getElementById('productSelect').value = "";
    document.getElementById('expiryDate').value = "";
    document.getElementById('receivedquantity').value = "";

    let add = document.getElementById('addbtn');
    let update = document.getElementById('updatebtn');

    if (add.style.display = "none") {
        update.style.display = 'none';
        add.style.display = 'flex';
    }

    document.getElementById('h1').innerText = "Goods Receipt";

    document.getElementById('errorProductSelect').classList.remove('error');
    document.getElementById('expiryDate').classList.remove('derror');
    document.getElementById('rqa').classList.remove('qerror');
    document.getElementById('errorProductSelect').classList.remove('Rerror');
    document.getElementById('productSelect').style.borderColor = '';
    document.getElementById('receivedquantity').style.borderColor = '';


    const createForm = document.getElementById('goodsReceiptForm');
    if (createForm.style.display === "block") {
        createForm.style.display = "none";
    }
    const over = document.getElementById("list-d-overlay");
    over.style.display = "none";
}


// line item check box
function loop() {
    const selectAllRow = document.getElementById('selectAllRow');
    const checkboxes = document.querySelectorAll('.selectRow');
    const selectAndDeleteBtn = document.getElementById('selectAndDeleteBtn');
    const selectAllDeleteBtn = document.getElementById('selectAllDeleteBtn');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllRow.checked;
        checkbox.addEventListener('change', () => {
            updateDeleteButtons(checkboxes, selectAllRow, selectAndDeleteBtn, selectAllDeleteBtn);
        });
    });
}

//Select and Delete
function selectAll(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('.selectRow');
    const selectAllRowCheckbox = document.getElementById('selectAllRow');
    const selectAndDeleteBtn = document.getElementById('selectAndDeleteBtn');
    const selectAllDeleteBtn = document.getElementById('selectAllDeleteBtn');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        checkbox.addEventListener('change', () => {
            updateDeleteButtons(checkboxes, selectAllRowCheckbox, selectAndDeleteProductBtn, selectAllDeleteProductBtn);
        });
    });
    updateDeleteButtons(checkboxes, selectAllRowCheckbox, selectAndDeleteBtn, selectAllDeleteBtn);
}


//Open Popup for DeleteAll Btn
let flagSelectAllDeleteBtn = false;
function selectAllDeleteBtn() {
    const selectRows = document.querySelectorAll('.selectRow');
    let checkedIdArray = [];

    selectRows.forEach(checkbox => {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const checkedReceiptID = row.cells[2].innerText;
            checkedIdArray.push(checkedReceiptID);
        }
    });


    if (document.getElementById('selectAllRow').checked === true) {
        openDeletePopup('list-d-overlay', 'selectList-d-popupDialog');
        document.getElementById('deleteReceiptId').innerHTML = "Are you sure you want to Delete All Receipt";
        flagSelectAllDeleteBtn = true;
    }
}



function deleteselectedReceipt(){
	const xhr = new XMLHttpRequest();
	xhr.open("POST","deleteReceiptServlet",false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onload = function() {
	        if (xhr.status === 200) {
	            const response = JSON.parse(xhr.responseText);
				console.log(response.res);
	            if (response.success) {
	                console.log('Receipt deleted successfully.');
				
	            } else {
	                console.log('Failed to delete receipt.');
	            }
	        } 
			else {
	            console.log('Failed to delete receipt:', xhr.status);
	        }	
	    };
		xhr.send("receiptID=" + encodeURIComponent(deleteReceiptID));
}

//Delete Method Yes or no Funtions
function deleteListYesfn() {

    if (flagSelectAllDeleteBtn) {
		const selectedCheckboxes = document.querySelectorAll('.selectRow:checked');
		        selectedCheckboxes.forEach(checkbox => {
		            const row = checkbox.closest('tr');
					deleteReceiptID=row.cells[2].innerText;
					deleteselectedReceipt();
		 });
        closeDeletePopup('list-d-overlay', 'selectList-d-popupDialog');
		if (document.getElementById('tableBody').rows.length === 0){
			loadTable(currentPage-1);
		}else{
			loadTable(currentPage);}
        document.getElementById('deleteReceiptId').innerHTML = "";
        document.getElementById('selectAllRow').checked = false;
        flagSelectAllDeleteBtn = false;

        return;
    }
    else if (flagSelectAndDeleteBtn) {
        document.getElementById('deleteReceiptId').innerHTML = "";
        const selectedCheckboxes = document.querySelectorAll('.selectRow:checked');
        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
			deleteReceiptID=row.cells[2].innerText;
			deleteselectedReceipt();
        });
		closeDeletePopup('list-d-overlay', 'selectList-d-popupDialog');
		if (document.getElementById('tableBody').rows.length === 0){
			loadTable(currentPage-1);
		}else{
		loadTable(currentPage);}
        flagSelectAndDeleteBtn = false;
        return;
    }

    
// line items Delete Button
    if (flagSelectAllProductDeleteBtn) {
        const productTableBody = document.getElementById('productTableBody');
        productTableBody.innerHTML = '';
        closeDeletePopup('p-overlay', 'p-popupDialog');
        document.getElementById('deleteproductname').innerHTML = "";
        document.getElementById('SelectAllProductRow').checked = false;
        flagSelectAllProductDeleteBtn = false;
        document.getElementById('selectAllDeleteProductBtn').style.display="none";
        document.getElementById('selectAndDeleteProductBtn').style.display="block";
        return;
    }
    else if(flagSelectAndDeleteProductBtn){
        closeDeletePopup('p-overlay', 'p-popupDialog');
        document.getElementById('deleteproductname').innerHTML = "";
        const selectedCheckboxes = document.querySelectorAll('.selectProductRow:checked');
        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.remove();
        });

        const productTable = document.getElementById('productTableBody');
        const rows = productTable.rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[1].innerText = i + 1;
        }
        flagSelectAndDeleteProductBtn = false;

        return; 
    }


}

//No for Select and Delete Method
function deleteListNofn() {
    if (flagSelectAllDeleteBtn) {
        const selectRowsClear = document.querySelectorAll('.selectRow');
        selectRowsClear.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    closeDeletePopup('list-d-overlay', 'selectList-d-popupDialog');

    document.getElementById('selectAllRow').checked = false;
    document.getElementById('selectAllDeleteBtn').style.display = "none";
    document.getElementById('selectAndDeleteBtn').style.display = "block";

    flagSelectAllDeleteBtn = false;
    flagSelectAndDeleteBtn = false;
    console.log(flagSelectAllDeleteBtn, flagSelectAndDeleteBtn);
}


function deletePoductListNofn() {
    if (flagSelectAllProductDeleteBtn) {
        const selectRowsClear = document.querySelectorAll('.selectProductRow');
        selectRowsClear.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    closeDeletePopup('p-overlay', 'p-popupDialog');
    document.getElementById('deleteproductname').innerHTML = "";
    document.getElementById('SelectAllProductRow').checked = false;
    flagSelectAllProductDeleteBtn = false;
}


//Open Popup for Select and Delete Btn
let flagSelectAndDeleteBtn = false;
function selectAndDeleteBtn() {
    const selectRows = document.querySelectorAll('.selectRow');
    let checkedIdArray = [];

    selectRows.forEach(checkbox => {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const checkedReceiptID = row.cells[2].innerText;
            checkedIdArray.push(checkedReceiptID);
        }
    });
    if (checkedIdArray.length > 0) {
        openDeletePopup('list-d-overlay', 'selectList-d-popupDialog');
        document.getElementById('deleteReceiptId').innerHTML = "Are you sure you want to Delete the selected receipt(s)<br>" + "<b> <center> [" + checkedIdArray + "] </center></b>";
        flagSelectAndDeleteBtn = true;
        checkedIdArray = [];
    }
}

function clearAllCheckboxes() {
    const selectRowsClear = document.querySelectorAll('.selectRow');
    selectRowsClear.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// CheckBoxes function for Lineitems---
function loop2() {
    let selectAllRow = document.getElementById('SelectAllProductRow');
    let checkboxes = document.querySelectorAll('.selectProductRow');
    let selectAndDeleteProductBtn = document.getElementById('selectAndDeleteProductBtn');
    let selectAllDeleteProductBtn = document.getElementById('selectAllDeleteProductBtn');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllRow.checked;
        checkbox.addEventListener('change', () => {
            updateDeleteButtons(checkboxes, selectAllRow, selectAndDeleteProductBtn, selectAllDeleteProductBtn);
        });
    });
}

function clearAllProductCheckboxes() {
    const selectRowsClear = document.querySelectorAll('.selectProductRow');
    selectRowsClear.forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('SelectAllProductRow').checked=false;
}

//SelectAll checkbox
function selectAllProduct(selectAllCheckbox) {
    const selectAllRowCheckbox = document.getElementById('SelectAllProductRow');
    const checkboxes = document.querySelectorAll('.selectProductRow');
    const selectAndDeleteProductBtn = document.getElementById('selectAndDeleteProductBtn');
    const selectAllDeleteProductBtn = document.getElementById('selectAllDeleteProductBtn');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        checkbox.addEventListener('change', () => {
            updateDeleteButtons(checkboxes, selectAllRowCheckbox, selectAndDeleteProductBtn, selectAllDeleteProductBtn);
        });
    });
    updateDeleteButtons(checkboxes, selectAllRowCheckbox, selectAndDeleteProductBtn, selectAllDeleteProductBtn);
}

function updateDeleteButtons(checkboxes, selectAllRowCheckbox, selectAndDeleteBtn, selectAllDeleteBtn) {
    let allChecked = true;
    let anyChecked = false;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            anyChecked = true;
        } else {
            allChecked = false;
        }
    });

    selectAllRowCheckbox.checked = allChecked;

    if (allChecked) {
        selectAndDeleteBtn.style.display = "none";
        selectAllDeleteBtn.style.display = "block";
    } else if (anyChecked) {
        selectAndDeleteBtn.style.display = "block";
        selectAllDeleteBtn.style.display = "none";
    } else {
        selectAndDeleteBtn.style.display = "block";
        selectAllDeleteBtn.style.display = "none";
    }
}

//select all delete for line items
let flagSelectAllProductDeleteBtn = false;
function selectAllProductDeleteBtn() {
    if (document.getElementById('SelectAllProductRow').checked == true) {
        openDeletePopup('p-overlay', 'p-popupDialog');
        document.getElementById('deleteproductname').innerHTML = "All Products";
        flagSelectAllProductDeleteBtn = true;
    }
}

let flagSelectAndDeleteProductBtn = false;
function SelectAndDeleteProductBtn() {

    const selectRows = document.querySelectorAll('.selectProductRow');
    let checkedIdArray = [];
    selectRows.forEach(checkbox => {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const checkedReceiptID =" "+row.cells[2].innerText.split(" ")[1];
            checkedIdArray.push(checkedReceiptID);
        }
    });
    if (checkedIdArray.length > 0) {
        openDeletePopup('p-overlay', 'p-popupDialog');
        document.getElementById('deleteproductname').innerHTML = "this Products<br>"+"<b>[ "+ checkedIdArray +" ]</b>";
        flagSelectAndDeleteProductBtn = true;
        checkedIdArray = [];
    }
}


//Functions for open close popup dialogue box
function openDeletePopup(element1,element2){
    const over = document.getElementById(element1);
    const popDialog = document.getElementById(element2);
    over.style.display = "block";
    popDialog.style.display = "block";
    popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";
}
function closeDeletePopup(element1,element2){
    const over = document.getElementById(element1);
    const popDialog = document.getElementById(element2);
	if(over.style.display=="block"){
    over.style.display = "none";}
    popDialog.style.display = "none";
    popDialog.style.opacity = popDialog.style.opacity === "1" ? "0" : "1";
}



//update receipt 

let updateParentRow = "";
//Edit List row
function listEditRow(button) {

    const createForm = document.getElementById('goodsReceiptForm');
    if (createForm.style.display === "none") {
        createForm.style.display = "block";
    }

    document.getElementById('h1').innerText = "Update Goods Receipt";

    document.getElementById('productSelect').style.borderColor = '#ddd';
    document.getElementById('expiryDate').style.borderColor = '#ddd';
    document.getElementById('receivedquantity').style.borderColor = '#ddd';
    document.getElementById('errorProductSelect').classList.remove('error');
    document.getElementById('expiryDate').classList.remove('derror');
    document.getElementById('rqa').classList.remove('qerror');
    document.getElementById('errorProductSelect').classList.remove('Rerror');

    const over = document.getElementById("list-d-overlay");
    over.style.display = "block";
    document.getElementById('productTableBody').innerHTML = "";
    const row = button.parentNode.parentNode;
    updateParentRow = row;

    let formatChangedDate = dateFormatChange(row.cells[3].innerText.trim());
    
	getReceiptLineItems(row.cells[2].innerText);
	
    document.getElementById('receiptId').value = row.cells[2].innerText;
    document.getElementById('receiptDate').value = formatChangedDate;
	const foundObject = vendorDeatils.find(obj => obj.vendorName === row.cells[4].innerText);
    document.getElementById('selectedVendor').value = foundObject.vendorID+" "+row.cells[4].innerText;

    const editSubmitBtn = document.getElementById('submitButton');
    const editUpdateBtn = document.getElementById('updateButton');

    if (editUpdateBtn.style.display === "none") {
        editSubmitBtn.style.display = "none";
        editUpdateBtn.style.display = "block";
    }
	document.getElementById('receiptId').disabled = true;	   
    document.getElementById('selectAllRow').checked = false;
    document.getElementById('selectAllDeleteBtn').style.display = "none";
    document.getElementById('selectAndDeleteBtn').style.display = "block";
}


function getReceiptLineItems(value) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/GoodsReceiptServlet/GRServlet?receiptID=${value}`, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {			
			          var receiptLineItems = JSON.parse(xhr.responseText);
			          var tbody = document.getElementById("productTableBody");
			          
					  var rowsHtml = "";
					  receiptLineItems.forEach((item, index)=> {
						
					      rowsHtml += `<tr>
									<td><input type="checkbox" class="selectProductRow"></td>
									<td>${(index + 1) }</td>
									<td id="productName">${getProductKey(item.productId)+" "+item.productId}</td>
									<td>${dateFormatChange(item.date)}</td>
									<td>${item.quantity}</td>
									<td>${productUom[getProductUOMIndex(item.productId)]}</td>    
									<td class="action">
										<i id="editIcon" title="edit" onclick="editRow(this)" class="fa-solid fa-pen-to-square"></i>
										<i id="deleteIcon" title="delete" onclick="deleteRow(this)" class="fa-solid fa-trash"></i>
									</td>
									</tr>
							        `
						    });
					  tbody.innerHTML = rowsHtml;		  
        }
    };
    xhr.send();
}

function getProductUOMIndex(product){
	const selectElement = document.getElementById("productSelect");
	   for (let i = 0; i < selectElement.options.length; i++) {
	        const option = selectElement.options[i];
	        if (option.textContent.trim() === product) {
	            return i;
	        }
	    } 
	    return -1;
}


function updateData() {
    event.preventDefault();
    const productTable = document.getElementById('productTableBody');
    const rows = productTable.rows;
    const receiptId = document.getElementById('receiptId').value.trim();
    const receiptDate = document.getElementById('receiptDate').value.trim();
    const selectedVendor = document.getElementById('selectedVendor').value.trim();

    let check = true;
    if (selectedVendor === "") {
        document.getElementById('selectedVendor').style.borderColor = 'red';
        check = false;
    }
    if (check && productTable.innerHTML === "") {
        document.getElementById('fieldsetLine').style.borderColor = 'red';
        document.getElementById('fieldsetLineError').style.display = 'block';
    }

    let formatChangedDate = dateFormatChange(receiptDate);
    let checkUpdateBtn = (document.getElementById('updatebtn').style.display === 'flex');
    if (checkUpdateBtn) {
        alert('Product update in progress. Please wait');
    }

    if (check && productTable.innerHTML !== "" && !checkUpdateBtn) {

		deleteReceiptID=receiptId;
		deleteselectedReceipt(); 
		const newReceipt = {
		            receiptID: receiptId,
		            receiptDate: receiptDate,
		            selectedVendor: selectedVendor,
		            products: []
		        };

		        for (let i = 0; i < rows.length; i++) {
		            const cells = rows[i].cells;
		            const productData = {
		                id: cells[1].textContent.trim(),
		                productName: cells[2].textContent.trim(),
		                expiryDate: cells[3].textContent.trim(),
		                quantity: cells[4].textContent.trim(),
		                uom: cells[5].textContent.trim()
		            };
		            newReceipt.products.push(productData);
		        }

		
		console.log("Receipt data stored:", newReceipt);
		
		const createForm = document.getElementById('goodsReceiptForm');
		       if (createForm.style.display === "block") {
		           createForm.style.display = "none";
		       }
		       const over = document.getElementById("list-d-overlay");
		       over.style.display = "none";

				
        document.getElementById('h1').innerText = "Goods Receipt";
        document.getElementById('productSelect').value = "";
        document.getElementById('expiryDate').value = "";
        document.getElementById('receivedquantity').value = "";

        let add = document.getElementById('addbtn');
        let update = document.getElementById('updatebtn');

        if (add.style.display = "none") {
            update.style.display = 'none';
            add.style.display = 'flex';
        }

        document.getElementById('errorProductSelect').classList.remove('error');
        document.getElementById('expiryDate').classList.remove('derror');
        document.getElementById('rqa').classList.remove('qerror');
        document.getElementById('errorProductSelect').classList.remove('Rerror');
        document.getElementById('productSelect').style.borderColor = '';
        document.getElementById('receivedquantity').style.borderColor = '';
		StoreReceipt(newReceipt);
    }

}

function getProductKey(productName){
	const product = productDetails.find(p => p.productName.trim() === productName.trim());
	   return product ? product.productID : -1;
}
