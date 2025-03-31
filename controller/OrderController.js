import Customer from "../model/Customer.js";
import Item from "../model/Item.js";
import Order from "../model/Order.js";
import OrderDetail from "../model/OrderDetail.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  var today = new Date().toISOString().split("T")[0];
  $("#date").val(today);

  $("#orderLink").on("click", function () {
    $("#orderId").val(generateNextOrderId());
    loadCustomerIds();
    loadItemCodes();
    console.log("order-page loads");
  });

  let selectedItemCode;
  let selectedItemName;
  let amountBuy;
  let selectedItemPrice;

  let cart = [];

  let totalBill = 0;

  $("#inventory").submit(function (e) {
    e.preventDefault();
    if (isValidated()) {
      selectedItemCode = $("#selectItemCode").val();
      selectedItemName = $("#selectItemName").val();
      amountBuy = $("#orderQuantity").val();
      selectedItemPrice = $("#selectItemPrice").val();

      let cartItem = new OrderDetail(
        $("#invoice #orderId").val(),
        selectedItemCode,
        amountBuy,
        selectedItemPrice
      );

      totalBill += selectedItemPrice * amountBuy;

      cart.push(cartItem);
      addToTable();
      updateBill();
      $("#inventory")[0].reset();
    }
  });

  function updateBill() {
    $("#totalBill").text(totalBill);

    let discount = $("#discount").val();
    let subTotal = $("#subTotal").val();

    if (discount === "") {
      discount = 0;
    }

    subTotal = totalBill - (totalBill * discount) / 100;

    $("#subTotal").text(subTotal);
  }

  function calculateDiscount() {}

  function addToTable() {
    let newRow = `<tr><td>${selectedItemCode}</td><td>${selectedItemName}</td><td>${amountBuy}</td><td>${selectedItemPrice}</td><td>${
      selectedItemPrice * amountBuy
    }</td></tr>`;
    $("#cartTable tbody").append(newRow);
  }

  $("#bill").submit(function (e) {
    e.preventDefault();
    if (isValidated()) {
      let order = new Order(
        $("#orderId").val(),
        $("#date").val(),
        $("#selectCustId").val(),
        cart
      );

      db.orders.push(order);

      $("#cartTable tbody").remove();

      alert("Order Completed!");

      $("#bill")[0].reset();
      $("#orderId").val(generateNextOrderId());
    }
  });

  function isValidated() {
    return true;
  }

  function loadCustomerIds() {
    const selectCustomer = $("#selectCustomer");
    selectCustomer.empty();

    selectCustomer.append(
      '<option selected disabled value="">Select Customer...</option>'
    );

    db.customers.forEach((customer) => {
      selectCustomer.append(
        `<option value="${customer.id}">${customer.id}</option>`
      );
    });

    selectCustomer.on("change", function () {
      const selectedCustomerId = $(this).val();
      if (selectedCustomerId) {
        const selectedCustomer = db.customers.find(
          (c) => c.id === selectedCustomerId
        );

        if (selectedCustomer) {
          $("#selectCustId").val(selectedCustomer.id);
          $("#selectCustName").val(selectedCustomer.name);
          $("#selectCustAddress").val(selectedCustomer.address);
          $("#selectCustSalary").val(selectedCustomer.salary);
        }
      } else {
        $("#selectCustId").val("");
        $("#selectCustName").val("");
        $("#selectCustAddress").val("");
        $("#selectCustSalary").val("");
      }
    });
  }

  function loadItemCodes() {
    const selectItem = $("#selectItem");
    selectItem.empty();

    selectItem.append(
      '<option selected disabled value="">Select Item...</option>'
    );

    db.items.forEach((item) => {
      selectItem.append(`<option value="${item.code}">${item.code}</option>`);
    });

    selectItem.on("change", function () {
      const selectedItemCode = $(this).val();
      if (selectedItemCode) {
        const selectedItem = db.items.find((i) => i.code === selectedItemCode);

        if (selectedItem) {
          $("#selectItemCode").val(selectedItem.code);
          $("#selectItemName").val(selectedItem.name);
          $("#availableQty").val(selectedItem.qty);
          $("#selectItemPrice").val(selectedItem.price);
        }
      } else {
        $("#selectItemCode").val("");
        $("#selectItemName").val("");
        $("#availableQty").val("");
        $("#selectItemPrice").val("");
      }
    });
  }

  function generateNextOrderId() {
    if (db.orders.length > 0) {
      let lastOrderId = db.orders[db.orders.length - 1].orderId;

      const numberPart = lastOrderId.split("-")[1];

      const nextNumber = parseInt(numberPart, 10) + 1;

      const nextId = `OID-${nextNumber.toString().padStart(3, "0")}`;

      return nextId;
    } else {
      return "OID-001";
    }
  }
});
