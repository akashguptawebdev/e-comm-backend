import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// import { createServices, deleteServices, editServices, getServices, getServicesById } from '../controller/servicesController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import Adminonly from '../middleware/AdminOnly.js';
import { upload } from '../utils/setupMulter.js';

const mediaContentRoute = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image file preview Route
mediaContentRoute.get('/preview/:filename', (req , res) => {
  res.sendFile(join(__dirname, '../utils/upload', req.params.filename));
});

// Route for Services
// mediaContentRoute.post("/services",isAuthenticated , Adminonly , upload.single('file'), createServices);
// mediaContentRoute.get("/services", getServices);
// mediaContentRoute.get("/services/:id", getServicesById);
// mediaContentRoute.patch("/services/:id",isAuthenticated , Adminonly , upload.single('file') , editServices);
// mediaContentRoute.delete("/services/:id",isAuthenticated , Adminonly , deleteServices);


export default mediaContentRoute;
