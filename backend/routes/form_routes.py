from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError
from routes.pipeline_routes import create_pipeline_item
from models import db, PricingForm
from utils.validators import validate_form_data
import logging

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
    # Check if the request has JSON data
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # Validate input data
    is_valid, result = validate_form_data(data)
    if not is_valid:
        return jsonify({"error": "Validation failed", "details": result}), 400
    
    try:
        # Create new form entry
        form = PricingForm.from_dict(result)
        db.session.add(form)
        db.session.commit()  # Need to commit first to get form.id
        
        # Create pipeline item
        pipeline_item = create_pipeline_item(form.id)
        if not pipeline_item:
            current_app.logger.warning(f"Failed to create pipeline item for form {form.id}")
        
        return jsonify({
            "message": "Form submitted successfully",
            "form_id": form.id,
            "pipeline_id": pipeline_item.id if pipeline_item else None,
            "form": form.to_dict()
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Unexpected error occurred"}), 500

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
            
        data = request.get_json()
        
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