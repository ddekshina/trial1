import os
import logging
import pathlib
from flask import Flask, jsonify, request, current_app
from flask_cors import CORS
from config import config
from models import db
from routes.form_routes import form_bp
from sqlalchemy import text
from flask_migrate import Migrate

migrate = Migrate()

def configure_logging(app):
    """Configure application logging"""
    if not app.debug:
        # Create handlers
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        
        # Create formatters
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        # Add handlers to app and werkzeug loggers
        app.logger.addHandler(handler)
        logging.getLogger('werkzeug').addHandler(handler)

def create_app(config_name='default'):
    """
    Create and configure the Flask application
    
    Args:
        config_name (str): Configuration environment to use
        
    Returns:
        Flask: Configured Flask app
    """
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config[config_name])
    
    # Configure logging
    configure_logging(app)
    
    # Ensure the instance folder exists with proper permissions
    try:
        os.makedirs(app.instance_path, exist_ok=True)
        app.logger.info(f"Instance path is: {app.instance_path}")
    except Exception as e:
        app.logger.error(f"Error creating instance folder: {str(e)}")
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Setup CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
    # Register blueprints
    app.register_blueprint(form_bp)
    
    # Create database tables
    with app.app_context():
        try:
            # Check if database directory exists for SQLite
            db_uri = app.config['SQLALCHEMY_DATABASE_URI']
            if db_uri.startswith('sqlite:///'):
                db_path = db_uri.replace('sqlite:///', '')
                if not db_path.startswith('/'):  # Relative path
                    # If it's a relative path, make sure parent directory exists
                    db_dir = os.path.dirname(os.path.join(app.instance_path, db_path))
                    if db_dir:
                        os.makedirs(db_dir, exist_ok=True)
                        app.logger.info(f"Ensured database directory exists at: {db_dir}")
            
            db.create_all()
            app.logger.info('Database tables created or verified')
        except Exception as e:
            app.logger.error(f"Error creating database tables: {str(e)}")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        app.logger.info(f"Resource not found: {request.path}")
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Internal server error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        app.logger.info(f"Method not allowed: {request.method} {request.path}")
        return jsonify({"error": "Method not allowed"}), 405
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
            current_app.logger.info(f"Health check using DB URI: {db_uri}")
            db.session.execute(text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            current_app.logger.error(f"Database health check failed: {str(e)}")
            db_status = "disconnected"
            
        return jsonify({
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "database": db_status,
            "version": "1.0.0"
        }), 200 if db_status == "connected" else 503

    
    # API documentation route
    @app.route('/api/docs', methods=['GET'])
    def api_docs():
        """Basic API documentation endpoint"""
        return jsonify({
            "api_version": "1.0.0",
            "endpoints": {
                "GET /api/health": "Health check endpoint",
                "GET /api/forms": "Get all forms with pagination",
                "POST /api/forms": "Submit a new form",
                "GET /api/forms/{id}": "Get a specific form by ID",
                "PUT /api/forms/{id}": "Update a specific form",
                "DELETE /api/forms/{id}": "Delete a specific form",
                "GET /api/forms/search": "Search forms by client name or project title"
            },
            "documentation_url": "/api/docs"
        })
    
    app.logger.info(f'Flask app created with {config_name} configuration')
    
    return app


if __name__ == '__main__':
    # Determine environment from environment variable or default to development
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Set the absolute path to the instance folder
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    print(f"Instance directory: {instance_path}")
    
    # Create app with appropriate configuration
    app = create_app(env)
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port)