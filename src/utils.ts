export function stringToRegex(str: string): string {
  let arr: string[] = str.replaceAll(":", "").split("/");
  arr = arr.slice(arr.indexOf("/:") -1);
  return arr.map(element => {if (element) new RegExp(`(?<${element}>\\w+)`)}).join("");
}

export function parseParams(router: string, path: string) {
  const obj: Record<string, string> = {};
  const index: number|undefined = router.indexOf(":");
  const routerArr: string[] = router.split("").splice(index, router.length).join("").split("/");
  const pathArr: string[] = path.split("").splice(index, path.length).join("").split("/");
  const routerLength: number = routerArr.length;
  for (let i = 0; i < routerLength; i++) {
    const entryLength = routerArr[i].length;
    for (let j = 0; j < entryLength; j++) {
      const char: string = routerArr[i].charAt(j);
      if (char === ":") {
        let param = "";

        for (let x = j + 1; x < entryLength; x++) {
          const character: string = routerArr[i].charAt(x);
          if (/\w/.test(character)) param += character;
          else break;
        }
        const input: string = pathArr[i];
        if (typeof param !== "undefined" && input) obj[param] = input;
      }
    }
  }
  return obj;
}