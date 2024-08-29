const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const url = process.env.MONGODB_URI;

const userRoutes = require('./Routes/userRoute'); 

mongoose.connect(url)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);

app.use(globalErrorHandler); 

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
