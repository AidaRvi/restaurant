console.time("duration");
import redis from "redis";
import fs from "fs";
import { customers, menu, chefsBySkill, readyChefsBySkill } from "./input.js";
import {
  findReadyChefs,
  findAvailableChefToCook,
  assignOrderToChef,
} from "./chef.js";
import pkg from "lodash";
const { groupBy } = pkg;

export const redisClient = redis.createClient({
  url: "redis://localhost:6370",
});

const output = { customers: [], chefs: [] };

const orderProcess = async (orders) => {
  const ordersData = [];
  let spent_amount = 0;
  for (let i = 0; i < orders.length; i++) {
    const order = menu.find((menuItem) => menuItem.id == orders[i]);

    // TODO: skip order, if the related chef is not available.

    if (!chefsBySkill[order.id].length) {
      console.log(`Can not cook ${order.id} anymore!`);
      continue;
    }

    while (!readyChefsBySkill[order.id].length) await findReadyChefs(order.id);

    let chefIdToBeAssigned;
    while (!chefIdToBeAssigned && readyChefsBySkill[order.id].length)
      chefIdToBeAssigned = findAvailableChefToCook(readyChefsBySkill[order.id]);

    if (!chefIdToBeAssigned) {
      console.log(`Can not cook ${order.id} anymore!`);
      continue;
    }

    await assignOrderToChef(chefIdToBeAssigned, order.cook_duration);
    spent_amount += order.price;

    const now = new Date();
    ordersData.push({
      chefId: chefIdToBeAssigned,
      food_id: order.id,
      custumer_id: "",
      start: now,
      end: new Date(
        new Date().setSeconds(now.getSeconds() + order.cook_duration)
      ),
    });
  }
  return { spent_amount, ordersData };
};

const customerProcess = async (customer) => {
  const { spent_amount, ordersData } = await orderProcess(customer.orders);

  ordersData.forEach((orderData, index) => {
    ordersData[index].custumer_id = customer.id;
  });

  const greatestEnd = ordersData.reduce((greatestEnd, currentOrder) => {
    if (currentOrder.end.getTime() > greatestEnd)
      return currentOrder.end.getTime();
    return greatestEnd;
  }, 0);

  const customerData = {
    id: customer.id,
    spent_amount,
    arrival_time: customer.arrival_time,
    leaving_time: new Date(greatestEnd),
  };

  return { customerData, ordersData };
};

(async () => {
  console.log("*** Start");
  await redisClient.connect();

  for (let i = 0; i < customers.length; ) {
    if (customers[i].arrival_time.getTime() > new Date().getTime()) continue;

    console.log("New customer arrived at " + new Date());
    const { customerData, ordersData } = await customerProcess(customers[i]);
    output.customers.push(customerData);
    output.chefs.push(...ordersData);
    console.log("Customer left!");

    i++;
  }

  generateReport(output);

  console.log("*** End");
  await redisClient.quit();
  console.timeEnd("duration");
})();

const generateReport = (output) => {
  const groupedByChefData = groupBy(output.chefs, "chefId");

  const chefReport = Object.entries(groupedByChefData).map((chefData) => {
    const cookDetails = chefData[1].map((chefcooks) => ({
      food_id: chefcooks.food_id,
      custumer_id: chefcooks.custumer_id,
      start: chefcooks.start,
      end: chefcooks.end,
    }));
    return { id: chefData[0], cookDetails };
  });

  output.chefs = chefReport;

  fs.writeFileSync("./output.json", JSON.stringify(output));

  console.log("# Report generated");
};
