import Customer from "../model/Customer.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("#customerLink").on("click", function () {
    $("#customerId").val(generateNewCustId());
    console.log("cust-page loads");
  });

  $("#customerRegistration").submit(function (e) {
    e.preventDefault();
    if (isValidated()) {
      let customer = new Customer(
        $("#customerId").val(),
        $("#customerName").val(),
        $("#customerAddress").val(),
        $("#customerSalary").val()
      );

      db.customers.push(customer);
      addToTable(customer);
      $("#customerRegistration")[0].reset();

      $("#customerId").val(generateNewCustId());

      for (let customer of db.customers) {
        console.log(customer.id);
      }
    }
  });

  function addToTable(customer) {
    let newRow = `<tr><td>${customer.id}</td><td>${customer.name}</td><td>${customer.address}</td><td>${customer.salary}</td></tr>`;
    $("#customerTable tbody").append(newRow);

    console.log(db.customers);
  }

  function isValidated() {
    return true;
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
});
