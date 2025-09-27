'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'unreadCount', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addIndex('conversations', ['unreadCount']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'unreadCount');
  }
};
