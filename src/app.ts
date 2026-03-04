import express from "express";
import path from "path";
import router from "./routes";
import cors from "cors";

function createApp() {
  const app = express();

  app.use(express.json());

  const corsOptions = {
    origin: ["http://felipao.sistem.com", "http://gov.br"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  };

  app.use(cors(corsOptions));
  app.use("/api", router);

  const publicPath = path.join(process.cwd(), "src", "public");
  app.use(express.static(publicPath));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  return app;
}

export default createApp;
