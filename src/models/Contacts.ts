import { DataTypes, Model } from "sequelize";
import sequelize from "../utils/Sequelize";
interface ContactsAttributes{
  id?:number;                   
  phoneNumber:string;
  email: string;
  linkedId ?:number;
  linkPrecedence:string; 
}

class Contacts extends Model<ContactsAttributes> implements ContactsAttributes{
    public id!: number;
    public phoneNumber!: string;
    public email!: string;
    public linkedId!: number;
    public linkPrecedence!: string;
}
Contacts.init({
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
        unique:true
    },
    phoneNumber:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    linkedId:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    linkPrecedence:{
        type:DataTypes.STRING,
        allowNull:false
    }
},
{
    sequelize,
    modelName:'contacts',
    timestamps:true,
    createdAt:true,
    updatedAt:true,
    deletedAt:true
}
);
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized successfully');
    })
    .catch((error) => {
        console.error('Error synchronizing database:', error);
    });
export default Contacts;