const express = require("express");
const cookieParser = require("cookie-parser");
const fileUplaod = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");

const ratelimit = require("./middleware/rateLimit.middleware");
const notFound = require("./middleware/notFound.middleware");
const sendCustomResponse = require("./middleware/customResponse.middleware");
const connectDB = require("./config/connectDb");
require("dotenv").config();
const {
    globalErrorHandler,
} = require("./middleware/globalErrorHandler.middleware");
const connectCloudinary = require("./config/cloudinary");
const imageUploader = require("./utils/imageUpload.utils");
const router = require("./routes/index.routes");
// Connect Database
connectDB(); // connect Database
connectCloudinary(); // connect cloudinary
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
// Limit repeated requests (rate limiting)
// app.use(ratelimit);
// Secure HTTP headers to protect your app
app.use(helmet());
// Sanitize input to prevent NoSQL injection attacks

// Handle file uploads, with temporary storage for large files
app.use(
    fileUplaod({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
); //
app.use(sendCustomResponse);
// Routes For Login,Register,Send-Otp,Forgott-Password, Reset Password
app.use("/api/v1", router);

app.get("/", (req, res) => {
    return res.success("Welcome! Test route is working");
});

app.use(notFound);
app.use(globalErrorHandler);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
