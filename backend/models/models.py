from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class PricingForm(db.Model):
    
    """
    Main model for the Pricing Analyst Form
    """
    __tablename__ = 'pricing_forms'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Pricing Analyst Info
    pricing_analyst_name = db.Column(db.String(255), nullable=False)
    
    # Client Information
    client_name = db.Column(db.String(255), nullable=False)
    client_type = db.Column(db.String(50), nullable=False)  # B2B, B2B2B, Private Individual
    industry_sector = db.Column(db.String(255), nullable=False)
    company_size = db.Column(db.Integer, nullable=True)
    annual_revenue = db.Column(db.Float, nullable=True)
    country = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    currency = db.Column(db.String(10), nullable=True)
    primary_contact_name = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(50), nullable=True)
    
    # BI Questions
    has_bi_team = db.Column(db.Boolean, default=False, nullable=True)
    wants_to_use_tool_with_bi = db.Column(db.Boolean, default=False, nullable=True)
    will_provide_bi_projects = db.Column(db.Boolean, default=False, nullable=True)
    
    # Project Overview
    project_title = db.Column(db.String(255), nullable=False)
    project_description = db.Column(db.Text, nullable=True)
    business_objective = db.Column(db.Text, nullable=True)
    expected_deliverables = db.Column(db.Text, nullable=True)  # Stored as JSON string
    subscription_plan = db.Column(db.String(50), nullable=False)
    target_audience = db.Column(db.Text, nullable=True)  # Stored as JSON string
    number_of_integrations = db.Column(db.Integer, nullable=True)
    number_of_widgets = db.Column(db.Integer, nullable=True)
    
    # Technical Scope
    data_sources = db.Column(db.Text, nullable=True)  # Stored as JSON string
    volume_of_data = db.Column(db.String(50), nullable=True)  # Small, Medium, Large
    required_integrations = db.Column(db.Text, nullable=True)  # Stored as JSON string
    api_name = db.Column(db.String(255), nullable=True)
    api_available = db.Column(db.Boolean, default=False, nullable=True)
    api_documented = db.Column(db.Boolean, default=False, nullable=True)
    api_test_kit_link = db.Column(db.Text, nullable=True)
    databases = db.Column(db.Text, nullable=True)  # Stored as JSON string
    cloud_storage_name = db.Column(db.String(255), nullable=True)
    google_spreadsheet = db.Column(db.String(500), nullable=True)
    
    # Features & Functionalities
    interactivity_needed = db.Column(db.Text, nullable=True)  # Stored as JSON string
    user_access_levels = db.Column(db.Text, nullable=True)  # Stored as JSON string
    customization_needs = db.Column(db.Text, nullable=True)  # Stored as JSON string
    
    # Pricing Factors
    engagement_type = db.Column(db.String(50), nullable=True)  # One-time Project, Monthly Retainer, Subscription
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    delivery_model = db.Column(db.Text, nullable=True)  # Stored as JSON string
    support_plan_required = db.Column(db.String(50), nullable=True)  # Basic, Priority, Dedicated Account Manager
    
    # Competitive / Value-based Inputs
    budget_range = db.Column(db.Float, nullable=True)
    competitor_comparison = db.Column(db.Text, nullable=True)
    roi_expectations = db.Column(db.Text, nullable=True)
    tiered_pricing_needed = db.Column(db.Boolean, default=False, nullable=True)
    tiered_pricing_details = db.Column(db.Text, nullable=True)
    
    # Analyst Notes & Recommendations
    internal_analyst_notes = db.Column(db.Text, nullable=True)
    suggested_pricing_model = db.Column(db.Text, nullable=True)
    risk_factors = db.Column(db.Text, nullable=True)
    suggested_next_steps = db.Column(db.Text, nullable=True)
    
    # Integration Details
    crm_api_documented = db.Column(db.Boolean, default=False, nullable=True)
    erp_api_documented = db.Column(db.Boolean, default=False, nullable=True)
    bi_tools_api_available = db.Column(db.Boolean, default=False, nullable=True)
    apis_api_available = db.Column(db.Boolean, default=False, nullable=True)
    apis_test_kit_link = db.Column(db.Text, nullable=True)

    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        result = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        
        # Convert datetime objects to strings
        if self.created_at:
            result['created_at'] = self.created_at.isoformat()
        if self.updated_at:
            result['updated_at'] = self.updated_at.isoformat()
        if self.start_date:
            result['start_date'] = self.start_date.isoformat()
        if self.end_date:
            result['end_date'] = self.end_date.isoformat()
            
        # Parse JSON strings back to lists/objects
        json_fields = ['expected_deliverables', 'target_audience', 'data_sources', 
                      'required_integrations', 'interactivity_needed', 'user_access_levels', 
                      'customization_needs', 'delivery_model', 'databases']
                      
        for field in json_fields:
            if result[field]:
                try:
                    result[field] = json.loads(result[field])
                except json.JSONDecodeError:
                    # Keep as string if parsing fails
                    pass
                    
        return result
    
    @staticmethod
    def from_dict(data):
        """Create a new model instance from dictionary data"""
        # Create a copy to avoid modifying the original
        form_data = data.copy()
        
        # Convert lists/objects to JSON strings for storage
        json_fields = ['expected_deliverables', 'target_audience', 'data_sources', 
                     'required_integrations', 'interactivity_needed', 'user_access_levels', 
                     'customization_needs', 'delivery_model', 'databases']
                     
        for field in json_fields:
            if field in form_data and form_data[field] is not None:
                if not isinstance(form_data[field], str):
                    form_data[field] = json.dumps(form_data[field])
                    
        # Handle date fields
        date_fields = ['start_date', 'end_date']
        for field in date_fields:
            if field in form_data and form_data[field] and isinstance(form_data[field], str):
                try:
                    # Try ISO format first
                    form_data[field] = datetime.fromisoformat(form_data[field].split('T')[0]).date()
                except ValueError:
                    # Try common date formats if ISO format fails
                    try:
                        form_data[field] = datetime.strptime(form_data[field], '%Y-%m-%d').date()
                    except ValueError:
                        form_data[field] = None
        
        return PricingForm(**form_data)
    
class ProjectPipeline(db.Model):
    __tablename__ = 'project_pipeline'
    
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('pricing_forms.id'), nullable=False)
    current_stage = db.Column(db.String(50), nullable=False, default='Pricing Submissions')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    quote_amount = db.Column(db.Float, nullable=True)
    contract_amount = db.Column(db.Float, nullable=True)
    delivery_date = db.Column(db.DateTime, nullable=True)
    change_log = db.Column(db.JSON, nullable=True)  # Stores change history
    
    # Relationship
    pricing_form = db.relationship('PricingForm', backref='pipeline')
    
    def to_dict(self):
        return {
            'id': self.id,
            'form_id': self.form_id,
            'current_stage': self.current_stage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes,
            'quote_amount': self.quote_amount,
            'contract_amount': self.contract_amount,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'change_log': self.change_log,
            'project_details': self.pricing_form.to_dict() if self.pricing_form else None
        }
