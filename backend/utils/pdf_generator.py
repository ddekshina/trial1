from fpdf import FPDF
import os
import uuid
from flask import current_app, url_for
from datetime import datetime

def generate_quote_pdf(quote_data):
    """Generate a PDF quote with proper error handling"""
    try:
        pdf = FPDF()
        pdf.add_page()
        
        # Set font and title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="QUOTE", ln=1, align='C')
        pdf.ln(10)
        
        # Add client/project info if available
        pdf.set_font("Arial", size=12)
        if 'client_name' in quote_data:
            pdf.cell(200, 10, txt=f"Client: {quote_data['client_name']}", ln=1)
        if 'project_title' in quote_data:
            pdf.cell(200, 10, txt=f"Project: {quote_data['project_title']}", ln=1)
        pdf.ln(10)
        
        # Add quote breakdown
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(100, 10, "Item", border=1)
        pdf.cell(50, 10, "Amount", border=1, align='R')
        pdf.ln()
        
        pdf.set_font("Arial", size=10)
        for item, amount in quote_data.get('breakdown', {}).items():
            pdf.cell(100, 10, item.replace('_', ' ').title(), border=1)
            pdf.cell(50, 10, f"${amount:,}", border=1, align='R')
            pdf.ln()
        
        # Add total
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(100, 10, "TOTAL", border=1)
        pdf.cell(50, 10, f"${quote_data.get('total', 0):,}", border=1, align='R')
        pdf.ln(15)
        
        # Add validity date
        valid_until = quote_data.get('valid_until', datetime.now().strftime('%Y-%m-%d'))
        pdf.cell(200, 10, txt=f"Valid until: {valid_until}", ln=1)
        
        # Ensure upload folder exists
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        filename = f"quote_{quote_data.get('id', uuid.uuid4().hex[:8])}.pdf"
        filepath = os.path.join(upload_folder, filename)
        
        pdf.output(filepath)
        
        return url_for('quote.serve_pdf', filename=filename)
        
    except Exception as e:
        current_app.logger.error(f"PDF generation failed: {str(e)}")
        raise  # Re-raise the exception to be handled by the calling function