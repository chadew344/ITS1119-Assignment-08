import Customer from "../model/Customer.js";
import { db } from "../db/DB.js";

$(document).ready(function () {
  console.log("Document is ready");

  $("#navTitle").text("Customer Manage");

  $("#registration").submit(function (e) {
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
      $("#registration")[0].reset();

      //   for (let color of db.customers) {
      //     console.log(color);
      //   }
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
});
