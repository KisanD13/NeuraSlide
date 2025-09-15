import { Router } from "express";
import { PostContextController } from "./postContextController";
import { authenticate } from "../../middlewares/authenticate";

const postContextRouter = Router();

// Apply authentication middleware to all routes
postContextRouter.use(authenticate);

// Post Context routes
postContextRouter.post("/", PostContextController.createPostContext);
postContextRouter.get("/", PostContextController.getPostContexts);
postContextRouter.get("/:id", PostContextController.getPostContext);
postContextRouter.put("/:id", PostContextController.updatePostContext);
postContextRouter.delete("/:id", PostContextController.deletePostContext);

export { postContextRouter };
