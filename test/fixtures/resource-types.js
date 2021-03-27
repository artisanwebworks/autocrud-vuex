export default {

    user: {

        posts: {
            type: "post",
            cardinality: "many"
        },

        starredPosts: {
            type: "post",
            cardinality: "many"
        },

        profile: {
            type: "profile",
            cardinality: "one"
        }
    },

    post: {

        replies: {
            type: "comment",
            cardinality: "many"
        }

    },

    comment: {

    },

    profile: {

    }
}