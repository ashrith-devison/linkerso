import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "static"));

app.use(express.static(path.join(__dirname ,"public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get("/test", (req, res) => {
//   const username = "Likith Chatterjee";

//   const logHistory = [
//     {
//       deployedUser: "AdminUser1",
//       date: "2025-05-10 10:00",
//       version: "1.0.0",
//       commitId: "a1b2c3d",
//       comments: "Initial production deployment",
//     },
//     {
//       deployedUser: "DevOpsGuy",
//       date: "2025-05-12 14:30",
//       version: "1.0.1",
//       commitId: "d4e5f6g",
//       comments: "Fixed authentication bug",
//     },
//     {
//       deployedUser: "AdminUser1",
//       date: "2025-05-14 09:15",
//       version: "1.0.2",
//       commitId: "h7i8j9k",
//       comments: "Deployed performance improvements",
//     },
//   ];

//   // Latest deployment info
//   const lastDeployed = logHistory[logHistory.length - 1];
//   res.render("production", { username, logHistory, lastDeployed });
// });

// import vercelControllers from "./controllers/production.tickets.controller.js";
// app.get("/history", async (req, res) => {
//   const deployments = await vercelControllers.deploymentFromVercel(process.env.VERCEL_PROJECT_ID);
//   res.render('history', { data: deployments, user : {
//     username: "Likith Chatterjee"
//   } });
// });

export default app;