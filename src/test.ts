class A {
  @Auth()
  @Permission('PERMISSION::CREATE || PERMISSION::CREATE::*')
  createPermission(){
    
  }
}

function Auth(): (target: () => void, context: ClassMethodDecoratorContext<A, () => void> & { name: "createPermission"; private: false; static: false; }) => void | (() => void) {
  throw new Error("Function not implemented.");
}

function Permission(args: string): (target: () => void, context: ClassMethodDecoratorContext<A, () => void> & { name: "createPermission"; private: false; static: false; }) => void | (() => void) {
  throw new Error("Function not implemented.");
}