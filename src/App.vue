<script lang="ts" setup>
import { ref } from 'vue';
import vPermission from './directive/v-permission';
const bind = ref('permission-2');

</script>


<template>
  <span v-permission="'test'">You Have Permission</span>
  <!-- <span v-permission="bind">You Have Permission</span> -->
</template>

<style>
html,body,#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  text-align: center;
  padding: 24px 0;
}
*{
  box-sizing: border-box;
}
span{
  font-size: 24px;
}
</style>