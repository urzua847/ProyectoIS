import express from 'express' 
import morgan  from 'morgan'

const app = express();
//const mongoose = require ('mongoose');
app.use(morgan('dev'));



const port = process.env.PORT || 3000; 

export default app;
