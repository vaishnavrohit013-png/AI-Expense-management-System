import { Resend } from "resend";
import { Env } from "./env.config.js";

const resend = new Resend(Env.RESEND_API_KEY);

export default resend;
