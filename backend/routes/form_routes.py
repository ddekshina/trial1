import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from sqlalchemy.exc import SQLAlchemyError
from routes.pipeline_routes import create_pipeline_item
from models import db, PricingForm
from models.models import FormDocument
from utils.validators import validate_form_data
from utils.quote_calculator import calculate_quote 
from utils.pdf_generator import generate_quote_pdf
import logging
import uuid
import os
from datetime import datetime

# Create a Blueprint for form routes
form_bp = Blueprint('forms', __name__, url_prefix='/api')

@form_bp.route('/forms', methods=['POST'])
def submit_form():
    """
    Handle form submission
    
    ---
    tags:
      - Forms
    parameters:
      - in: body
        name: body
        schema:
          id: PricingForm
          required:
            - pricing_analyst_name
            - client_name
            - client_type
            - industry_sector
            - project_title
          properties:
            pricing_analyst_name:
              type: string
              description: Name of the pricing analyst (must start with 'pricing')
            client_name:
              type: string
              description: Name of the client
            client_type:
              type: string
              enum: [B2B, B2B2B, Private Individual]
              description: Type of client
            industry_sector:
              type: string
              description: Client's industry sector
            project_title:
              type: string
              description: Title of the project
            country:
              type: string
              description: Client's country
            currency:
              type: string
              description: Currency (auto-mapped from country if not provided)
            expected_deliverables:
              type: array
              description: Array of deliverable objects with type, quantity, and widgets
            data_sources:
              type: array
              description: Selected data sources from predefined options
            databases:
              type: array
              description: Selected databases from predefined options
    responses:
      201:
        description: Form created successfully
      400:
        description: Invalid input data
      500:
        description: Server error
    """
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        files = request.files.getlist('files')
        
        # Validate form data
        errors = validate_form_data(data)
        if errors:
            return jsonify({'success': False, 'errors': errors}), 400
        
        # Create new form entry
        new_form = PricingForm(
            # Existing fields...
            wants_demo=data.get('wantsDemo') == 'true',
            company_website=data.get('companyWebsite'),
            use_case_description=data.get('useCaseDescription'),
            reference_links=data.get('referenceLinks'),
            number_of_verticals=data.get('numberOfVerticals'),
            demo_verticals=','.join(data.get('demoVerticals', [])),
            custom_vertical=data.get('customVertical'),
            demo_scheduled_at=datetime.fromisoformat(data.get('demoScheduledAt')) if data.get('demoScheduledAt') else None,
            timezone=data.get('timezone'),
            country=data.get('country'),
            city=data.get('city'),
            meeting_link=data.get('meetingLink'),
            next_steps=data.get('nextSteps'),
            client_suggestions=data.get('clientSuggestions'),
            wants_business_analysis=data.get('wantsBusinessAnalysis') == 'true',
            problem_statement=data.get('problemStatement'),
            case_description=data.get('caseDescription'),
            stakeholders=data.get('stakeholders'),
            visualization_goal=data.get('visualizationGoal'),
            resources_status=data.get('resourcesStatus'),
            has_support_team=data.get('hasSupportTeam'),
            has_complex_math=data.get('hasComplexMath'),
            client_type_tag=data.get('clientTypeTag')
        )
        
        db.session.add(new_form)
        db.session.commit()
        
        # Handle file uploads
        if files:
            upload_folder = os.path.join(current_app.instance_path, 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            
            for file in files:
                if file.filename == '':
                    continue
                
                filename = secure_filename(file.filename)
                unique_id = uuid.uuid4().hex
                new_filename = f"{unique_id}_{filename}"
                file_path = os.path.join(upload_folder, new_filename)
                
                file.save(file_path)
                
                new_doc = FormDocument(
                    form_id=new_form.id,
                    file_path=file_path,
                    file_name=filename,
                    file_type=filename.split('.')[-1].lower()
                )
                db.session.add(new_doc)
            
            db.session.commit()
        
        return jsonify({'success': True, 'form_id': new_form.id}), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Form submission error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@form_bp.route('/forms', methods=['GET'])
def get_all_forms():
    """
    Get all form submissions
    
    ---
    tags:
      - Forms
    parameters:
      - name: page
        in: query
        type: integer
        description: Page number
        default: 1
      - name: per_page
        in: query
        type: integer
        description: Number of items per page
        default: 20
    responses:
      200:
        description: List of forms
      500:
        description: Server error
    """
    try:
        # Add pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit per_page to prevent excessive queries
        per_page = min(per_page, 100)
        
        pagination = PricingForm.query.order_by(PricingForm.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        forms = pagination.items
        
        return jsonify({
            "forms": [form.to_dict() for form in forms],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page
        }), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

@form_bp.route('/forms/<int:form_id>', methods=['GET'])
def get_form_by_id(form_id):
    """
    Get a specific form submission by ID
    
    ---
    tags:
      - Forms
    parameters:
      - name: form_id
        in: path
        type: integer
        required: true
        description: ID of the form to retrieve
    responses:
      200:
        description: Form details
      404:
        description: Form not found
      500:
        description: Server error
    """
    try:
        form = PricingForm.query.get(form_id)
        if not form:
            return jsonify({"error": "Form not found"}), 404
            
        return jsonify(form.to_dict()), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

@form_bp.route('/forms/<int:form_id>', methods=['PUT'])
def update_form(form_id):
    """
    Update a specific form submission
    
    ---
    tags:
      - Forms
    parameters:
      - name: form_id
        in: path
        type: integer
        required: true
        description: ID of the form to update
      - in: body
        name: body
        schema:
          id: PricingFormUpdate
          properties:
            pricing_analyst_name:
              type: string
            client_name:
              type: string
            client_type:
              type: string
            # ... other fields
    responses:
      200:
        description: Form updated successfully
      400:
        description: Invalid input data
      404:
        description: Form not found
      500:
        description: Server error
    """
    # Check if the request has JSON data
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    try:
        form = PricingForm.query.get(form_id)
        if not form:
            return jsonify({"error": "Form not found"}), 404
            
        data = json.loads(request.form['data'])
        
        # Validate input data
        is_valid, result = validate_form_data(data)
        if not is_valid:
            return jsonify({"error": "Validation failed", "details": result}), 400
        
        # Update form fields from validated data
        for key, value in result.items():
            setattr(form, key, value)
            
        db.session.commit()
        
        return jsonify({
            "message": "Form updated successfully",
            "form": form.to_dict()
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

@form_bp.route('/forms/<int:form_id>', methods=['DELETE'])
def delete_form(form_id):
    """
    Delete a specific form submission
    
    ---
    tags:
      - Forms
    parameters:
      - name: form_id
        in: path
        type: integer
        required: true
        description: ID of the form to delete
    responses:
      200:
        description: Form deleted successfully
      404:
        description: Form not found
      500:
        description: Server error
    """
    try:
        form = PricingForm.query.get(form_id)
        if not form:
            return jsonify({"error": "Form not found"}), 404
            
        db.session.delete(form)
        db.session.commit()
        
        return jsonify({
            "message": "Form deleted successfully",
            "form_id": form_id
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

# Add a route for form search
@form_bp.route('/forms/search', methods=['GET'])
def search_forms():
    """
    Search forms by client name or project title
    
    ---
    tags:
      - Forms
    parameters:
      - name: q
        in: query
        type: string
        description: Search query
      - name: page
        in: query
        type: integer
        description: Page number
        default: 1
      - name: per_page
        in: query
        type: integer
        description: Number of items per page
        default: 20
    responses:
      200:
        description: Search results
      500:
        description: Server error
    """
    try:
        query = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit per_page to prevent excessive queries
        per_page = min(per_page, 100)
        
        # Build search query
        search_query = PricingForm.query
        
        if query:
            search_query = search_query.filter(
                (PricingForm.client_name.ilike(f'%{query}%')) | 
                (PricingForm.project_title.ilike(f'%{query}%')) |
                (PricingForm.pricing_analyst_name.ilike(f'%{query}%'))
            )
        
        # Execute query with pagination
        pagination = search_query.order_by(PricingForm.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        forms = pagination.items
        
        return jsonify({
            "forms": [form.to_dict() for form in forms],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page,
            "query": query
        }), 200
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

# Add route for getting available options/constants
@form_bp.route('/forms/options', methods=['GET'])
def get_form_options():
    """
    Get available form options and constants
    
    ---
    tags:
      - Forms
    responses:
      200:
        description: Available form options
    """
    options = {
        "client_types": ["B2B", "B2B2B", "Private Individual"],
        "volume_options": ["Small (<1M)", "Medium (1M–10M)", "Large (10M+)"],
        "engagement_types": ["One-time Project", "Monthly Retainer", "Subscription"],
        "support_plans": ["Basic", "Priority", "Dedicated Account Manager"],
        "data_sources": ["Excel", "CSV", "XML", "XLS", "XLSX", "JSON", "API", "Database", "Cloud Storage"],
        "databases": ["MongoDB", "MySQL", "Microsoft SQL", "Snowflake", "PostgreSQL", "Airtable"],
        "deliverable_types": ["Dashboard", "Charts/Graphs", "KPI Reporting", "Interactive Reports", "Embedded Analytics", "Infographics", "White-labeled Portals"],
        "target_audiences": ["Internal Teams", "External Clients", "Partners/Vendors"],
        "integration_types": ["CRM (Salesforce)", "ERP (SAP)", "BI Tools (Power BI, Tableau)", "Custom APIs"],
        "interactivity_options": ["Filtering", "Drill-down", "Real-time Updates", "Mobile Responsive"],
        "access_levels": ["Admin", "Editor", "Viewer"],
        "customization_options": ["Branding", "Custom Colors", "Layout Customization"],
        "delivery_models": ["Cloud-hosted", "On-premise", "Hybrid"],
        "countries": list({
            "United States", "Canada", "United Kingdom", "Germany", "France", 
            "Spain", "Italy", "Netherlands", "Belgium", "Austria", "Japan", 
            "China", "India", "Australia", "Brazil", "Mexico", "Switzerland",
            "Sweden", "Norway", "Denmark", "South Korea", "Singapore", 
            "Hong Kong", "New Zealand", "South Africa", "Russia", "Turkey",
            "Saudi Arabia", "United Arab Emirates", "Israel", "Poland",
            "Czech Republic", "Hungary", "Thailand", "Malaysia", "Indonesia",
            "Philippines", "Vietnam", "Argentina", "Chile", "Colombia", "Peru",
            "Egypt", "Nigeria", "Kenya", "Ghana", "Morocco", "Pakistan",
            "Bangladesh", "Sri Lanka", "Nepal"
        })
    }
    
    return jsonify(options), 200

@form_bp.route('/forms/<int:form_id>/generate-quote', methods=['POST'])
def generate_quote(form_id):
    form = PricingForm.query.get(form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    # Calculate quote
    quote_data = calculate_quote(form.to_dict())
    
    # Generate PDF
    pdf_url = generate_quote_pdf(quote_data)
    
    # Update form with quote
    form.quote_total = quote_data['total']
    form.quote_breakdown = quote_data['breakdown']
    form.quote_pdf_url = pdf_url
    db.session.commit()
    
    return jsonify({
        "quote": quote_data,
        "pdf_url": pdf_url
    }), 200