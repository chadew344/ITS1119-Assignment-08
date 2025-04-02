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
    checkNoData();
    loadCustomerIds();
    loadItemCodes();
    console.log("order-page loads");
  });

  let cart = [];
  let tableData = [];
  let totalBill = 0;
  let discount = 0;
  let modal;

  $("#inventory").submit(function (e) {
    e.preventDefault();
    if (inventoryValidation()) {
      let selectedItemCode = $("#selectItemCode").val();
      let selectedItemName = $("#selectItemName").val();
      let amountBuy = parseFloat($("#orderQuantity").val());
      let selectedItemPrice = $("#selectItemPrice").val();

      let cartItem = new OrderDetail(
        $("#invoice #orderId").val(),
        selectedItemCode,
        amountBuy,
        selectedItemPrice
      );

      let rowData = new ItemTable(
        selectedItemCode,
        selectedItemName,
        selectedItemPrice,
        amountBuy
      );

      totalBill += selectedItemPrice * amountBuy;

      cart.push(cartItem);
      tableData.push(rowData);
      loadCartTable();
      updateBill();
      $("#inventory")[0].reset();
    }
  });

  function updateBill() {
    $("#totalBill").text(totalBill.toFixed(2));

    let discount = $("#discount").val();
    let subTotal = parseFloat($("#subTotal").val());

    if (discount === "") {
      discount = 0;
    }

    subTotal = totalBill - (totalBill * discount) / 100;

    $("#subTotal").text(subTotal.toFixed(2));
  }

  function loadCartTable() {
    $("#cartTable tbody").empty();

    if ($("#cartTable tbody").length === 0) {
      $("#cartTable").append("<tbody></tbody>");
    }

    tableData.forEach((data) => {
      let newRow = `<tr><td>${data.itemCode}</td><td>${data.itemName}</td><td>${
        data.unitPrice
      }</td><td>${data.qtyBuy}</td><td>${
        data.unitPrice * data.qtyBuy
      }</td></tr>`;
      $("#cartTable tbody").append(newRow);
    });
  }

  $("#bill").submit(function (e) {
    e.preventDefault();
    if (billValidatioin()) {
      modal = createAlertModel("Confirm Order", "Would you like to proceed?");

      modal
        .find(".btn-primary")
        .text("Place Order")
        .off("click")
        .on("click", function () {
          let dis = parseInt($("#discount").val());
          if (dis >= 0 && dis <= 100) {
            discount = dis;
          }

          let order = new Order(
            $("#orderId").val(),
            $("#date").val(),
            $("#selectCustId").val(),
            totalBill,
            discount
          );

          db.orders.push(order);
          db.orderDetails.push(...cart);

          updateInventory();
          modal.modal("hide");
          appendAlert("Order completed Successfully!", "success");

          refreshPlaceOrder(order);
        });

      modal.find(".btn-secondary").text("Cancel");
      modal.modal("show");
    }
  });

  function updateInventory() {
    cart.forEach((item) => {
      const index = db.items.findIndex((i) => i.code === item.itemCode);
      console.log("Item Update: " + index);
      if (index !== -1) {
        console.log("Item Array qty: " + db.items[index].qty);
        db.items[index].qty -= item.qty;
      }
    });
  }

  function refreshPlaceOrder() {
    console.log(db.orders);
    console.log(db.orderDetails);

    totalBill = 0;

    $("#bill")[0].reset();
    $("#inventory")[0].reset();
    $("#invoice")[0].reset();

    $("#cashAmountError").text("");
    $("#subTotal").text("0.00");
    $("#totalBill").text("0.00");

    $("#orderId").val(generateNextOrderId());
    $("#date").val(today);

    cart = [];
    tableData = [];

    loadCartTable();
    checkNoData();
  }

  function billValidatioin() {
    let custID = $("#selectCustId").val();
    let cashAmount = $("#cashAmount").val();

    let isValid = true;

    if (cart.length === 0) {
      appendAlert("No items added!", "danger");
      isValid = false;
    }

    if (!custID) {
      $("#selectCustomer").addClass("border-danger");
      setTimeout(function () {
        $("#selectCustomer").removeClass("border-danger");
      }, 5000);

      appendAlert("Customer must be selected!", "danger");
      isValid = false;
    }

    console.log(cashAmount >= subTotal);

    if (!cashAmount) {
      $("#cashAmountError").text("Enter cash amount...");
      isValid = false;
    } else if (cashAmount < 0) {
      $("#cashAmountError").text("Invalid value for the cash amount...");
      isValid = false;
    } else if (cashAmount < subTotal) {
      $("#cashAmountError").text("The cash amount entered is insufficient...");
      isValid = false;
    } else {
      $("#cashAmountError").text("");
    }

    if (!isValid) {
      fieldBoderChange($("#cashAmount"));
    }

    return isValid;
  }

  function inventoryValidation() {
    let qty = $("#orderQuantity").val();

    let isValid = true;

    if (!qty) {
      $("#orderQtyError").text("Order amount is required");
      isValid = false;
    } else if (qty < 0) {
      $("#orderQtyError").text("Invalid value for the Order amount...");
      isValid = false;
    } else {
      $("#orderQtyError").text("");
    }

    if (!isValid) {
      fieldBoderChange($("#orderQuantity"));
    }

    isValid = checkStock(parseInt(qty));

    return isValid;
  }

  function fieldBoderChange(field) {
    $(field).addClass("border-danger");

    setTimeout(function () {
      $(field).removeClass("border-danger");
    }, 2000);
  }

  function checkStock(orderQty) {
    let stock = parseInt($("#availableQty").val());
    let code = $("#selectItemCode").val();

    let isValid = true;
    let sameItemUpdate = false;

    if (stock === 0) {
      $("#orderQtyError").text("Item is Out of Stock...");
      isValid = false;
    } else if (stock - orderQty < 0) {
      $("#orderQtyError").text("Quantity exceeds available stock....");
      isValid = false;
    }

    if (cart.length !== 0) {
      let index = cart.findIndex((c) => c.itemCode === code);

      if (index !== -1) {
        const cartQty = parseInt(cart[index].qty);

        if (!(stock - cartQty >= orderQty)) {
          $("#orderQtyError").text(
            "You cannot add more of this item, the maximum available quantity exceeds..."
          );
          isValid = false;
        } else {
          let rowIndex = tableData.findIndex((t) => t.itemCode === code);

          cart[index].qty = cartQty + orderQty;
          tableData[rowIndex].qtyBuy = cartQty + orderQty;

          totalBill += cart[index].unitPrice * orderQty;
          updateBill();

          loadCartTable();

          sameItemUpdate = true;
          isValid = false;
        }
      }
    }

    if (!isValid && !sameItemUpdate) {
      fieldBoderChange($("#orderQuantity"));
    }

    return isValid;
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

  let subTotal = 0;

  $("#cashAmount").on("keyup", function (event) {
    let cash = parseFloat($("#cashAmount").val());
    subTotal = totalBill;
    if (!cash) {
      $("#balance").val("");
    } else {
      $("#balance").val((cash - subTotal).toFixed(2));
    }
  });

  $("#discount").on("keyup", function (event) {
    discount = $("#discount").val();

    subTotal = totalBill;

    if (discount >= 0 && discount <= 100) {
      subTotal = totalBill - (totalBill * discount) / 100;

      let cash = $("#cashAmount").val();
      if (!cash) {
        $("#balance").val("");
      } else {
        $("#balance").val((cash - subTotal).toFixed(2));
      }
    } else {
      discount = 0;
    }

    $("#subTotal").text(subTotal.toFixed(2));
  });

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
        $("#inventory")[0].reset();
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

  function checkNoData() {
    if (cart.length === 0) {
      const $tbody = $("#cartTable tbody");

      if ($tbody.children("tr").length === 0) {
        const $row = $("<tr></tr>");
        const $cell = $("<td></td>")
          .attr("colspan", 5)
          .text("No data available");

        $cell.css({
          "text-align": "center",
          "font-style": "italic",
          padding: "10px",
        });

        $row.append($cell);
        $tbody.append($row);
      }
    }
  }

  const alertPlaceholder = $("#liveAlertPlaceholder");

  const appendAlert = (message, type) => {
    const wrapper = $(`
    <div class="alert alert-${type} alert-dismissible" role="alert">
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
      wrapper.alert("close");
    }, 2500);
  };

  function createAlertModel(title, message) {
    const modal = $("#alertModel");
    modal.find(".modal-title").text(title);
    modal.find(".modal-body").html(message);
    $("#alertModel").removeAttr("inert");
    return modal;
  }

  $("#alertModel .btn-close").on("click", function () {
    $("#alertModel").modal("hide");
  });

  $("#alertModel").on("shown.bs.modal", function () {
    $(this).removeAttr("inert");
  });

  $("#alertModel").on("hide.bs.modal", function () {
    $(this).attr("inert", "");
  });
});

class ItemTable {
  constructor(itemCode, itemName, unitPrice, qtyBuy) {
    this.itemCode = itemCode;
    this.itemName = itemName;
    this.unitPrice = unitPrice;
    this.qtyBuy = qtyBuy;
  }
}
