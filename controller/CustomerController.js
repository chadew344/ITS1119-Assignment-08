import Customer from "../model/Customer.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("#customerLink").on("click", function () {
    $("#customerId").val(generateNewCustId());
    checkNoData();
    console.log("cust-page loads");
  });

  let isSaving = true;
  let modal;

  $("#customerSave").on("click", function (e) {
    e.preventDefault();
    if (isValidated()) {
      if (isSaving) {
        saveCusotmer();
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
            updateCustomer();
            modal.modal("hide");
            appendAlert("Customer Updated!", "success");
          });

        modal.find(".btn-secondary").text("Cancel");
        modal.modal("show");
      }
    }
  });

  function saveCusotmer() {
    let customer = new Customer(
      $("#customerId").val(),
      $("#customerName").val(),
      $("#customerAddress").val(),
      $("#customerSalary").val()
    );

    db.customers.push(customer);
    refresh();
    appendAlert("New Customer Added!", "success");
  }

  function updateCustomer() {
    if (selectIndex !== -1) {
      db.customers[selectIndex].name = $("#customerName").val();
      db.customers[selectIndex].address = $("#customerAddress").val();
      db.customers[selectIndex].salary = $("#customerSalary").val();

      $("#invoice")[0].reset();
      refresh();
    }
  }

  let selectIndex = -1;

  $("#customerTable tbody").on("click", ".updateBtn", function () {
    isSaving = false;

    console.log("update btn press");

    const $row = $(this).closest("tr");
    let selectRow = $($row).find("td").eq(0).text();

    selectIndex = db.customers.findIndex((c) => c.id === selectRow);
    const selectedCustomer = db.customers.find((c) => c.id === selectRow);

    console.log("Selected Index: " + selectIndex);

    if (selectedCustomer) {
      $("#customerId").val(selectedCustomer.id),
        $("#customerName").val(selectedCustomer.name),
        $("#customerAddress").val(selectedCustomer.address),
        $("#customerSalary").val(selectedCustomer.salary);
    }
  });

  function loadCustomerTable() {
    $("#customerTable tbody").empty();

    if ($("#customerTable tbody").length === 0) {
      $("#customerTable").append("<tbody></tbody>");
    }

    db.customers.forEach((customer) => {
      let newRow = `<tr><td>${customer.id}</td><td>${customer.name}</td><td>${customer.address}</td><td>${customer.salary}</td><td class="action-cell"></td></tr>`;
      const $row = $(newRow);
      $row
        .find(".action-cell")
        .append(createDeleteButton(), createUpdateButton());
      $("#customerTable tbody").append($row);
    });
  }

  function isValidated() {
    let name = $("#customerName").val();
    let address = $("#customerAddress").val();
    let salary = $("#customerSalary").val();

    let isValid = true;

    if (!name) {
      $("#custNameError").text("Customer Name is required");
      fieldBoderChange($("#customerName"));
      isValid = false;
    } else {
      $("#custNameError").text("");
    }

    if (!address) {
      $("#custAddressError").text("Customer address is required");
      fieldBoderChange($("#customerAddress"));
      isValid = false;
    } else {
      $("#custAddressError").text("");
    }

    if (!salary) {
      $("#custSalaryError").text("Customer salary is required");
      fieldBoderChange($("#customerSalary"));
      isValid = false;
    } else if (salary < 0) {
      $("#custSalaryError").text("Invalid value for the Customer salary...");
      fieldBoderChange($("#customerSalary"));
      isValid = false;
    } else {
      $("#custSalaryError").text("");
    }

    return isValid;
  }

  function fieldBoderChange(field) {
    $(field).addClass("border-danger");

    setTimeout(function () {
      $(field).removeClass("border-danger");
    }, 2000);
  }

  $("#clearCustomerForm").on("click", function () {
    refresh();
  });

  $("#customerTable tbody").on("click", ".deleteBtn", function () {
    console.log("delete btn press");
    const $row = $(this).closest("tr");
    let selectRow = $($row).find("td").eq(0).text();

    modal = createAlertModel(
      "Confirm Deletion",
      "Are you sure you want to delete this customer?"
    );

    modal
      .find(".btn-primary")
      .text("Delete")
      .off("click")
      .on("click", function () {
        selectIndex = db.customers.findIndex((c) => c.id === selectRow);

        if (selectIndex !== -1) {
          db.customers.splice(selectIndex, 1);
          $("#invoice")[0].reset();
          refresh();
          modal.modal("hide");
          appendAlert("Customer Deleted!", "success");
        }
      });

    modal.find(".btn-secondary").text("Cancel");
    modal.modal("show");
  });

  function refresh() {
    selectIndex = -1;
    isSaving = true;

    loadCustomerTable();

    checkNoData();

    $("#customerRegistration")[0].reset();
    $("#customerId").val(generateNewCustId());

    $("#custNameError").text("");
    $("#custAddressError").text("");
    $("#custSalaryError").text("");
  }

  function generateNewCustId() {
    if (db.customers.length > 0) {
      let lastCustId = db.customers[db.customers.length - 1].id;

      const numberPart = lastCustId.split("-")[1];

      const nextNumber = parseInt(numberPart, 10) + 1;

      const nextId = `C00-${nextNumber.toString().padStart(3, "0")}`;

      return nextId;
    } else {
      return "C00-001";
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
    if (db.customers.length === 0) {
      const $tbody = $("#customerTable tbody");

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
