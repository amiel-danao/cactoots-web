'use strict';
import { database } from './index.js';
import { ref, onValue} from "firebase/database";

var orderTable;
const stateColors = ["badge badge-info", "badge badge-primary", "badge badge-warning", "badge badge-success"];
const stateTexts = ["Pending", "Processing", "On Delivery", "Delivered"];
const orderCheckBoxTemplate = '<label class="customcheckbox"><input type="checkbox" class="listCheckbox" /><span class="checkmark"></span></label>';

$(document).ready(function(){
    initializeOrderTable();
    attachOrderTableListener();
});

function initializeOrderTable(){
    orderTable = $("#zero_config").DataTable({
        columnDefs: [
            { orderable: false, targets: 0 }
        ],
        order: [[1, 'asc']],
        columns: [
            { data: orderCheckBoxTemplate},
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
        const data = snapshot.val();
              
        orderTable.row.add(
            new Order(snapshot.key, data['date_checkout'], data['state'], data['total_price'], data['person_name'])
        ).draw();
    });
}

function Order( id, date, status, totalPrice, customerName ) {
    this.id = id;
    this.checkOutDate = date;
    this.totalPrice = totalPrice;
    this.customerName = customerName;
    this.status = function () {
        return `<span class="${stateColors[status]}">${stateTexts[status]}</span>`;
    }
};
