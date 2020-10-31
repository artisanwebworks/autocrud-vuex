<template>
  <div>{{foo.count}}</div>
</template>

<script>

import {mapGetters} from 'vuex';

export default {
  name: "Feed",

  computed: {
    ...mapGetters({foo: 'foo'})
  }

}
</script>
