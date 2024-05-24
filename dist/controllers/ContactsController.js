"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Contacts_1 = require("../models/Contacts");
const sequelize_1 = require("sequelize");
const Sequelize_1 = require("../utils/Sequelize");
const router = express.Router();
router.post('/identify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, phoneNumber } = req.body;
    let e = String(email);
    let p = String(phoneNumber);
    let contactsCount;
    if (e != 'null' && p != 'null') {
        contactsCount = yield Contacts_1.default.count({
            where: {
                [sequelize_1.Op.and]: [{ email: e }, { phoneNumber: p }]
            }
        });
    }
    else {
        contactsCount = yield Contacts_1.default.count({
            where: {
                [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }]
            }
        });
    }
    let contactsPrimary = yield Contacts_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }],
            [sequelize_1.Op.and]: [{ linkPrecedence: 'primary' }]
        },
        order: Sequelize_1.default.col('createdAt')
    });
    let primaryContactCount = yield Contacts_1.default.count({
        where: {
            [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }],
            [sequelize_1.Op.and]: [{ linkPrecedence: 'primary' }]
        },
    });
    if (primaryContactCount > 1) {
        let allPrimaryContacts = yield Contacts_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }],
                [sequelize_1.Op.and]: [{ linkPrecedence: 'primary' }]
            },
            order: Sequelize_1.default.col('createdAt')
        });
        let hasEmail = false;
        let hasNumber = false;
        allPrimaryContacts.forEach(contact => {
            if (contact.email === e) {
                hasEmail = true;
            }
            else if (contact.phoneNumber === p) {
                hasNumber = true;
            }
        });
        updatePrimaryContacts(allPrimaryContacts);
        console.log(`Contain Email = ${hasEmail} and contain Number = ${hasNumber}`);
        if (hasEmail && hasNumber) {
            res.status(200).json(yield getAllContact(allPrimaryContacts));
            return;
        }
    }
    if (contactsCount > 0 && contactsPrimary) {
        let retriveContacts = yield Contacts_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }]
            },
            order: sequelize_1.Sequelize.col('createdAt')
        });
        res.status(200).json(yield getAllContact(retriveContacts));
        return;
    }
    else if (contactsCount == 0 && contactsPrimary) {
        let retriveContacts = yield Contacts_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }]
            },
            order: sequelize_1.Sequelize.col('createdAt')
        });
        let hasEmail = false;
        let hasNumber = false;
        retriveContacts.forEach(contact => {
            if (contact.email === e) {
                hasEmail = true;
            }
            else if (contact.phoneNumber === p) {
                hasNumber = true;
            }
        });
        if (hasEmail && hasNumber) {
            res.status(200).json(yield getAllContact(retriveContacts));
            return;
        }
        else {
            let newContact = yield order(e, p, contactsPrimary.id, false);
            retriveContacts.push(newContact);
            res.status(200).json(yield getAllContact(retriveContacts));
            return;
        }
    }
    else if (contactsCount == 0 && !contactsPrimary) {
        let newContact = yield order(e, p, 0, true);
        res.status(200).json(yield getAllContact([newContact]));
        return;
    }
    else if (contactsCount > 0 && !contactsPrimary) {
        let retriveContacts = yield Contacts_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ email: e }, { phoneNumber: p }]
            },
            order: sequelize_1.Sequelize.col('createdAt')
        });
        res.status(200).json(yield getAllContact(retriveContacts));
        return;
    }
    // return res.json(contactResponse)
}));
function getAllContact(contactsResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        let contactResponse = {
            contact: {
                primaryContactId: 0,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: []
            }
        };
        contactsResponse.forEach(element => {
            const hasEmail = contactResponse.contact.emails.includes(element.email);
            const hasMobile = contactResponse.contact.phoneNumbers.includes(element.phoneNumber);
            if (!hasEmail) {
                contactResponse.contact.emails.push(element.email);
            }
            if (!hasMobile) {
                contactResponse.contact.phoneNumbers.push(element.phoneNumber);
            }
            if (element.linkPrecedence === 'primary') {
                contactResponse.contact.primaryContactId = element.id;
            }
            else {
                contactResponse.contact.secondaryContactIds.push(element.id);
            }
            if (contactResponse.contact.primaryContactId == 0 && element.linkedId != null && element.linkedId != 0) {
                contactResponse.contact.primaryContactId = element.linkedId;
            }
        });
        // console.log(contactResponse);
        return contactResponse;
    });
}
function updatePrimaryContacts(contactsResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        const primaryContact = contactsResponse[0];
        for (let i = 1; i < contactsResponse.length; i++) {
            let secondaryContacts = contactsResponse[i];
            secondaryContacts.update({
                linkPrecedence: 'secondary',
                linkedId: primaryContact.id
            });
        }
    });
}
function order(email, phoneNumber, primaryId, isPrimary) {
    return __awaiter(this, void 0, void 0, function* () {
        let newContact;
        if (isPrimary) {
            newContact = Contacts_1.default.create({
                phoneNumber,
                email,
                linkPrecedence: 'primary'
            });
        }
        else if (!isPrimary) {
            newContact = Contacts_1.default.create({
                phoneNumber,
                email,
                linkedId: primaryId,
                linkPrecedence: 'secondary'
            });
        }
        return !newContact ? new Contacts_1.default : newContact;
    });
}
exports.default = router;
