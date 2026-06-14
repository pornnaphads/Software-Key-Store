type RevenueOrder = {
  total: number;
  createdAt: Date;
};

export function calculateMonthlyRevenue(
  orders: RevenueOrder[],
  currentDate = new Date(),
) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return orders.reduce((sum, order) => {
    const orderDate = new Date(order.createdAt);
    const isCurrentMonth =
      orderDate.getFullYear() === currentYear &&
      orderDate.getMonth() === currentMonth;

    return isCurrentMonth ? sum + order.total : sum;
  }, 0);
}
