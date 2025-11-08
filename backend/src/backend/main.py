from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import marvin

app = FastAPI(title="FeverDreamOS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_cache: dict[str, str] = {}


class UserAction(BaseModel):
    action: str
    data: dict[str, str] | None = None


@app.post("/action", response_class=HTMLResponse)
async def handle_action(action: UserAction) -> str:
    app_name = action.data.get("app_name", "Unknown App") if action.data else "Unknown App"
    
    if app_name in app_cache:
        return app_cache[app_name]
    
    html = await marvin.cast_async(
        {"app_name": app_name, "action": action.action},
        target=str,
        instructions=f"Generate HTML with inline CSS for a '{app_name}' desktop app. Windows XP style. Include relevant UI elements (toolbars, buttons, content area). ~540px × 300px. Return only the INNER content HTML (no outer containers, frames, or window borders - that's already provided). No markdown.",
    )
    
    app_cache[app_name] = html
    return html


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

