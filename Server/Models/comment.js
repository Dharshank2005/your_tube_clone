import mongoose from "mongoose";

const commentschema = mongoose.Schema({
    videoid: String,
    userid: String,
    commentbody: String,
    usercommented: String,
    commentedon: { type: Date, default: Date.now },
    city: {
        type: String,
        default: 'Unknown'
    }, // New field for city
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
})
export default mongoose.model("Comments", commentschema)