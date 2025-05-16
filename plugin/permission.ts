import type {Plugin} from 'vite';
import permissionTransform from './permission-transform';


const permission = ()=>{
  return {
    name: 'vite-plugin-vue-permission',
    transform(code, id, options) {
      if (!id.endsWith('vue')){
        return code;
      }
      return permissionTransform(code, id);
    },
    enforce: 'pre',
  } as Plugin;
}

export default permission;