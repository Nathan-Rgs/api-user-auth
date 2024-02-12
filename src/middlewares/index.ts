import express from "express";
import { get, merge } from "lodash";
import { getUserBySessionToken } from "../db/users";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, "identity._id") as string;

    if (!currentUserId) return res.status(403).json("There is no user logged");
    if (currentUserId.toString() !== id)
      return res
        .status(403)
        .json("You dont have permission to handle this user");

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const sessionToken = req.cookies["PROJECT-AUTH"];

    if (!sessionToken) return res.status(403).json("User not authenticated!");

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) return res.status(403).json("User does not exist!");

    merge(req, { identity: existingUser });
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
