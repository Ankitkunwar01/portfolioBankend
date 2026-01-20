import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {

       Name:{
       type:String,
       required:true,} ,
        Email: {
            type:String,
            required:true,} ,
        Message: {
            type:String,
            required:true,} ,
        status: {
            type: String,
            enum: ['new', 'read'],
            default: 'new'
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
