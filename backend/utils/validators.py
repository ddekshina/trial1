import re
from datetime import datetime
from marshmallow import Schema, fields, validate, ValidationError, validates, pre_load, post_load
import json

VALID_SUBSCRIPTION_PLANS = [
  'Starter Lite (Monthly)',
  'Starter Growth(Monthly)',
  'Starter Scale (Monthly)',
  'Enterprise Lite (Monthly)',
  'Enterprise Growth (Monthly)',
  'Enterprise Scale (Monthly)',
  'Starter Lite (Annual)',
  'Starter Growth(Annual)',
  'Starter Scale (Annual)',
  'Enterprise Lite (Annual)',
  'Enterprise Growth (Annual)',
  'Enterprise Scale (Annual)',
  'Generative BI Developer'
];
# Country to currency mapping
COUNTRY_CURRENCY_MAP = {
    'United States': 'USD',
    'Canada': 'CAD',
    'United Kingdom': 'GBP',
    'Germany': 'EUR',
    'France': 'EUR',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'Netherlands': 'EUR',
    'Belgium': 'EUR',
    'Austria': 'EUR',
    'Japan': 'JPY',
    'China': 'CNY',
    'India': 'INR',
    'Australia': 'AUD',
    'Brazil': 'BRL',
    'Mexico': 'MXN',
    'Switzerland': 'CHF',
    'Sweden': 'SEK',
    'Norway': 'NOK',
    'Denmark': 'DKK',
    'South Korea': 'KRW',
    'Singapore': 'SGD',
    'Hong Kong': 'HKD',
    'New Zealand': 'NZD',
    'South Africa': 'ZAR',
    'Russia': 'RUB',
    'Turkey': 'TRY',
    'Saudi Arabia': 'SAR',
    'United Arab Emirates': 'AED',
    'Israel': 'ILS',
    'Poland': 'PLN',
    'Czech Republic': 'CZK',
    'Hungary': 'HUF',
    'Thailand': 'THB',
    'Malaysia': 'MYR',
    'Indonesia': 'IDR',
    'Philippines': 'PHP',
    'Vietnam': 'VND',
    'Argentina': 'ARS',
    'Chile': 'CLP',
    'Colombia': 'COP',
    'Peru': 'PEN',
    'Egypt': 'EGP',
    'Nigeria': 'NGN',
    'Kenya': 'KES',
    'Ghana': 'GHS',
    'Morocco': 'MAD',
    'Pakistan': 'PKR',
    'Bangladesh': 'BDT',
    'Sri Lanka': 'LKR',
    'Nepal': 'NPR'
}

class PricingFormSchema(Schema):
    """
    Schema for validating Pricing Analyst Form submissions
    """
    # Pricing Analyst Info
    pricing_analyst_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    
    # Client Information
    client_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    client_type = fields.String(required=True, validate=validate.OneOf(['B2B', 'B2B2B', 'Private Individual']))
    industry_sector = fields.String(required=True, validate=validate.Length(min=1, max=255))
    company_size = fields.Integer(validate=validate.Range(min=1), allow_none=True)
    annual_revenue = fields.Float(validate=validate.Range(min=0), allow_none=True)
    country = fields.String(validate=validate.Length(max=100), allow_none=True)
    city = fields.String(validate=validate.Length(max=100), allow_none=True)
    currency = fields.String(validate=validate.Length(max=10), allow_none=True)
    primary_contact_name = fields.String(validate=validate.Length(max=255), allow_none=True)
    email = fields.Email(allow_none=True)
    phone_number = fields.String(validate=validate.Length(max=50), allow_none=True)
    
    # BI Questions
    has_bi_team = fields.Boolean(allow_none=True)
    wants_to_use_tool_with_bi = fields.Boolean(allow_none=True)
    will_provide_bi_projects = fields.Boolean(allow_none=True)
    
    # Project Overview
    project_title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    project_description = fields.String(allow_none=True)
    business_objective = fields.String(allow_none=True)
    expected_deliverables = fields.Raw(allow_none=True)  # Can be string or list of objects
    target_audience = fields.Raw(allow_none=True)  # Can be string or list
    number_of_integrations = fields.Integer(validate=validate.Range(min=0), allow_none=True)
    number_of_widgets = fields.Integer(validate=validate.Range(min=0), allow_none=True)
    subscription_plan = fields.String(
        validate=validate.OneOf(VALID_SUBSCRIPTION_PLANS),
        required=True
    )
    # Technical Scope
    data_sources = fields.Raw(allow_none=True)  # Can be string or list
    volume_of_data = fields.String(validate=validate.OneOf(['Small (<1M)', 'Medium (1M–10M)', 'Large (10M+)']), allow_none=True)
    required_integrations = fields.Raw(allow_none=True)  # Can be string or list
    api_name = fields.String(validate=validate.Length(max=255), allow_none=True)
    api_available = fields.Boolean(allow_none=True)
    api_documented = fields.Boolean(allow_none=True)
    api_test_kit_link = fields.String(allow_none=True)
    databases = fields.Raw(allow_none=True)  # Can be string or list
    cloud_storage_name = fields.String(validate=validate.Length(max=255), allow_none=True)
    google_spreadsheet = fields.String(validate=validate.Length(max=500), allow_none=True)
    
    # Features & Functionalities
    interactivity_needed = fields.Raw(allow_none=True)  # Can be string or list
    user_access_levels = fields.Raw(allow_none=True)  # Can be string or list
    customization_needs = fields.Raw(allow_none=True)  # Can be string or list
    
    # Pricing Factors
    engagement_type = fields.String(validate=validate.OneOf(['One-time Project', 'Monthly Retainer', 'Subscription']), allow_none=True)
    start_date = fields.Date(allow_none=True)
    end_date = fields.Date(allow_none=True)
    delivery_model = fields.Raw(allow_none=True)  # Can be string or list
    support_plan_required = fields.String(validate=validate.OneOf(['Basic', 'Priority', 'Dedicated Account Manager']), allow_none=True)
    
    # Competitive / Value-based Inputs
    budget_range = fields.Float(validate=validate.Range(min=0), allow_none=True)
    competitor_comparison = fields.String(allow_none=True)
    roi_expectations = fields.String(allow_none=True)
    tiered_pricing_needed = fields.Boolean(allow_none=True)
    tiered_pricing_details = fields.String(allow_none=True)
    
    # Analyst Notes & Recommendations
    internal_analyst_notes = fields.String(allow_none=True)
    suggested_pricing_model = fields.String(allow_none=True)
    risk_factors = fields.String(allow_none=True)
    suggested_next_steps = fields.String(allow_none=True)
    
    # Integration Details
    crm_api_documented = fields.Boolean(allow_none=True)
    erp_api_documented = fields.Boolean(allow_none=True)
    bi_tools_api_available = fields.Boolean(allow_none=True)
    apis_api_available = fields.Boolean(allow_none=True)
    apis_test_kit_link = fields.String(allow_none=True)
    
    @pre_load
    def process_json_fields(self, data, **kwargs):
        """Process JSON fields that might come as strings and handle currency mapping"""
        json_fields = ['expected_deliverables', 'target_audience', 'data_sources', 
                      'required_integrations', 'interactivity_needed', 'user_access_levels', 
                      'customization_needs', 'delivery_model', 'databases']
        
        for field in json_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    # If it's not valid JSON, leave as string
                    pass
        
        # Auto-map currency based on country
        if 'country' in data and data['country'] and not data.get('currency'):
            data['currency'] = COUNTRY_CURRENCY_MAP.get(data['country'], 'USD')
                    
        return data
    
    @validates('pricing_analyst_name')
    def validate_pricing_analyst_name(self, value):
        """Validate that pricing analyst name starts with 'pricing'"""
        if not value:
            raise ValidationError('Pricing analyst name is required')
        
        if not value.lower().startswith('pricing'):
            raise ValidationError('Pricing analyst name must start with "pricing"')
        
        return value
    
    @validates('expected_deliverables')
    def validate_expected_deliverables(self, value):
        """Validate deliverables structure"""
        if not value:
            return value
            
        if isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    # Validate structure for new format with type, quantity, widgets
                    if 'type' not in item:
                        raise ValidationError('Each deliverable must have a "type" field')
                    if 'quantity' in item and not isinstance(item['quantity'], int):
                        raise ValidationError('Quantity must be an integer')
                    if 'widgets' in item and not isinstance(item['widgets'], int):
                        raise ValidationError('Widgets must be an integer')
        
        return value
    
    @validates('subscription_plan')
    def validate_subscription_plan(self, value):
        """Validate subscription plan against business rules"""
        if not value:
            raise ValidationError("Subscription plan is required")
        
        if value not in VALID_SUBSCRIPTION_PLANS:
            raise ValidationError(
                f"Invalid subscription plan. Valid options are: {', '.join(VALID_SUBSCRIPTION_PLANS)}"
            )
        
        # Add any additional business rules here
        if value == 'Enterprise (Annual)' and not self.context.get('company_size', 0) >= 500:
            raise ValidationError("Enterprise plan requires company size of 500+ employees")
        
        if value == 'Custom Plan' and not self.context.get('has_sales_contact', False):
            raise ValidationError("Custom plans require sales contact")
        
        @validates('data_sources')
        def validate_data_sources(self, value):
            """Validate data sources options"""
            if not value:
                return value
                
            valid_options = ['Excel', 'CSV', 'XML', 'XLS', 'XLSX', 'JSON', 'API', 'Database', 'Cloud Storage']
            
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, str) and item not in valid_options:
                        raise ValidationError(f'Invalid data source: {item}. Valid options are: {", ".join(valid_options)}')
            
            return value
    
    @validates('databases')
    def validate_databases(self, value):
        """Validate database options"""
        if not value:
            return value
            
        valid_databases = ['MongoDB', 'MySQL', 'Microsoft SQL', 'Snowflake', 'PostgreSQL', 'Airtable']
        
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item not in valid_databases:
                    raise ValidationError(f'Invalid database: {item}. Valid options are: {", ".join(valid_databases)}')
        
        return value
    
    @validates('start_date')
    def validate_start_date(self, value):
        if not value:
            return value
            
        if isinstance(value, str):
            try:
                if 'T' in value:
                    value = value.split('T')[0]  # Extract date part from ISO format
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise ValidationError('Invalid date format. Please use YYYY-MM-DD')
        
        return value
    
    @validates('end_date')
    def validate_end_date(self, value):
        if not value:
            return value
            
        if isinstance(value, str):
            try:
                if 'T' in value:
                    value = value.split('T')[0]  # Extract date part from ISO format
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise ValidationError('Invalid date format. Please use YYYY-MM-DD')
                
        # Validate end_date is after start_date if both are provided
        if 'start_date' in self.context and self.context['start_date'] and value:
            start_date = self.context['start_date']
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date.split('T')[0], '%Y-%m-%d').date()
            
            end_date = value
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date.split('T')[0], '%Y-%m-%d').date()
                
            if end_date < start_date:
                raise ValidationError('End date must be after start date')
        
        return value
        
    @validates('email')
    def validate_email(self, value):
        if not value:
            return value
            
        # Better email regex pattern
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        if not re.match(pattern, value):
            raise ValidationError('Invalid email address')
        
        return value

def validate_form_data(data):
    """
    Validate form data using the schema
    
    Args:
        data (dict): Form data to validate
        
    Returns:
        tuple: (is_valid, errors or validated_data)
    """
    # Add context for cross-field validation
    context = {
        'company_size': data.get('company_size'),
        'has_sales_contact': data.get('primary_contact_name') is not None
    }
    
    schema = PricingFormSchema(context=context)
    
    if 'start_date' in data:
        context['start_date'] = data['start_date']
        
    schema = PricingFormSchema(context=context)
    try:
        result = schema.load(data)
        
        # Ensure JSON fields are properly formatted for storage
        json_fields = ['expected_deliverables', 'target_audience', 'data_sources', 
                      'required_integrations', 'interactivity_needed', 'user_access_levels', 
                      'customization_needs', 'delivery_model', 'databases']
        
        for field in json_fields:
            if field in result and result[field] is not None:
                if not isinstance(result[field], str):
                    result[field] = json.dumps(result[field])
                    
        return True, result
    except ValidationError as err:
        return False, err.messages