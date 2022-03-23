'use strict';
import { database, toggleLoading } from './index.js';
import { collection, query, where, onSnapshot } from "firebase/firestore";

var orderTable;
const stateColors = ["badge bg-info", "badge bg-primary", "badge bg-warning", "badge bg-success"];
const stateTexts = ["Pending", "Processing", "On Delivery", "Delivered"];
const orderCheckBoxTemplate = '<label class="customcheckbox"><input type="checkbox" class="listCheckbox" /><span class="checkmark"></span></label>';
const editButtontemplate = '<button type="button" class="btn btn-info" data-toggle="modal" data-target=".bd-example-modal-xl">Edit <i class="fas fa-edit"></i></button>';
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

async function saveOrder(){
    toggleLoading('Saving order...', loadingTarget, true);
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
