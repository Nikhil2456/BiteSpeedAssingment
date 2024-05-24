import * as express from 'express';
import contactRoutes from './controllers/ContactsController';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/contacts',contactRoutes);

app.listen(PORT,()=>{
    console.log('Server is running on PORT ',PORT);
});