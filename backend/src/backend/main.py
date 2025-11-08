from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import marvin

app = FastAPI(title="Browser OS Backend")


class UserAction(BaseModel):
    action: str
    data: dict[str, str] | None = None


@app.post("/action", response_class=HTMLResponse)
async def handle_action(action: UserAction) -> str:
    html = await marvin.cast_async(
        action,
        target=str,
        instructions="Generate HTML content for a browser OS File Explorer window based on the user action. Return only valid HTML, no markdown or code blocks. For 'open_file_explorer' action, create a file explorer interface with width 560px, height 320px, padding 12px.",
    )
    return html


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

