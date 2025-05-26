from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError
from routes.quote_routes import generate_form_quote
from models import db, ProjectPipeline, PricingForm
from datetime import datetime
import logging

pipeline_bp = Blueprint('pipeline', __name__, url_prefix='/api')

# Get all pipeline items
@pipeline_bp.route('/pipeline', methods=['GET'])
def get_pipeline_items():
    try:
        pipeline_items = ProjectPipeline.query.all()
        result = []
        for item in pipeline_items:
            item_data = item.to_dict()
            # Include the full form data
            if item.pricing_form:
                item_data['form_data'] = item.pricing_form.to_dict()
            result.append(item_data)
        
        return jsonify(result), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error"}), 500

# Update pipeline item stage
@pipeline_bp.route('/pipeline/<int:item_id>', methods=['PUT'])
def update_pipeline_item(item_id):
    try:
        data = request.get_json()
        item = ProjectPipeline.query.get(item_id)
        
        if not item:
            return jsonify({"error": "Pipeline item not found"}), 404
            
        # Track if stage is changing to "Quote Generated"
        stage_changing_to_quote = (
            'current_stage' in data and 
            data['current_stage'] == 'Quote Generated' and 
            item.current_stage != 'Quote Generated'
        )
            
        # Update stage
        if 'current_stage' in data:
            item.current_stage = data['current_stage']
            
        # Update other fields if provided
        if 'notes' in data:
            item.notes = data['notes']
        if 'quote_amount' in data:
            item.quote_amount = data['quote_amount']
        if 'contract_amount' in data:
            item.contract_amount = data['contract_amount']
        if 'delivery_date' in data:
            item.delivery_date = datetime.fromisoformat(data['delivery_date'])
            
        # If moving to Quote Generated stage and no quote exists, generate one
        if stage_changing_to_quote and not item.pricing_form.quote_total:
            # Generate quote automatically
            quote_result = generate_form_quote(item.pricing_form.id)
            if not isinstance(quote_result, tuple):  # If successful
                item.quote_amount = quote_result['total']
            
        # Update change log
        if 'current_stage' in data:
            change_log = item.change_log or []
            change_log.append({
                'stage': data['current_stage'],
                'changed_at': datetime.utcnow().isoformat(),
                'changed_by': data.get('changed_by', 'system')
            })
            item.change_log = change_log
            
        db.session.commit()
        return jsonify(item.to_dict()), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error"}), 500

# Automatically create pipeline item when form is submitted
def create_pipeline_item(form_id):
    try:
        # Check if pipeline item already exists
        existing = ProjectPipeline.query.filter_by(form_id=form_id).first()
        if existing:
            return existing
            
        # Create new pipeline item
        pipeline_item = ProjectPipeline(
            form_id=form_id,
            current_stage='Pricing Submissions'
        )
        db.session.add(pipeline_item)
        db.session.commit()
        return pipeline_item
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating pipeline item: {str(e)}")
        return None