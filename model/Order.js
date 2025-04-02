class Order {
  constructor(orderId, date, custId, totalBill, discount) {
    this.orderId = orderId;
    this.date = date;
    this.custId = custId;
    this.totalBill = totalBill;
    this.discount = discount;
  }
}

export default Order;
