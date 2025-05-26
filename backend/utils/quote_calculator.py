from datetime import datetime, timedelta

def calculate_db_table_cost(record_count):
    if record_count < 1000:
        return 40
    elif 1000 <= record_count < 10000:
        return 100
    elif 10000 <= record_count < 100000:
        return 200
    elif 100000 <= record_count < 1000000:
        return 300
    elif 1000000 <= record_count < 10000000:
        return 300
    else:  # > 10,000,000
        return 700

def calculate_widget_cost(num_widgets):
    return num_widgets * 20  # $20 per widget

def calculate_data_file_cost(data_sources):
    total_size = 0
    cost = 0
    
    # First check if total size exceeds 30MB
    for file in data_sources:
        total_size += file.get('size_mb', 0)
    
    if total_size > 30:
        raise ValueError("Total file size exceeds 30MB limit")
    
    # Calculate cost for each file type
    for file in data_sources:
        if file['type'] in ['csv', 'xml', 'xls', 'xlsx', 'json']:
            cost += 40
    
    return cost

def calculate_database_cost(db_sources):
    cost = 0
    for db in db_sources:
        db_type = db.get('type')
        for table in db.get('tables_info', []):
            cost += calculate_db_table_cost(table.get('record_count', 0))
    return cost

def calculate_integration_cost(integrations):
    cost = 0
    for integration in integrations:
        # Base API cost
        cost += 400
        
        # DB integration cost
        cost += 400
        
        # Backend deployment
        cost += 400
        
        # Add DB hosting cost if applicable
        if integration.get('db_tables'):
            for table in integration['db_tables']:
                cost += calculate_db_table_cost(table.get('record_count', 0))
    return cost

def calculate_features_cost(drilldowns_per_widget, num_widgets):
    return drilldowns_per_widget * num_widgets * 20

def calculate_branding_cost(data):
    cost = 0
    if data.get('include_logo'):
        cost += 40
        
    num_widgets = data.get('num_widgets', 0)
    num_dashboards = data.get('num_dashboards', 0)
    
    # Widget brand color
    if data.get('widget_brand_color'):
        cost += num_widgets * 20
    
    # Dashboard brand color
    if data.get('dashboard_brand_color'):
        cost += num_dashboards * 20
    
    # Widget font style
    if data.get('widget_font_style'):
        cost += num_widgets * 20
    
    # Dashboard name style
    if data.get('dashboard_name_style'):
        cost += num_dashboards * 20
    
    # Localization
    if data.get('localize_widgets'):
        cost += num_widgets * 20
    if data.get('localize_headings'):
        cost += num_dashboards * 20
    
    return cost

def calculate_support_cost(data):
    plan = data.get('support_plan', 'basic')
    if plan == 'priority':
        return 40 * data.get('support_hours', 0)
    elif plan == 'manager_20hr':
        return 400
    elif plan == 'manager_40hr':
        return 800
    elif plan == 'manager_contract':
        return 1200 * 6  # 6-month contract
    return 0

def calculate_bi_developer_cost(data):
    dev_level = data.get('bi_developer_level')
    months = data.get('bi_dev_months', 1)
    rates = {
        'entry': 800,
        'mid': 1200,
        'senior': 2000,
        'advanced': 3000
    }
    return rates.get(dev_level, 0) * months

def calculate_quote(form_data):
    try:
        breakdown = {
            'widgets': calculate_widget_cost(form_data.get('num_widgets', 0)),
            'data_files': calculate_data_file_cost(form_data.get('data_sources', [])),
            'database_tables': calculate_database_cost(form_data.get('database_sources', [])),
            'integrations': calculate_integration_cost(form_data.get('integrations', [])),
            'features': calculate_features_cost(
                form_data.get('drilldowns_per_widget', 0),
                form_data.get('num_widgets', 0)
            ),
            'branding': calculate_branding_cost(form_data),
            'support': calculate_support_cost(form_data),
            'bi_developer': calculate_bi_developer_cost(form_data)
        }

        total = sum(breakdown.values())

        return {
            'success': True,
            'total': total,
            'breakdown': breakdown,
            'currency': 'USD',
            'valid_until': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'notes': 'Server and DB hosting costs not included in this estimate'
        }
    
    except ValueError as e:
        return {
            'success': False,
            'error': str(e)
        }