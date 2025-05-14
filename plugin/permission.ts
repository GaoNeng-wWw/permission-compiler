import type {Plugin} from 'vite';
import permissionTransform from './permission-transform';


const permission = ()=>{
  return {
    name: 'vite-plugin-vue-permission',
    transform(code, id, options) {
      if (!id.endsWith('.ts') && !id.endsWith('vue')){
        return code;
      }
      permissionTransform(code, id);
      return code;
    },
    enforce: 'pre',
  } as Plugin;
}

export default permission;