export function parse(router: string, input: string) {
  const obj = {};
  const index: number|undefined = router.indexOf(":");
  const routerArr: string[] = router.split("").splice(index, router.length).join("").split("/");
  const inputArr: string[] = input.split("").splice(index, input.length).join("").split("/");
  const routerLength: number = routerArr.length;
  for (let i = 0; i < routerLength; i++) {
    const entryLength = routerArr[i].length;
    for (let j = 0; j < entryLength; j++) {
      const char = routerArr[i].charAt(j);
      if (char === ":") {
        let param = "";

        for (let x = j + 1; x < entryLength; x++) {
          const character = routerArr[i].charAt(x);
          if (/\w/.test(character)) {
            param += character;
          } else break;
        }
        const input = inputArr[i];
        if (typeof param !== "undefined" && typeof input !== "undefined") Object.assign(obj, {[param]: input})
      }
    }
  }
  return obj;
}
console.log(parse("/reeeeeeeee/:id/:fuck/", "/reeeeeeeee/rover/mars"));