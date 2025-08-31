import { Dialect, Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: process.env.DB_DIALECT as Dialect,
    port: Number(process.env.DB_PORT!),
    logging: false
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database connected successfully");
  } catch (err) {
    throw new Error(`Unable to connect to the database: ${err}`);
  }
};
