import * as express from 'express';
import { Request , Response} from 'express';
import Contact from '../models/Contacts';
import { Op, Sequelize, where } from 'sequelize';
import sequelize from '../utils/Sequelize';
const router = express.Router();
type ApiResponse = {
    [x: string]: any;
    contact: {
        primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
};

router.post('/identify',async(req:Request,res:Response)=>{
    
    let { email, phoneNumber } = req.body;
    let e = String(email);
    let p = String(phoneNumber);
    let contactsCount;
    if(e!='null' && p!='null'){
        contactsCount = await Contact.count({
            where:{
                [Op.and]:[{email:e},{phoneNumber:p}]
            }
        });
    }
    else{
        contactsCount = await Contact.count({
            where:{
                [Op.or]:[{email:e},{phoneNumber:p}]
            }
        });
    }
    let contactsPrimary= await Contact.findOne({
        where:{
            [Op.or]:[{email:e},{phoneNumber:p}],
            [Op.and]:[{linkPrecedence:'primary'}]
        },
        order:sequelize.col('createdAt')
    });

    let primaryContactCount = await Contact.count({
        where:{
            [Op.or]:[{email:e},{phoneNumber:p}],
            [Op.and]:[{linkPrecedence:'primary'}]
        },
    });
    if(primaryContactCount>1){
        let allPrimaryContacts= await Contact.findAll({
            where:{
                [Op.or]:[{email:e},{phoneNumber:p}],
                [Op.and]:[{linkPrecedence:'primary'}]
            },
            order:sequelize.col('createdAt')
        });
        let hasEmail = false;
        let hasNumber = false;
        allPrimaryContacts.forEach(contact=>{
            if(contact.email===e){
                hasEmail= true;
            }
            else if(contact.phoneNumber===p){
                hasNumber = true;
            }
        });
        
        updatePrimaryContacts(allPrimaryContacts);
        if(hasEmail && hasNumber){
            res.status(200).json(await getAllContact(allPrimaryContacts));
            return;  
        }
    }
    if(contactsCount>0 && contactsPrimary){
        let retriveContacts = await Contact.findAll({
            where:{
                [Op.or]:[{email:e},{phoneNumber:p}]
            },
            order:Sequelize.col('createdAt')
        });
        
        res.status(200).json(await getAllContact(retriveContacts));
        return;
    }
    else if(contactsCount==0 && contactsPrimary){
        let retriveContacts = await Contact.findAll({
            where:{
                [Op.or]:[{email:e},{phoneNumber:p}]
            },
            order:Sequelize.col('createdAt')
        });
        let hasEmail = false;
        let hasNumber = false;
        retriveContacts.forEach(contact=>{
            if(contact.email===e){
                hasEmail= true;
            }
            else if(contact.phoneNumber===p){
                hasNumber = true;
            }
        });
        if(hasEmail && hasNumber){
            res.status(200).json(await getAllContact(retriveContacts));
            return;  
        }
        else{
            let newContact = await order(e,p,contactsPrimary.id,false);
            retriveContacts.push(newContact);
            res.status(200).json(await getAllContact(retriveContacts));
            return;
        }
        
    } 
    else if(contactsCount==0 && !contactsPrimary){
        let newContact = await order(e,p,0,true);
        res.status(200).json(await getAllContact([newContact]));
        return;
    }
    else if(contactsCount>0 &&!contactsPrimary){
        let retriveContacts = await Contact.findAll({
            where:{
                [Op.or]:[{email:e},{phoneNumber:p}]
            },
            order:Sequelize.col('createdAt')
        });
        
        res.status(200).json(await getAllContact(retriveContacts));
        return;
    } 
});

async function getAllContact(contactsResponse: Contact[]):Promise<ApiResponse>{
    let contactResponse: ApiResponse={
        contact:{
            primaryContactId : 0,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: []
        }
    };
    contactsResponse.forEach(element => {
        const hasEmail =contactResponse.contact.emails.includes(element.email); 
        const hasMobile =contactResponse.contact.phoneNumbers.includes(element.phoneNumber); 
        if(!hasEmail){
            contactResponse.contact.emails.push(element.email);
        }
        if(!hasMobile){
            contactResponse.contact.phoneNumbers.push(element.phoneNumber);
        }
        if(element.linkPrecedence==='primary'){
            contactResponse.contact.primaryContactId=element.id;
        }
        else{
            contactResponse.contact.secondaryContactIds.push(element.id);
        }
        if(contactResponse.contact.primaryContactId==0&&element.linkedId!=null && element.linkedId!=0){
            contactResponse.contact.primaryContactId=element.linkedId;
        }
        
    });
    return contactResponse;
}

async function updatePrimaryContacts(contactsResponse: Contact[]){
    const primaryContact = contactsResponse[0];
    for(let i=1;i<contactsResponse.length;i++){
        let secondaryContacts = contactsResponse[i];
        secondaryContacts.update({
            linkPrecedence:'secondary',
            linkedId:primaryContact.id
        })
    }
}

async function order(email : string,phoneNumber:string,primaryId : number, isPrimary : boolean):Promise<Contact>{
    let newContact ;
    if(isPrimary){
        newContact=Contact.create({
            phoneNumber,
            email,
            linkPrecedence:'primary'
        })
    }
    else if(!isPrimary){
        newContact=Contact.create({
            phoneNumber,
            email,
            linkedId:primaryId,
            linkPrecedence:'secondary'
        })
   }
    return !newContact?new Contact:newContact; 
}
export default router;