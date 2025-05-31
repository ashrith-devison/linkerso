import dotenv from "dotenv";

dotenv.config();

import app from "./app.js"; 
// import deploymentService from './microservices/deployment.service.js';

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
    res.send("Welcome to the Deployment Service API");
});

// app.use("/prod",deploymentService);

export default app;
