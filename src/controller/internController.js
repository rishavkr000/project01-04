const { isValidObjectId } = require("mongoose");
const collegeModel = require("../model/collegeModel");
const internModel = require("../model/internModel");
const { isValidRequestBody, isValid, isValidEmail, isValidMobile, isValidFullName } = require("../utility/validator");

let createIntern = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "No user input" })

        let { name, email, mobile, collegeId } = data;
        if (!isValid(name)) return res.status(400).send({ status: false, msg: "Name is required" })
        if(!isValidFullName(name)) return res.status(400).send({ status: false, msg: "Name only contain alphabet and space" })
        if (!isValid(email)) return res.status(400).send({ status: false, msg: "Email is required" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not a valid email` })

        const isUniqueEmail = await internModel.findOne({ email: email })  //For checking duplicate email id
        if (isUniqueEmail) return res.status(400).send({ status: false, message: `This email ${email} is already registered` })
        if (!isValid(mobile)) return res.status(400).send({ status: false, msg: "Mobile is required" })
        if (!isValidMobile(mobile)) return res.status(400).send({ status: false, msg: `${mobile} is not a valid mobile number` })
        const isUniqueMobile = await internModel.findOne({ mobile: mobile })
        if (isUniqueMobile) return res.status(400).send({ status: false, message: `This mobile number ${mobile} is already exist` })
        if (!isValid(collegeId)) return res.status(400).send({ status: false, msg: "College Id is required" })
        if (!isValidObjectId(collegeId)) return res.status(400).send({ status: false, msg: `${collegeId} is not a valid object id` })

        let internData = { name,email, mobile, collegeId }
        const saveData = await internModel.create(internData);

        return res.status(201).send({ status: true, msg: "Intern data saved sucessfully", data: saveData })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



const getIntern = async function (req, res) {
    try {
        let collegName = req.query.collegeName.toLowerCase();
        console.log( collegName)
        if (!isValid(collegName)) return res.status(400).send({ status: false, msg: "collegeName is required in query params" })

        const getCollege = await collegeModel.find({ name: collegName })
        console.log(getCollege)
        if (Array.isArray(getCollege) && getCollege.length === 0) return res.status(400).send({ status: false, msg: "College not found!" })
        let [{ _id, name, fullName, logoLink }] = getCollege;
        if (!isValidObjectId(_id)) return res.status(400).send({ status: false, msg: "College id is not a valid object id" })
        const getIntern = await internModel.find({ collegeId: _id}).select({_id:1,name:1,email:1,mobile:1})
        if (Array.isArray(getIntern) && getIntern.length === 0) return res.status(400).send({ status: false, msg: "Intern data not found!" })

        return res.status(200).send({ data: { name: name, fullName: fullName, logoLink: logoLink, interests: getIntern } })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}


module.exports = { createIntern, getIntern };
