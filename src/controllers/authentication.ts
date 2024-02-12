import express from "express";
import { body, validationResult } from "express-validator";
import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.sendStatus(400);

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password",
    );
    if (!user) return res.status(400).json("User does not exist");

    const expectedHash = authentication(user.authentication.salt, password);
    if (user.authentication.password !== expectedHash)
      return res.status(403).json("Email or password incorrect");

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString(),
    );

    await user.save();

    res.cookie("PROJECT-AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
];

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser)
      return res.status(400).json("This email is already in use").end();

    const salt = random();

    const user = await createUser({
      email,
      username,
      authentication: {
        salt: salt,
        password: authentication(salt, password),
      },
    });

    return res.status(201).json(user).end();
  } catch (error: any) {
    console.log(error);
    return res.sendStatus(400);
  }
};
