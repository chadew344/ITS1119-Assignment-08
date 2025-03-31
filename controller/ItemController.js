import Item from "../model/Item.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("saveItem").on("click", function (e) {});

  $("#itemLink").on("click", function () {
    $("#itemCode").val(generateNextItemCode());
    console.log("item-page loads");
  });

  $("#itemEntry").submit(function (e) {
    e.preventDefault();
    if (isValidated()) {
      let item = new Item(
        $("#itemCode").val(),
        $("#itemName").val(),
        $("#itemQty").val(),
        $("#itemPrice").val()
      );

      db.items.push(item);
      addToTable(item);
      $("#itemEntry")[0].reset();

      $("#itemCode").val(generateNextItemCode());
    }
  });

  function addToTable(item) {
    let newRow = `<tr><td>${item.code}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td></tr>`;
    $("#itemTable tbody").append(newRow);

    console.log(db.customers);
  }

  function isValidated() {
    return true;
  }

  function generateNextItemCode() {
    if (db.items.length > 0) {
      let lastItemCode = db.items[db.items.length - 1].code;

      const numberPart = lastItemCode.split("-")[1];

      const nextNumber = parseInt(numberPart, 10) + 1;

      const nextId = `I00-${nextNumber.toString().padStart(3, "0")}`;

      return nextId;
    } else {
      return "I00-001";
    }
  }
});
