from flask import Blueprint, request, jsonify, current_app, send_from_directory
from models import db, PricingForm
from datetime import datetime, timedelta
import json
import os
from fpdf import FPDF
import uuid

quote_bp = Blueprint('quote', __name__, url_prefix='/api')

@quote_bp.route('/forms/<int:form_id>/generate-quote', methods=['POST'])
def generate_form_quote(form_id):
    """Generate quote for an existing form"""
    try:
        # Get the form from database
        form = PricingForm.query.get(form_id)
        if not form:
            return jsonify({"error": "Form not found"}), 404

        # Transform form data for calculation
        calculation_data = {
            'num_dashboards': len(form.expected_deliverables) if form.expected_deliverables else 0,
            'num_widgets': form.number_of_widgets or 0,
            'data_sources': form.data_sources or [],
            'database_tables': [{'records': db.records or 0} for db in form.databases] if form.databases else [],
            'num_apis': form.number_of_integrations or 0,
            'features': form.interactivity_needed or [],
            'include_logo': 'branding' in (form.customization_needs or []),
            'custom_colors': 'colors' in (form.customization_needs or []),
            'custom_fonts': 'fonts' in (form.customization_needs or []),
            'support_plan': form.support_plan_required or 'basic',
            'support_hours': 10 if form.support_plan_required == 'priority' else 0,
            'support_months': 1 if form.support_plan_required == 'dedicated' else 0
        }

        # Calculate the quote
        quote_result = calculate_quote(calculation_data)
        
        # Generate PDF
        pdf_url = generate_quote_pdf({
            'total': quote_result['total'],
            'breakdown': quote_result['breakdown'],
            'valid_until': quote_result['valid_until'],
            'form_data': {
                'client_name': form.client_name,
                'project_title': form.project_title
            }
        })

        # Update form with quote data
        form.quote_total = quote_result['total']
        form.quote_breakdown = json.dumps(quote_result['breakdown'])
        form.quote_pdf_url = pdf_url
        form.quote_generated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'total': quote_result['total'],
            'breakdown': quote_result['breakdown'],
            'pdf_url': pdf_url,
            'valid_until': quote_result['valid_until']
        })

    except Exception as e:
        current_app.logger.error(f"Form quote generation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@quote_bp.route('/generate-quote', methods=['POST'])
def generate_direct_quote():
    """Generate quote directly from posted data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Calculate the quote
        quote_result = calculate_quote(data)

        # Generate PDF
        pdf_url = generate_quote_pdf({
            'total': quote_result['total'],
            'breakdown': quote_result['breakdown'],
            'valid_until': quote_result['valid_until'],
            'form_data': {
                'client_name': data.get('client_name', ''),
                'project_title': data.get('project_title', '')
            }
        })

        return jsonify({
            'total': quote_result['total'],
            'breakdown': quote_result['breakdown'],
            'pdf_url': pdf_url,
            'valid_until': quote_result['valid_until']
        })

    except Exception as e:
        current_app.logger.error(f"Direct quote generation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_quote(data):
    """Calculate quote breakdown from input data"""
    breakdown = {
        'dashboards': data.get('num_dashboards', 0) * 1000,
        'widgets': data.get('num_widgets', 0) * 20,
        'data_files': len(data.get('data_sources', [])) * 40,
        'database_tables': calculate_database_costs(data.get('database_tables', [])),
        'apis': data.get('num_apis', 0) * 1200,
        'features': len(data.get('features', [])) * 20,
        'branding': calculate_branding_costs(data),
        'support': calculate_support_costs(data)
    }

    total = sum(breakdown.values())

    return {
        'total': total,
        'breakdown': breakdown,
        'valid_until': (datetime.now() + timedelta(days=30)).isoformat()
    }

def calculate_database_costs(tables):
    """Calculate database costs based on record counts"""
    cost = 0
    for table in tables:
        records = table.get('records', 0)
        if records < 1000:
            cost += 40
        elif records < 10000:
            cost += 100
        elif records < 100000:
            cost += 200
        elif records < 1000000:
            cost += 300
        else:
            cost += 700
    return cost

def calculate_branding_costs(data):
    """Calculate branding customization costs"""
    cost = 0
    if data.get('include_logo', False):
        cost += 40
    if data.get('custom_colors', False):
        cost += data.get('num_widgets', 0) * 20
        cost += data.get('num_dashboards', 0) * 20
    if data.get('custom_fonts', False):
        cost += data.get('num_widgets', 0) * 20
    return cost

def calculate_support_costs(data):
    """Calculate support plan costs"""
    plan = data.get('support_plan', 'basic')
    if plan == 'priority':
        return 40 * data.get('support_hours', 0)
    elif plan == 'dedicated':
        return 400 * data.get('support_months', 0)
    return 0

def generate_quote_pdf(quote_data):
    """Generate PDF quote document"""
    try:
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Add title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Project Quote", ln=1, align='C')
        pdf.ln(10)
        
        # Add client/project info
        pdf.set_font("Arial", size=12)
        if quote_data.get('form_data', {}).get('client_name'):
            pdf.cell(200, 10, txt=f"Client: {quote_data['form_data']['client_name']}", ln=1)
        if quote_data.get('form_data', {}).get('project_title'):
            pdf.cell(200, 10, txt=f"Project: {quote_data['form_data']['project_title']}", ln=1)
        pdf.ln(10)
        
        # Add quote details
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(200, 10, txt=f"Total: ${quote_data['total']:,}", ln=1)
        pdf.ln(10)
        
        # Add breakdown table
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(120, 10, "Item", border=1)
        pdf.cell(50, 10, "Cost", border=1, align='R')
        pdf.ln()
        
        pdf.set_font("Arial", size=10)
        for item, cost in quote_data['breakdown'].items():
            pdf.cell(120, 10, item.replace('_', ' ').title(), border=1)
            pdf.cell(50, 10, f"${cost:,}", border=1, align='R')
            pdf.ln()
        
        # Add total row
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(120, 10, "TOTAL", border=1)
        pdf.cell(50, 10, f"${quote_data['total']:,}", border=1, align='R')
        pdf.ln()
        
        # Add validity
        pdf.ln(10)
        pdf.cell(200, 10, txt=f"Valid until: {quote_data['valid_until'][:10]}", ln=1)
        
        # Save to uploads folder
        upload_folder = os.path.join(current_app.root_path, 'instance', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = f"quote_{uuid.uuid4().hex}.pdf"
        filepath = os.path.join(upload_folder, filename)
        pdf.output(filepath)
        
        return f"/uploads/{filename}"
        
    except Exception as e:
        current_app.logger.error(f"PDF generation error: {str(e)}")
        return None
    
@quote_bp.route('/instance/uploads/<filename>')
def serve_pdf(filename):
    """Serve generated PDF files from the uploads directory"""
    try:
        upload_folder = os.path.join(current_app.root_path, 'instance', 'uploads')
        return send_from_directory(upload_folder, filename)
    except FileNotFoundError:
        current_app.logger.error(f"PDF not found: {filename}")
        return jsonify({"error": "File not found"}), 404