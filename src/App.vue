<script lang="ts" setup>
import vPermission from './directive/v-permission';
</script>

<template>
  <span v-permission="'!a || (b || !c)'">完 全 勝 利</span>
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