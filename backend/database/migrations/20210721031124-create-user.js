"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING(50),
      },
      lastName: {
        type: Sequelize.STRING(50),
      },
      otherNames: {
        type: Sequelize.STRING(255),
      },
      address: {
        type: Sequelize.STRING(255),
      },
      state: {
        type: Sequelize.STRING(255),
      },
      city: {
        type: Sequelize.STRING(255),
      },
      country: {
        type: Sequelize.STRING(255),
      },
      phoneNumber: {
        type: Sequelize.STRING(50),
      },
      profilePicture: {
        type: Sequelize.STRING(500),
      },
      password: {
        type: Sequelize.STRING(500),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
