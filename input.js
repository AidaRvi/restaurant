const now = new Date();

const customerTimes = {
  fiveSecondsLater: new Date().setSeconds(now.getSeconds() + 5),
  tenSecondsLater: new Date().setSeconds(now.getSeconds() + 10),
  fiftheenSecondsLater: new Date().setSeconds(now.getSeconds() + 15),
};

const chefTimes = {
  chef0: {
    startTime: now,
    endTime: new Date(new Date().setSeconds(now.getSeconds() + 25)),
  },
  chef1: {
    startTime: now,
    endTime: new Date(new Date().setSeconds(now.getSeconds() + 30)),
  },
  chef2: {
    startTime: new Date(new Date().setSeconds(now.getSeconds() + 10)),
    endTime: new Date(new Date().setSeconds(now.getSeconds() + 35)),
  },
};

export const chefsList = [
  {
    id: "chef0",
    foodSkills: ["order0"],
    workTime: { ...chefTimes.chef0 },
  },
  {
    id: "chef1",
    foodSkills: ["order1"],
    workTime: { ...chefTimes.chef1 },
  },
  {
    id: "chef2",
    foodSkills: ["order1", "order2"],
    workTime: { ...chefTimes.chef2 },
  },
];

console.log(chefsList);

export const menu = [
  {
    id: "order0",
    price: 1,
    cook_duration: 15,
  },
  {
    id: "order1",
    price: 2,
    cook_duration: 20,
  },
  {
    id: "order2",
    price: 3,
    cook_duration: 25,
  },
];

export const chefsBySkill = Object.assign(
  {},
  ...menu.map((menuItem) => {
    const chefs = chefsList.filter((chef) =>
      chef.foodSkills.includes(menuItem.id)
    );

    return { [`${menuItem.id}`]: chefs.map((chef) => chef.id) };
  })
);

export const customers = [
  {
    id: 0,
    arrival_time: new Date(customerTimes.fiveSecondsLater),
    orders: ["order0", "order0"],
  },
  {
    id: 1,
    arrival_time: new Date(customerTimes.tenSecondsLater),
    orders: ["order1", "order0"],
  },
  {
    id: 2,
    arrival_time: new Date(customerTimes.fiftheenSecondsLater),
    orders: ["order2", "order1"],
  },
  {
    id: 3,
    arrival_time: new Date(customerTimes.fiftheenSecondsLater),
    orders: ["order0", "order2", "order1"],
  },
];

/**
{
  order0: [chef0] 
  order1: [chef1,chef2] 
  order2: [chef2] 
}

 cus1 hamoon aval ke mirese CHEF0 baraie ORDER0 be modate 15s, Va CHEF1 ro baraie ORDER1 be modate 20s => 20s
 cus2 CHEF2 ro baraie ORDER1 be modate 20s barmidare. Bad 10s sabr mikone, CHEF0 khali beshe o baraie ORDER0 barmidare be modate 15s => 25s

 customer1 hamoon aval order1 o az CHEF1 va order0 CHEF0 migire ==> 20s
 customer2 faghat bayad 20s sabr kone order1 o az CHEF2 begire ==> 20s
 customer3 bayad 10s wait kone ke order1 ro CHEF1 begire bad 20s sabr kone. order2 ro az CHEF2 ro 15s sabr mikone o 25s bad migire ==> 40s
 */

export const readyChefsBySkill = structuredClone(chefsBySkill);
