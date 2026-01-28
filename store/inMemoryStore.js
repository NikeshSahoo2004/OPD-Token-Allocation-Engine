const store = {
    doctors: {},
    tokens: {},

    priorityMap: {
        EMERGENCY: 1,
        PAID: 2,
        FOLLOW_UP: 3,
        ONLINE: 4,
        WALK_IN: 5
    }
};

module.exports = store;
