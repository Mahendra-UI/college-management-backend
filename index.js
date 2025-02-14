require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const courseRoutes = require('./routes/course.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const resultsRoutes = require('./routes/results.routes');
const notificationsRoutes = require('./routes/notifications.routes');



const app = express();
const port = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Management API',
      version: '1.0.0',
      description: 'API for managing student records with PostgreSQL',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/college-management', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ Load Routes
app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', courseRoutes);
app.use('/api', subjectsRoutes);
app.use('/api', resultsRoutes);
app.use('/api', notificationsRoutes);

// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📄 Swagger Docs available at http://localhost:${port}/college-management`);
});
