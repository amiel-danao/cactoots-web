'use strict';
import { database, toggleLoading, dateformat, PESO, firebaseTimeStampToDateString } from './index.js';
import { collection, query, where, onSnapshot, setDoc, doc } from "firebase/firestore";

var orderTable;
const stateColors = ["badge bg-info", "badge bg-primary", "badge bg-warning", "badge bg-success"];
const stateTexts = ["Pending", "Processing", "On Delivery", "Received"];
const orderCheckBoxTemplate = '<label class="customcheckbox"><input type="checkbox" class="listCheckbox" /><span class="checkmark"></span></label>';
const editButtontemplate = '<button type="button" class="btn btn-info editOrderButton" data-bs-toggle="modal" data-bs-target="#editOrderModal">Edit <i class="fas fa-edit"></i></button>';
var selectedOrder;
var updatedOrder;

$(function(){
    initializeOrderTable();
    attachEventListeners();    
    attachOrderTableListener();
    attachCheckBoxListener();
});

function attachEventListeners(){
    const form = document.getElementById('editOrderForm');
    form.addEventListener('submit', saveOrder);
    $("#zero_config tbody").on("click", ".editOrderButton", function(){
        let data = orderTable.row(this.parentNode).data();
        selectedOrder = data;
        updatedOrder = selectedOrder;
        console.log(selectedOrder);
    });

    var myModalEl = document.getElementById('editOrderModal');
    myModalEl.addEventListener('shown.bs.modal', function (event) {
        formDeserialize(form, selectedOrder);
    });
    
    form.addEventListener("change", function(event){
        console.log(event.target);
        let newValue = event.target.value;
        let propertyName = $(event.target).attr('name');
        let dataType = $(event.target).data('type');
        // TODO: process newValue based on data type
        if(dataType == "int"){
            newValue = parseInt(newValue);
        }
        
        updatedOrder[propertyName] = newValue;
    });
}

function formDeserialize(form, data) {
    const entries = (new URLSearchParams(data)).entries();
    for(const [key, val] of entries) {
        //http://javascript-coder.com/javascript-form/javascript-form-value.phtml
        const input = form.elements[key];
        if(input == null){
            continue;
        }
        
        let proxyLabel = $(form).find("p[data-proxy='"+input.id+"']");
        if($(input).hasClass('dateClass')){
            console.log(data[key]);
            if(proxyLabel != null){
                proxyLabel.text(firebaseTimeStampToDateString(data[key]));
            }
        }

        if($(input).hasClass('currency')){
            if(proxyLabel != null){
                proxyLabel.text(PESO(val).format());
            }
        }

        switch(input.type) {
            case 'checkbox': input.checked = !!val; break;
            default:         input.value = val;     break;
        }
    }
}

function initializeOrderTable(){
    orderTable = $("#zero_config").DataTable({
        columnDefs: [
            {
                orderable: false, targets: 0                
            },
            {
                render: function ( data, type, row ) {
                    return firebaseTimeStampToDateString(data);
                },
                targets: 2
            }
        ],
        order: [[1, 'asc']],
        columns: [
            { defaultContent: orderCheckBoxTemplate},
            { data: 'id' },
            { data: 'date_checkout' },
            { 
                data: 'state',
                render: function(data, type) {
                    return `<span class="${stateColors[data]}">${stateTexts[data]}</span>`;
                }
            },
            { data: 'total_price',
                render: (data, type)=>{
                    return PESO(data).format();
                }
            },
            { data: 'person_name' },
            { defaultContent: editButtontemplate}
        ],
        createdRow: function( row, data, dataIndex ) {            
            row.id = data.id;
        }
    });
}

function attachOrderTableListener(){
    
    const q = query(collection(database, "orders").withConverter(orderConverter)/*, where("state", "==", "CA")*/);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            orderTable.row.add(change.doc.data()).draw();
        }
        if (change.type === "modified") {
            console.log("Modified order: ", change.doc.data());
            orderTable.row('#'+change.doc.id).data( change.doc.data() ).draw();
        }
        if (change.type === "removed") {
            console.log("Removed order: ", change.doc.data());
        }
      });
    });
}

function attachCheckBoxListener(){
    $("#allCheckbox").multicheck($(".listCheckbox"));
}

async function saveOrder(event) {
    event.preventDefault();
    toggleLoading('Saving order...', true);
    console.log(updatedOrder);

    let orderId = $("#orderId").val();
    await setDoc(doc(database, "orders", orderId), Object.assign({}, updatedOrder))
    .then(function() {
        console.log("Order was updated successfully!");
        $('#editOrderModal').modal('hide');
        toggleLoading('', false);
    })
    .catch(error => {
        toggleLoading('', false);
        bootbox.alert(error);
    });
}

class Order {
    constructor(id, date, state, totalPrice, customerName) {
        this.id = id;
        this.date_checkout = date;
        this.total_price = totalPrice;
        this.person_name = customerName;
        this.state = state;
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