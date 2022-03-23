'use strict';
import { database, toggleLoading } from './index.js';
import { collection, query, where, onSnapshot } from "firebase/firestore";

var orderTable;
const stateColors = ["badge bg-info", "badge bg-primary", "badge bg-warning", "badge bg-success"];
const stateTexts = ["Pending", "Processing", "On Delivery", "Delivered"];
const orderCheckBoxTemplate = '<label class="customcheckbox"><input type="checkbox" class="listCheckbox" /><span class="checkmark"></span></label>';
const editButtontemplate = '<button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#editOrderModal">Edit <i class="fas fa-edit"></i></button>';
const editButtonColumnIndex = 6;
var loadingTarget;

$(document).ready(function(){
    getDomReferences();
    initializeOrderTable();
    attachOrderTableListener();
    attachCheckBoxListener();
});

function getDomReferences(){
    loadingTarget = document.getElementById('loadingOverlay');
    const form = document.getElementById('editOrderForm');
    form.addEventListener('submit', saveOrder);
}

function initializeOrderTable(){
    orderTable = $("#zero_config").DataTable({
        columnDefs: [
            { orderable: false, targets: 0 }
        ],
        order: [[1, 'asc']],
        columns: [
            { defaultContent: orderCheckBoxTemplate},
            { data: 'id' },
            { data: 'checkOutDate' },
            { data: 'status' },
            { data: 'totalPrice' },
            { data: 'customerName' },
            { defaultContent: editButtontemplate}
        ],
        createdRow: function( row, data, dataIndex ) {            
            $(row).attr('id', data[0]);            
        }
    });
}

function attachOrderTableListener(){
    
    const q = query(collection(db, "orders").withConverter(orderConverter)/*, where("state", "==", "CA")*/);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            orderTable.row.add(change.doc.data()).draw();
        }
        if (change.type === "modified") {
            console.log("Modified order: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed order: ", change.doc.data());
        }
      });
    });
    
    /*const ordersRef = ref(database, 'orders');
    onValue(ordersRef, (snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var data = childSnapshot.val();
            
            let orderData = new Order(key, data['date_checkout'], data['state'], data['total_price'], data['person_name']);
            orderTable.row.add(orderData).draw();
        });
    });*/
}

function attachCheckBoxListener(){
    $("#allCheckbox").multicheck($(".listCheckbox"));
}

async function saveOrder(event) {
    event.preventDefault();
    toggleLoading('Saving order...', loadingTarget, true);
    const data = new FormData(event.target);
    const updatedOrder = Object.fromEntries(data.entries());
    console.log(updatedOrder);

    let orderId = $("#orderId").val();
    await setDoc(doc(db, "orders", orderId), updatedOrder);
    .then(function() {
        console.log("Order was updated successfully!");
        toggleLoading('', loadingTarget, false);
    });
}

class Order {
    constructor(id, date, status, totalPrice, customerName) {
        this.id = id;
        this.checkOutDate = date;
        this.totalPrice = totalPrice;
        this.customerName = customerName;
        this.status = function () {
            return `<span class="${stateColors[status]}">${stateTexts[status]}</span>`;
        };
    }
};

// Firestore data converter
const orderConverter = {
    toFirestore: (order) => {
        return order;
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Order(snapshot.id, data.date_checkout, data.state, data.total_price, data.person_name);
    }
};
