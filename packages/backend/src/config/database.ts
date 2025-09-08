import { Dialect, Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: process.env.DB_DIALECT as Dialect,
    port: Number(process.env.DB_PORT!),
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    console.log("Database connected successfully");
  } catch (err) {
    throw new Error(`Unable to connect to the database: ${err}`);
  }
};
