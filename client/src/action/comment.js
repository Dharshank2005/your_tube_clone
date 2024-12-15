import * as api from "../Api";

export const editcomment = (commentdata) => async (dispatch) => {
    try {
        const { id, commentbody } = commentdata;
        const { data } = await api.editcomment(id, commentbody);
        dispatch({ type: "EDIT_COMMENT", payload: data });
        dispatch(getallcomment());
    } catch (error) {
        console.log(error);
    }
};

export const postcomment = (commentdata) => async (dispatch) => {
    try {
        const { data } = await api.postcomment(commentdata);

        console.log('Posted Comment Data:', data);

        dispatch({
            type: "POST_COMMENT", 
            payload: data 
        });
        dispatch(getallcomment());
    } catch (error) {
        console.error('Comment Posting Error:', error);
        alert("Don't use Special Characters in the Comments");
    }
};

export const getallcomment = () => async (dispatch) => {
    try {
        const { data } = await api.getallcomment();

        console.log('Raw Comments Received:', data);

        dispatch({
            type: "FETCH_ALL_COMMENTS",
            payload: data.map(comment => ({
                ...comment,
                cid: comment._id,
                city: comment.city || 'Unknown'  // Ensure the city is always present
            }))
        });
    } catch (error) {
        console.error('Fetch Comments Detailed Error:', error);
    }
};

export const deletecomment = (id) => async (dispatch) => {
    try {
        await api.deletecomment(id);
        dispatch(getallcomment());
    } catch (error) {
        console.log(error);
    }
};
