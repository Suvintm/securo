from typing import Dict, Any
from app.repositories import anomalies_repo


async def create_anomaly_svc(anomaly: Dict[str, Any], frame, camera: Dict[str, Any]):
    """
    Handles Cloudinary upload + MongoDB insert.
    """
    await anomalies_repo.save_anomaly_image(anomaly, frame, camera)


async def list_anomalies_svc(limit: int = 50, skip: int = 0):
    """List all anomaly records"""
    return await anomalies_repo.list_anomalies(limit=limit, skip=skip)


async def delete_anomaly_svc(anomaly_id: str) -> bool:
    """Delete anomaly record"""
    return await anomalies_repo.delete_anomaly(anomaly_id)


async def delete_multiple_anomalies_svc(anomaly_ids: list):
    """Delete multiple anomaly records"""
    return await anomalies_repo.delete_multiple_anomalies(anomaly_ids)
