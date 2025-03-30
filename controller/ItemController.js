import Item from "../model/Item.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("saveItem").on("click", function (e) {});

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
});
