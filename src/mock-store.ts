import { ref, type Ref } from "vue"

const permissions:Ref<string[]> = ref(['permission-2']);

export const useAccount = () => {
  const add = (permission: string) => {
    permissions.value.push(permission);
  }
  const remove = (permission: string) => {
    permissions.value = permissions.value.filter(p => p === permission);
  }
  const has = (permission: string) => permissions.value.some(p => p === permission);
  return { add, remove, has, permissions };
}