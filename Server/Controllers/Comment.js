import comment from "../Models/comment.js";
import mongoose from "mongoose";
import axios from "axios";
import geoip from 'geoip-lite';
import dotenv from 'dotenv';
dotenv.config();

// export const postcomment = async (req, res) => {
//     const commentdata = req.body;
    
//     try {
//         // Existing special character check
//         const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
//         if (specialCharRegex.test(commentdata.commentbody)) {
//             return res.status(400).json({ message: "Special characters are not allowed" });
//         }

//         // Enhanced City Detection
//         try {
//             // If city is not provided in the request, try to detect
//             if (!commentdata.city) {
//                 const city = await detectCity(req);
//                 commentdata.city = city || 'Unknown';
//             }
            
//             console.log('Final Comment Data with City:', {
//                 ...commentdata,
//                 city: commentdata.city
//             });
//         } catch (cityDetectionError) {
//             console.error('City Detection Fallback:', cityDetectionError);
//             commentdata.city = 'Unknown';
//         }

//         const postcomment = new comment(commentdata);
//         const savedComment = await postcomment.save();
        
//         console.log('Saved Comment with City:', savedComment);
        
//         res.status(200).json({
//             ...savedComment.toObject(),
//             city: savedComment.city || 'Unknown'
//         });
//     } catch (error) {
//         console.error('Comment Posting Error:', error);
//         res.status(400).json({ 
//             message: "Error posting comment", 
//             error: error.message 
//         });
//     }
// }

const getLocationFromIP = async () => {
    try {
        // Get the public IP address
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        const ip = ipResponse.data.ip;

        // Use geoip-lite to get the location based on the IP
        const geo = geoip.lookup(ip);
        if (geo) {
            const lat = geo.ll[0]; // Latitude
            const lon = geo.ll[1]; // Longitude
            return await fetchCityFromCoordinates(lat, lon); // Fetch city name
        }
    } catch (error) {
        console.error("Error getting location from IP:", error);
    }
    return "Unknown"; // Return "Unknown" if no location found
};

const fetchCityFromCoordinates = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY; // Use environment variable for API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const response = await axios.get(url);
        return response.data.name; // Get the city name from the response
    } catch (error) {
        console.error("Error fetching the weather data: ", error);
        return "Unknown";
    }
};

export const postcomment = async (req, res) => {
    const commentdata = req.body;

    try {
        // Ensure city is always set
        commentdata.city = commentdata.city || await getLocationFromIP() || 'Unknown';

        // Existing special character check
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (specialCharRegex.test(commentdata.commentbody)) {
            return res.status(400).json({ message: "Special characters are not allowed" });
        }

        const postComment = new comment(commentdata);
        const savedComment = await postComment.save();

        res.status(200).json({
            ...savedComment.toObject(),
            city: savedComment.city || 'Unknown'
        });
    } catch (error) {
        console.error('Comment Posting Error:', error);
        res.status(400).json({
            message: "Error posting comment",
            error: error.message
        });
    }
};

export const getcomment = async (req, res) => {
    try {
        const commentlist = await comment.find().lean();
        
        const processedComments = commentlist.map(comment => ({
            ...comment,
            city: comment.city || 'Unknown'
        }));

        console.log('Backend Processed Comments:', processedComments.map(c => ({
            _id: c._id,
            city: c.city,
            commentBody: c.commentbody
        })));

        res.status(200).json(processedComments);
    } catch (error) {
        console.error('Comments Retrieval Error:', error);
        res.status(400).json(error.message);
    }
}


export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }
    try {
        await comment.findByIdAndDelete(_id);
        res.status(200).json({ message: "deleted comment" })
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(
            _id,
            { $set: { "commentbody": commentbody } }
        )
        res.status(200).json(updatecomment)
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const translateComment = async (req, res) => {
    const { commentBody, targetLang } = req.body;

    if (!commentBody || !targetLang) {
        return res.status(400).json({ message: "Invalid request data." });
    }

    try {
        const response = await axios.post("http://127.0.0.1:5000/translate", {
            q: commentBody,
            source: "auto", // Automatically detect the source language
            target: targetLang,
        });

        res.status(200).json({ translatedText: response.data.translatedText });
    } catch (error) {
        res.status(500).json({ message: "Translation failed.", error: error.message });
    }
};
export const likeComment = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        // First, check if the comment exists
        const commentDoc = await comment.findById(id);
        
        if (!commentDoc) {
            return res.status(404).json({ message: "Comment not found", removed: true });
        }

        // Ensure likes and dislikes fields exist
        if (!commentDoc.likes) commentDoc.likes = 0;
        if (!commentDoc.dislikes) commentDoc.dislikes = 0;

        if (action === 'like') {
            commentDoc.likes += 1;
        } else if (action === 'dislike') {
            commentDoc.dislikes += 1;
            
            // Auto-remove comment if it gets 2 or more dislikes
            if (commentDoc.dislikes >= 2) {
                await comment.findByIdAndDelete(id);
                return res.status(200).json({ 
                    message: "Comment removed due to excessive dislikes", 
                    removed: true 
                });
            }
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        // Save the updated comment
        const updatedComment = await commentDoc.save();
        res.status(200).json(updatedComment);
    } catch (error) {
        console.error("Like/Dislike error:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
}