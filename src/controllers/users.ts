import express from "express";
import { deleteUserById, getUserById, getUsers } from "../db/users";
import { authentication, random } from "../helpers";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id);

    return res.json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const { email, password, username } = req.body;

    if (!email || !password || !username) return res.sendStatus(400);

    const user = await getUserById(id);

    user.username = username;
    user.email = email;

    const salt = random();
    const hashedPassword = authentication(salt, password);

    user.authentication.salt = salt;
    user.authentication.password = hashedPassword;

    await user.save();

    await user.save();
    return res.status(200).json("User updated!").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
