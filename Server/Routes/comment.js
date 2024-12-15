import express from "express"
import { postcomment, getcomment, deletecomment, editcomment, translateComment, likeComment } from "../Controllers/Comment.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/post", postcomment)
router.get('/get', getcomment)
router.delete('/delete/:id', deletecomment)
router.patch('/edit/:id', editcomment)
router.post("/translate", translateComment)
router.post("/like/:id", likeComment)

export default router