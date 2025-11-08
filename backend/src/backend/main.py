from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import marvin

app = FastAPI(title="Browser OS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserAction(BaseModel):
    action: str
    data: dict[str, str] | None = None


@app.post("/action", response_class=HTMLResponse)
async def handle_action(action: UserAction) -> str:
    app_name = action.data.get("app_name", "Unknown App") if action.data else "Unknown App"
    
    html = await marvin.cast_async(
        {"app_name": app_name, "action": action.action},
        target=str,
        instructions=f"Generate HTML with inline CSS for a '{app_name}' desktop app. Windows XP style. Include relevant UI elements (toolbars, buttons, content area). ~540px × 300px. Return only the HTML content, no markdown.",
    )
    return html


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

