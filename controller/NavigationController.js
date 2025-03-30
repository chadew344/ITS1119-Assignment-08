$(document).ready(function () {
  $("#home-section").show();
  $("#customer-section").hide();
  $("#item-section").hide();
  $("#order-section").hide();

  $("#homeLink").click(function (e) {
    e.preventDefault();
    $("#navTitle").text("Dashboard");
    $("#home-section").show();
    $("#customer-section").hide();
    $("#item-section").hide();
    $("#order-section").hide();

    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $("#customerLink").click(function (e) {
    e.preventDefault();
    $("#navTitle").text("Customer Manage");
    $("#customer-section").show();
    $("#home-section").hide();
    $("#item-section").hide();
    $("#order-section").hide();

    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $("#itemLink").click(function (e) {
    e.preventDefault();
    $("#navTitle").text("Item Manage");
    $("#item-section").show();
    $("#home-section").hide();
    $("#customer-section").hide();
    $("#order-section").hide();

    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $("#orderLink").click(function (e) {
    e.preventDefault();
    $("#navTitle").text("Order Manage");
    $("#order-section").show();
    $("#home-section").hide();
    $("#customer-section").hide();
    $("#item-section").hide();

    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });
});
