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
  handleInputFirstName: () => Promise<void>;
  handleInputLastName: () => Promise<void>;
  handleInputEmail: () => Promise<void>;
  handleClickSubmit: () => Promise<void>;
  handleClickClear: () => Promise<void>;
};

export async function selectAction(
  {
    handleInputEmail,
    handleInputFirstName,
    handleInputLastName,
    handleClickSubmit,
    handleClickClear,
  }: ActionHandler,
) {
  let running = true;

  while (running) {
    const action = await Select.prompt({
      message: "Select an action",
      options: [
        { name: "Input first name", value: "inputFirstName" },
        { name: "Input last name", value: "inputLastName" },
        { name: "Input email", value: "inputEmail" },
        { name: "Click submit button", value: "clickSubmit" },
        { name: "Click clear button", value: "clickClear" },
        { name: "Exit", value: "exit" },
      ],
    });

    switch (action) {
      case "inputFirstName":
        await handleInputFirstName();
        break;
      case "inputLastName":
        await handleInputLastName();
        break;
      case "inputEmail":
        await handleInputEmail();
        break;
      case "clickSubmit":
        await handleClickSubmit();
        break;
      case "clickClear":
        await handleClickClear();
        break;
      case "exit":
        running = false;
        console.log(info("Press ctrl+c to exit"));
        break;
    }
  }
}
