import { Application, Router } from "./mod.ts";
import { Context } from "./typings/index.ts";
const app = new Application();
app.get("/", (req:Context) => {
  req.response.body = "2";
});

const route1 = new Router("/fuckyou");
route1.get('/:id', (req: Context) => {
  req.response.body = "fuckyou something";
});

app.use(route1);
await app.listen(8000);