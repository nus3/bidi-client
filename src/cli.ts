import { Input } from "@cliffy/prompt/input";
import { Select } from "@cliffy/prompt/select";
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

type ActionHandler = {
  handleInput: () => Promise<void>;
  handleClickClear: () => Promise<void>;
};

export async function selectAction(
  { handleInput, handleClickClear }: ActionHandler,
) {
  let running = true;

  while (running) {
    const action = await Select.prompt({
      message: "Select an action",
      options: [
        { name: "Input text", value: "input" },
        { name: "Click clear button", value: "click" },
        { name: "Exit", value: "exit" },
      ],
    });

    switch (action) {
      case "input":
        await handleInput();
        break;
      case "click":
        await handleClickClear();
        break;
      case "exit":
        running = false;
        console.log(info("Press ctrl+c to exit"));
        break;
    }
  }
}
