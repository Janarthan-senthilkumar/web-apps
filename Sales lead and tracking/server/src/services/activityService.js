const Activity = require("../models/Activity");

const createActivity = async ({ action, entityType, entityId, actor, metadata = {} }) => {
  return Activity.create({
    action,
    entityType,
    entityId,
    actor,
    metadata
  });
};

module.exports = { createActivity };
