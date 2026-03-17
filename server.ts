import app from "./app.js";
import { ENV } from "./src/config/env.config.js";

const port = ENV.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
