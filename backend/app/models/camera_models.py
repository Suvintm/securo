from pydantic import BaseModel, Field
from typing import Literal, Optional

SourceType = Literal["laptop_cam", "usb_cam", "rtsp"]

class CameraCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    location: str = Field(min_length=1, max_length=120)
    source: SourceType = "laptop_cam"
    rtsp_url: Optional[str] = None

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    source: Optional[SourceType] = None
    rtsp_url: Optional[str] = None

class CameraOut(BaseModel):
    id: str
    name: str
    location: str
    source: SourceType
    is_active: bool
    created_by: str
