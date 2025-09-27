'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'lastMessageAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.addColumn('conversations', 'userOneUnreadCount', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('conversations', 'userTwoUnreadCount', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });

    // Add indexes for better performance
    await queryInterface.addIndex('conversations', ['lastMessageAt']);
    await queryInterface.addIndex('conversations', ['userOneUnreadCount']);
    await queryInterface.addIndex('conversations', ['userTwoUnreadCount']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'lastMessageAt');
    await queryInterface.removeColumn('conversations', 'userOneUnreadCount');
    await queryInterface.removeColumn('conversations', 'userTwoUnreadCount');
  }
};
