import subprocess
from ollama import chat
from ollama import ChatResponse


ALLOWED_COMMANDS = {"ls", "df", "free", "uptime", "whoami", "pwd"}
MODEL = "qwen2.5:3b"


def run_command(command):
    base_command = command.split()[0]
    if base_command not in ALLOWED_COMMANDS:
        return "Command not allowed"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        return result.stdout
    else:
        return result.stderr


def get_man_page(command):
    result = subprocess.run(
        f"man {command} | col -b | head -n 80",
        shell=True,
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        return result.stdout
    else:
        return result.stderr


def tldr_help(command):
    result = subprocess.run(
        f"tldr {command}", shell=True, capture_output=True, text=True
    )
    if result.returncode == 0:
        return result.stdout
    else:
        return result.stderr


def ask_llm(messages):
    response: ChatResponse = chat(model=MODEL, messages=messages,)

    if response:
        return response
    else:
        print("Could not send to ollama")


if __name__ == "__main__":
    conversation = []

    while True:
        user_input = input("You: ")
        conversation.append({"role": "user", "content": user_input})

        response = ask_llm(conversation)

        # Check if response contains a tool call (assuming response.tool and response.arguments exist)
        if hasattr(response, "tool") and hasattr(response, "arguments"):
            tool_name = response.tool
            tool_args = response.arguments

            if tool_name == "run_command":
                tool_result = run_command(tool_args["command"])
            elif tool_name == "get_man_page":
                tool_result = get_man_page(tool_args["command"])
            elif tool_name == "tldr_help":
                tool_result = tldr_help(tool_args["command"])
            else:
                tool_result = "Unknown tool"

            conversation.append({"role": "tool", "content": tool_result})
            continue

        else:
            print(
                "Assistant:",
                response.message if hasattr(response, "message") else response,
            )
            conversation.append(
                {
                    "role": "assistant",
                    "content": response.message
                    if hasattr(response, "message")
                    else str(response),
                }
            )
