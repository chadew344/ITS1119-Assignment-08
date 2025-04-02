import Item from "../model/Item.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("saveItem").on("click", function (e) {});

  $("#itemLink").on("click", function () {
    $("#itemCode").val(generateNextItemCode());
    checkNoData();
    console.log("item-page loads");
  });

  let isSaving = true;
  let modal;

  $("#itemSave").on("click", function (e) {
    e.preventDefault();
    if (isValidated()) {
      if (isSaving) {
        saveItem();
      } else {
        modal = createAlertModel(
          "Confirm Save Changes",
          "Are you sure changes cannot be undone?"
        );

        modal
          .find(".btn-primary")
          .text("Update")
          .off("click")
          .on("click", function () {
            updateItem();
            modal.modal("hide");
            appendAlert("Item Updated!", "success");
          });

        modal.find(".btn-secondary").text("Cancel");
        modal.modal("show");
      }
    }
  });

  function saveItem() {
    let item = new Item(
      $("#itemCode").val(),
      $("#itemName").val(),
      $("#itemQty").val(),
      $("#itemPrice").val()
    );

    db.items.push(item);
    refresh();
    appendAlert("New Item Added!", "success");
  }

  function updateItem() {
    if (selectIndex !== -1) {
      db.items[selectIndex].name = $("#itemName").val();
      db.items[selectIndex].qty = $("#itemQty").val();
      db.items[selectIndex].price = $("#itemPrice").val();

      $("#inventory")[0].reset();
      refresh();
    }
  }

  function loadItemTable() {
    $("#itemTable tbody").empty();

    if ($("#itemTable tbody").length === 0) {
      $("#itemTable").append("<tbody></tbody>");
    }

    db.items.forEach((item) => {
      let newRow = `<tr><td>${item.code}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td class="action-cell"></td></tr>`;
      const $row = $(newRow);
      $row
        .find(".action-cell")
        .append(createDeleteButton(), createUpdateButton());
      $("#itemTable tbody").append($row);
    });
  }

  function isValidated() {
    let name = $("#itemName").val();
    let qty = $("#itemQty").val();
    let unitPrice = $("#itemPrice").val();

    let isValid = true;

    if (!name) {
      $("#itemNameError").text("Item Name is required");
      fieldBoderChange($("#itemName"));
      isValid = false;
    } else {
      $("#itemNameError").text("");
    }

    if (!qty) {
      $("#itemQtyError").text("Item Quantity is required");
      fieldBoderChange($("#itemQty"));
      isValid = false;
    } else if (qty < 0) {
      $("#itemQtyError").text("Invalid value for the Item Quantity...");
      fieldBoderChange($("#itemQty"));
      isValid = false;
    } else {
      $("#itemQtyError").text("");
    }

    if (!unitPrice) {
      $("#itemPriceError").text("Unit price is required");
      fieldBoderChange($("#itemPrice"));
      isValid = false;
    } else if (unitPrice < 0) {
      $("#itemPriceError").text("Invalid value for the Unit price...");
      fieldBoderChange($("#itemPrice"));
      isValid = false;
    } else {
      $("#itemPriceError").text("");
    }

    return isValid;
  }

  function fieldBoderChange(field) {
    $(field).addClass("border-danger");

    setTimeout(function () {
      $(field).removeClass("border-danger");
    }, 2000);
  }

  $("#clearItemForm").on("click", function () {
    refresh();
  });

  let selectIndex = -1;

  $("#itemTable tbody").on("click", ".updateBtn", function () {
    isSaving = false;

    console.log("update btn press");

    const $row = $(this).closest("tr");
    let selectRow = $($row).find("td").eq(0).text();

    selectIndex = db.items.findIndex((i) => i.code === selectRow);
    const selectedItem = db.items.find((i) => i.code === selectRow);

    console.log("Selected Index: " + selectIndex);

    if (selectedItem) {
      $("#itemCode").val(selectedItem.code),
        $("#itemName").val(selectedItem.name),
        $("#itemQty").val(selectedItem.qty),
        $("#itemPrice").val(selectedItem.price);
    }
  });

  $("#itemTable tbody").on("click", ".deleteBtn", function () {
    console.log("delete btn press");
    const $row = $(this).closest("tr");
    let selectRow = $($row).find("td").eq(0).text();

    modal = createAlertModel(
      "Confirm Deletion",
      "Are you sure you want to delete this Item?"
    );

    modal
      .find(".btn-primary")
      .text("Delete")
      .off("click")
      .on("click", function () {
        selectIndex = db.items.findIndex((i) => i.code === selectRow);

        if (selectIndex !== -1) {
          db.items.splice(selectIndex, 1);
          $("#inventory")[0].reset();
          refresh();
          modal.modal("hide");
          appendAlert("Item Deleted!", "success");
        }
      });

    modal.find(".btn-secondary").text("Cancel");
    modal.modal("show");
  });

  function refresh() {
    selectIndex = -1;
    isSaving = true;

    loadItemTable();

    checkNoData();

    $("#itemEntry")[0].reset();
    $("#itemCode").val(generateNextItemCode());

    $("#itemNameError").text("");
    $("#itemQtyError").text("");
    $("#itemPriceError").text("");
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

  function createDeleteButton() {
    return $("<button>")
      .addClass("btn btn-dangerbtn btn-outline-danger me-1 px-1 py-0 deleteBtn")
      .append($("<i>").addClass("fa-solid fa-trash"));
  }

  function createUpdateButton() {
    return $("<button>")
      .addClass("btn btn-dangerbtn btn-outline-success px-1 py-0 updateBtn")
      .append($("<i>").addClass("fa-solid fa-pen"));
  }

  function checkNoData() {
    if (db.items.length === 0) {
      const $tbody = $("#itemTable tbody");

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
    } else {
      loadItemTable();
    }
  }

  function createAlertModel(title, message) {
    const modal = $("#alertModel");
    modal.find(".modal-title").text(title);
    modal.find(".modal-body").html(message);
    $("#alertModel").removeAttr("inert");
    return modal;
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
    }, 2000);
  };

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
