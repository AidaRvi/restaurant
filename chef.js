import { chefsList, chefsBySkill, readyChefsBySkill } from "./input.js";
import { redisClient } from "./index.js";

export const removeChefFromReadyQueue = (chefId) => {
  Object.values(readyChefsBySkill).forEach((chefIds, index) => {
    if (chefIds.includes(chefId)) {
      Object.entries(readyChefsBySkill)[index][1].length = 0;
      Object.entries(readyChefsBySkill)[index][1] = chefIds.filter(
        (chefIdInArray) => chefIdInArray != chefId
      );
    }
  });
};

export const removeChefFromChefsList = (chefId) => {
  Object.values(chefsBySkill).forEach((chefIds, index) => {
    if (chefIds.includes(chefId)) {
      Object.entries(chefsBySkill)[index][1].length = 0;
      Object.entries(chefsBySkill)[index][1] = chefIds.filter(
        (chefIdInArray) => chefIdInArray != chefId
      );
    }
  });
};

export const findAvailableChefToCook = (readyChefs) => {
  let selectedChefId;
  for (const chefId of readyChefs) {
    const chef = chefsList.find((chef) => chef.id == chefId);
    const now = new Date();

    const isChefAvailable =
      chef.workTime.startTime.getTime() <= now.getTime() &&
      chef.workTime.endTime.getTime() > now.getTime();
    if (isChefAvailable) {
      selectedChefId = chefId;
      break;
    } else if (chef.workTime.endTime.getTime() < now.getTime()) {
      console.log(`chef ${chefId} is out!`);
      removeChefFromReadyQueue(chefId);
      removeChefFromChefsList(chefId);
    } else if (chef.workTime.startTime.getTime() > now.getTime()) {
      console.log(`chef ${chefId} has not started yet!`);
    }
  }

  return selectedChefId;
};

export const assignOrderToChef = async (chefId, cook_duration) => {
  removeChefFromReadyQueue(chefIdToBeAssigned);

  await redisClient.set(`chefId:${chefId}`, `${cook_duration}`, {
    EX: cook_duration,
  });
};

export const findReadyChefs = async (orderKey) => {
  for (const chefId of chefsBySkill[orderKey]) {
    try {
      const isBusy = await redisClient.exists(`chefId:${chefId}`);
      if (!isBusy) {
        Object.values(chefsBySkill).forEach((chefIds, index) => {
          if (chefIds.includes(chefId))
            Object.entries(readyChefsBySkill)[index][1].push(chefId);
        });
        break;
      }
    } catch (er) {
      console.log(er);
    }
  }
};
