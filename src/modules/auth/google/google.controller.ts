import { Request, Response } from "express";
import { cookieOptions } from "../../../config/cookie.js";
import { GoogleService } from "./google.service.js";

export class GoogleController {
  constructor(private googleService: GoogleService) {}

  google = async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.googleService.google(
      req.body,
    );

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).send({ user });
  };
}
