from typing import List
from fastapi import UploadFile

async def process_documents(files: List[UploadFile], company_info: dict) -> dict:
    """
    Module 2: Data Ingestion Engine
    Extracts text and financial values from PDF/Excel documents.
    """
    processed_files = []
    
    # Simulate extraction process
    for file in files:
        # In a real scenario, use PyPDF2, pdfplumber, or pandas here
        processed_files.append({
            "filename": file.filename,
            "status": "extracted",
            "type": file.filename.split('.')[-1]
        })
        
    # Simulate combining extracted OCR data with manual user input
    extracted_data = {
        "total_revenue": company_info["revenue"],
        "net_profit": company_info["revenue"] * 0.15, # Mock 15% margin
        "total_assets": company_info["revenue"] * 1.5,
        "total_liabilities": company_info["liabilities"],
        "cash_flow": company_info["revenue"] * 0.1,
        "debt_obligations": company_info["liabilities"] * 0.2,
        "documents_processed": processed_files
    }
    
    return extracted_data
