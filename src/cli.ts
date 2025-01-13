import { Input } from "@cliffy/prompt/input";
import { colors } from "@cliffy/ansi/colors";

export const err = colors.bold.red;
export const warn = colors.bold.yellow;
export const info = colors.bold.blue;

export async function getWebSocketUrl(): Promise<string> {
  return await Input.prompt({
    message: "Enter the URL of the browser to connect to",
    default: "ws://localhost:9222/session",
  });
}
