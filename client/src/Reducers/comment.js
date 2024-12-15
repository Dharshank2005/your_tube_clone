const commentreducer = (state = { data: null }, action) => {
    switch (action.type) {
        case "POST_COMMENT":
            return {
                ...state,
                data: action.payload
                    ? [...(state.data || []), {
                        ...action.payload,
                        city: action.payload.city || 'Unknown'  // Ensure city is set
                    }]
                    : state.data
            };
        case "EDIT_COMMENT":
            return { ...state };

        case "FETCH_ALL_COMMENTS":
            return {
                ...state,
                data: action.payload.map(comment => {
                    console.log('Reducer Processing Comment:', {
                        id: comment._id,
                        city: comment.city,
                        cityType: typeof comment.city
                    });
                    return {
                        ...comment,
                        city: comment.city || 'Unknown'  // Ensure city is always set
                    };
                })
            };
        default:
            return state;
    }
};
export default commentreducer;
