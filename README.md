# nus3/bidi-client

This project is a command-line interface (CLI) client designed to experiment with WebDriver BiDi.

## Installation

To use this CLI tool, you need to have [Deno](https://deno.com/) installed on your system. Follow these steps to install and set up the CLI:

1. **Install Deno**: If you haven't installed Deno yet, you can do so by following the instructions on the [official Deno website](https://docs.deno.com/runtime/getting_started/installation/).

2. **Clone the Repository**: Clone this repository to your local machine

## Usage

To use the CLI tool to control Firefox on macOS, follow these steps:

1. **Start Firefox with Remote Debugging**: Open a terminal and navigate to the Firefox application directory, then start Firefox with the remote debugging option enabled.

```shell
cd /Applications/Firefox.app/Contents/MacOS
./firefox --remote-debugging-port
```

2. Run the CLI Tool: With Firefox running in remote debugging mode, you can now start the CLI tool using the following command:

```shell
❯ deno run dev
Task dev deno run --allow-net --watch main.ts
Watcher Process started.
? Enter the URL of the browser to connect to (ws://localhost:9222/session) ›
```

Enter the URL `ws://localhost:9222/session` to connect to the Firefox instance you started in step 1.

3. Automatic Navigation: Once the WebSocket connection is successfully established, Firefox will automatically navigate to https://nus3.github.io/ui-labs/form/.

4. Select an Action: After navigation, the CLI will present you with a list of actions you can perform. Use the arrow keys to select an action and press Enter to execute it. The available actions are:

```shell
? Select an action
❯ Input first name
  Input last name
  Input email
  Click submit button
  Click clear button
  Subscribe event
  Unsubscribe event
  Exit
```

For example, to input a first name, select "Input first name" and input text `Hello`.

5. Exit the CLI: To exit the CLI, select the "Exit" option from the list. This will close the WebSocket connection. You can also terminate the CLI by pressing Ctrl+C in the terminal, which will also disconnect the WebSocket and stop the CLI process.

```shell
? Select an action › Exit
Press ctrl+c to exit
Received SIGINT, closing WebSocket...
Session end.
```
