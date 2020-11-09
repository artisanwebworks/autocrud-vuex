export default {

    user: {

        posts: {
            type: "post",
            cardinality: "many"
        },

        starredPosts: {
            type: "post",
            cardinality: "many"
        }
    },

    post: {

        replies: {
            type: "comment",
            cardinality: "many"
        }

    },

    comment: {

    }
}