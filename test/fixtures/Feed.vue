<template>
  <div>
    <ul>
      <li v-for="user.posts as post">{{post.body}}</li>
    </ul>
    <button @click="addPost">add</button>
  </div>
</template>

<script>

import {mapGetters} from 'vuex';

export default {
  name: "Feed",

  computed: {
    ...mapGetters({user: 'loggedInUser'})
  },

  methods: {

    addPosts() {
      this.user.posts.create({body: "I am a new post"});
    }

  }
}
</script>

<style scoped>

</style>