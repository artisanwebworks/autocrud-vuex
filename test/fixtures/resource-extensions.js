import Resource from "../../src/Resource"

export default {

    user: class extends Resource {

        hasEvenNumberPosts() {
            return this.posts.length % 2 === 0
        }

    }

}