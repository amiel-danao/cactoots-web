'use strict';
import { database } from './index.js';
import { ref, onValue} from "firebase/database";

var orderTable;
const stateColors = ["badge bg-info", "badge bg-primary", "badge bg-warning", "badge bg-success"];
const stateTexts = ["Pending", "Processing", "On Delivery", "Delivered"];
const orderCheckBoxTemplate = '<label class="customcheckbox"><input type="checkbox" class="listCheckbox" /><span class="checkmark"></span></label>';

$(document).ready(function(){
    initializeOrderTable();
    attachOrderTableListener();
    attachCheckBoxListener();
});

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
            { data: 'customerName' }
        ]
    });
}

function attachOrderTableListener(){
    const ordersRef = ref(database, 'orders');
    onValue(ordersRef, (snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var data = childSnapshot.val();
            
            let orderData = new Order(key, data['date_checkout'], data['state'], data['total_price'], data['person_name']);            
            orderTable.row.add(orderData).draw();
        });
    });
}

function attachCheckBoxListener(){
    $("#allCheckbox").multicheck($(".listCheckbox"));
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
