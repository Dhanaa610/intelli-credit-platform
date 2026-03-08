from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import uvicorn
import io

# Import services
from services import ingestion, analysis, research, prediction, cam_generator

app = FastAPI(title="IntelliCredit API", description="Autonomous Credit Decisioning Engine")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "IntelliCredit Engine Running"}



@app.post("/api/analyze")
async def analyze_company(
    name: str = Form(...),
    industry: str = Form(...),
    years_in_operation: int = Form(...),
    annual_revenue: float = Form(...),
    loan_amount_requested: float = Form(...),
    existing_liabilities: float = Form(...),
    files: Optional[List[UploadFile]] = File(default=None),
):
    """
    Main endpoint that orchestrates the entire credit decision pipeline.
    """
    company_info = {
        "name": name,
        "industry": industry,
        "years": years_in_operation,
        "revenue": annual_revenue,
        "requested": loan_amount_requested,
        "liabilities": existing_liabilities,
    }

    # Module 2: Ingestion (handles empty file list gracefully)
    safe_files = files if files else []
    extracted_data = await ingestion.process_documents(safe_files, company_info)

    # Module 3 & 5: Financial Analysis & Fraud Check
    financial_ratios, fraud_signals = analysis.compute_ratios(extracted_data)

    # Module 4: Autonomous Web Research
    research_signals = research.perform_background_check(name, industry)

    # Module 6 & 7: ML Risk Prediction & Decision
    risk_assessment, decision = prediction.evaluate_credit_risk(
        financial_ratios, research_signals, fraud_signals, company_info
    )

    results = {
        "company": company_info,
        "financials": financial_ratios,
        "fraud_alerts": fraud_signals,
        "research": research_signals,
        "risk": risk_assessment,
        "decision": decision,
    }

    return results


@app.post("/api/generate-cam")
async def generate_cam(data: dict):
    """
    Module 8: Generates a real PDF Credit Appraisal Memo and streams it to the client.
    """
    pdf_bytes = cam_generator.create_pdf(data)
    company_name = data.get("company", {}).get("name", "Company").replace(" ", "_")
    filename = f"CAM_{company_name}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )



# Mount frontend static files
# Use a relative path relative to this file
base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "..", "frontend")
app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
